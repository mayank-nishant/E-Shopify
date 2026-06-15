import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { AppError } from "../utils/AppError";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const { userId } = getAuth(req);

  if (!userId) {
    return next(new AppError(401, "Authentication required. Please sign in to continue."));
  }

  next();
}

export async function getDbUserFromReq(req: Request) {
  const { userId } = getAuth(req);

  if (!userId) {
    throw new AppError(401, "Authentication required. Please sign in to continue.");
  }

  const dbUser = await User.findOne({ clerkUserId: userId });

  if (!dbUser) {
    throw new AppError(404, "User record not found in the database.");
  }

  return dbUser;
}

export const requireAdmin = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const extractCurrentDbUser = await getDbUserFromReq(req);

  if (extractCurrentDbUser.role !== "admin") {
    throw new AppError(403, "Access denied. Administrator privileges are required.");
  }

  next();
});
