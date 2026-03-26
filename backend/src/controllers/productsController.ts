import { Request, Response } from "express";
import createError from "http-errors";
import asyncHandler from "express-async-handler";
import { prismaClient } from "../db/prisma.js";
import { uploadImageBuffer, removeImage } from "../services/cloudinary.js";

type MulterRequest = Request & {
  file?: Express.Multer.File;
};

/**
 * @desc   Create new products
 * @route  api/products
 * @method POST
 * @access private(only ADMIN)
 */
export const createProductCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const file = (req as MulterRequest).file;

    let imageUrl: string | null = null;
    let imageKey: string | null = null;

    if (file) {
      const uploaded = await uploadImageBuffer(file.buffer, {
        folder: "op-market/products",
      });

      imageUrl = uploaded.secure_url ?? uploaded.url ?? null;
      imageKey = uploaded.public_id ?? null;
    }

    const tagsArray: string[] = Array.isArray(req.body.tags)
      ? req.body.tags
      : typeof req.body.tags === "string"
        ? req.body.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

    const product = await prismaClient.product.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        price: Number(req.body.price),
        tags: tagsArray.join(","),
        imageUrl,
        imageKey,
      },
    });

    res.status(201).json(product);
  },
);

/**
 * @desc   Update product
 * @route  api/products/:id
 * @method PUT
 * @access private(only ADMIN)
 */
export const updateProductCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw createError(400, "Invalid product id");

    const file = (req as MulterRequest).file;

    const existingProduct = await prismaClient.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw createError(404, "Product not found!");
    }

    let newImageUrl = existingProduct.imageUrl;
    let newImageKey = existingProduct.imageKey;
    let uploadedImageKey: string | null = null;

    try {
      if (file) {
        const uploaded = await uploadImageBuffer(file.buffer, {
          folder: "op-market/products",
        });

        uploadedImageKey = uploaded.public_id ?? null;
        newImageUrl = uploaded.secure_url ?? uploaded.url ?? null;
        newImageKey = uploaded.public_id ?? null;
      }

      const tagsValue = req.body.tags;
      const tags =
        tagsValue === undefined
          ? existingProduct.tags
          : Array.isArray(tagsValue)
            ? tagsValue.join(",")
            : String(tagsValue)
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .join(",");

      const updatedProduct = await prismaClient.product.update({
        where: { id },
        data: {
          name: req.body.name ?? existingProduct.name,
          description: req.body.description ?? existingProduct.description,
          price:
            req.body.price !== undefined
              ? Number(req.body.price)
              : Number(existingProduct.price),
          tags,
          imageUrl: newImageUrl,
          imageKey: newImageKey,
        },
      });

      if (
        file &&
        existingProduct.imageKey &&
        existingProduct.imageKey !== uploadedImageKey
      ) {
        try {
          await removeImage(existingProduct.imageKey);
        } catch (err) {
          console.error("Failed to remove old product image", err);
        }
      }

      res.status(200).json(updatedProduct);
    } catch (error) {
      if (uploadedImageKey) {
        try {
          await removeImage(uploadedImageKey);
        } catch (cleanupErr) {
          console.error("Failed to cleanup newly uploaded image", cleanupErr);
        }
      }
      throw error;
    }
  },
);

/**
 * @desc   Delete product
 * @route  api/products/:id
 * @method DELETE
 * @access private(only ADMIN)
 */
export const deleteProductCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw createError(400, "Invalid product id");

    const product = await prismaClient.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw createError(404, "Product not found!");
    }

    await prismaClient.product.delete({
      where: { id },
    });

    if (product.imageKey) {
      try {
        await removeImage(product.imageKey);
      } catch (err) {
        console.error("Failed to remove product image from Cloudinary", err);
      }
    }

    res.status(200).json({
      status: true,
      message: "Product deleted successfully",
    });
  },
);

/**
 * @desc   list products
 * @route  api/products
 * @method GET
 * @access private(only ADMIN)
 */
export const listProductsCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const count = await prismaClient.product.count();

    const products = await prismaClient.product.findMany({
      skip: Number(req.query.skip ?? 0),
      take: 5,
    });

    res.status(200).json({
      count,
      data: products,
    });
  },
);

/**
 * @desc   Get product by id
 * @route  api/products/:id
 * @method GET
 * @access private(only ADMIN)
 */
export const getProductByIdCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const product = await prismaClient.product.findUnique({
        where: { id: Number(req.params.id) },
      });

      if (!product) throw new Error();

      res.status(200).json(product);
    } catch {
      throw createError(404, "Product not found!");
    }
  },
);

/**
 * @desc   Search products
 * @route  api/products/search
 * @method GET
 * @access private
 */
export const searchProductsCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const q = String(req.query.q ?? "").trim();

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { tags: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

    const products = await prismaClient.product.findMany({
      where,
      skip: Number(req.query.skip ?? 0),
      take: 5,
    });

    res.status(200).json(products);
  },
);
