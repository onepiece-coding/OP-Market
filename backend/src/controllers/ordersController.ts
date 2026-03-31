import { Request, Response } from "express";
import createError from "http-errors";
import asyncHandler from "express-async-handler";
import { prismaClient } from "../db/prisma.js";
import { createPayPalOrder } from "../services/paypalService.js";

type PaymentMethod = "CASH_ON_DELIVERY" | "PAYPAL";

type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELED";

type OrderWhere = {
  userId?: number;
  status?: OrderStatus;
};

const isOrderStatus = (value: unknown): value is OrderStatus => {
  return (
    value === "PENDING" ||
    value === "ACCEPTED" ||
    value === "OUT_FOR_DELIVERY" ||
    value === "DELIVERED" ||
    value === "CANCELED"
  );
};

/**
 * @desc   Create Order
 * @route  api/orders
 * @method POST
 * @access private
 */
export const createOrderCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const paymentMethod = req.body.paymentMethod as PaymentMethod;
    const userId = req.user!.id;

    const { order, amount } = await prismaClient.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw createError(400, "Cart is empty");
      }

      if (!req.user!.defaultShippingAddress) {
        throw createError(400, "No default shipping address set");
      }

      const address = await tx.address.findUnique({
        where: { id: req.user!.defaultShippingAddress },
      });

      if (!address || address.userId !== userId) {
        throw createError(400, "Invalid shipping address");
      }

      const formattedAddress = [
        address.lineOne,
        address.lineTwo,
        address.city,
        `${address.country}-${address.pincode}`,
      ]
        .filter(Boolean)
        .join(", ");

      const amount = cartItems.reduce((sum, cart) => {
        return sum + cart.quantity * Number(cart.product.price);
      }, 0);

      const order = await tx.order.create({
        data: {
          userId,
          netAmount: amount,
          address: formattedAddress,
          paymentMethod,
          paymentStatus: "PENDING",
          products: {
            create: cartItems.map((cart) => ({
              productId: cart.productId,
              quantity: cart.quantity,
            })),
          },
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
        },
      });

      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return { order, amount };
    });

    if (paymentMethod === "CASH_ON_DELIVERY") {
      res.status(201).json({
        order,
      });
      return;
    }

    try {
      const paypal = await createPayPalOrder(Number(amount));

      const updatedOrder = await prismaClient.order.update({
        where: { id: order.id },
        data: {
          paymentProviderId: paypal.paypalOrderId,
        },
      });

      res.status(201).json({
        order: updatedOrder,
        approvalUrl: paypal.approvalUrl,
        providerOrderId: paypal.paypalOrderId,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      await prismaClient.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });

      res.status(201).json({
        order,
        warning:
          "Order was created, but PayPal checkout could not be started. You can retry later or use cash on delivery.",
      });
    }
  },
);

/**
 * @desc   List User Orders
 * @route  api/orders
 * @method GET
 * @access private
 */
export const listOrdersCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const orders = await prismaClient.order.findMany({
      where: {
        userId: req.user!.id,
      },
    });

    res.status(200).json(orders);
  },
);

/**
 * @desc   Cancel Order
 * @route  api/orders/:id/cancel
 * @method PUT
 * @access private
 */
export const cancelOrderCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    await prismaClient.$transaction(async (tx) => {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) throw createError(400, "Invalid order id");

      const updateResult = await tx.order.updateMany({
        where: { id, userId: req.user!.id },
        data: { status: "CANCELED" },
      });

      if (!updateResult.count) throw createError(404, "Order not found");

      await tx.orderEvent.create({
        data: { orderId: id, status: "CANCELED" },
      });

      const order = await tx.order.findUnique({ where: { id } });
      res.status(200).json(order);
    });
  },
);

/**
 * @desc   Get Order By Id
 * @route  api/orders/:id
 * @method GET
 * @access private
 */
export const getOrderByIdCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw createError(400, "Invalid order id");

    const isAdmin = req.user?.role === "ADMIN";

    const order = isAdmin
      ? await prismaClient.order.findUnique({
          where: { id },
          include: {
            products: true,
            events: true,
          },
        })
      : await prismaClient.order.findFirst({
          where: {
            id,
            userId: req.user!.id,
          },
          include: {
            products: true,
            events: true,
          },
        });

    if (!order) {
      throw createError(404, "Order not found");
    }

    res.status(200).json(order);
  },
);

/**
 * @desc   List All Orders
 * @route  api/orders/index
 * @method GET
 * @access private(admin only)
 */
export const listAllOrdersCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const rawStatus = req.query.status;
    const status =
      typeof rawStatus === "string" && isOrderStatus(rawStatus)
        ? rawStatus
        : undefined;

    const whereClause: OrderWhere = status ? { status } : {};

    const orders = await prismaClient.order.findMany({
      where: whereClause,
      skip: Number(req.query.skip ?? 0),
      take: 5,
    });

    res.status(200).json(orders);
  },
);

/**
 * @desc   Change Order Status
 * @route  api/orders/:id/status
 * @method PUT
 * @access private(admin only)
 */
export const changeStatusCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    await prismaClient.$transaction(async (tx) => {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) throw createError(400, "Invalid order id");

      const status = req.body.status as OrderStatus;

      try {
        const order = await tx.order.update({
          where: { id },
          data: { status },
        });

        await tx.orderEvent.create({
          data: {
            orderId: order.id,
            status,
          },
        });

        res.status(200).json(order);
      } catch {
        throw createError(404, "Order not found");
      }
    });
  },
);

/**
 * @desc   List All Orders Of User
 * @route  api/orders/users/:id
 * @method GET
 * @access private(admin only)
 */
export const ListUserOrdersCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    const rawStatus = req.query.status;
    const status =
      typeof rawStatus === "string" && isOrderStatus(rawStatus)
        ? rawStatus
        : undefined;

    const whereClause: OrderWhere = {
      userId,
      ...(status ? { status } : {}),
    };

    const orders = await prismaClient.order.findMany({
      where: whereClause,
      skip: Number(req.query.skip ?? 0),
      take: 5,
    });

    res.status(200).json(orders);
  },
);
