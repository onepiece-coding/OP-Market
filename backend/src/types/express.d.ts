import type { User } from "@prisma/client";

type PublicUser = Omit<User, "password">;

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}
