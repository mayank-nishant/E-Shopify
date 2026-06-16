import { Router } from "express";
import { clerkClient, getAuth } from "@clerk/express";

import { requireAuth } from "../../middleware/auth";
import { User } from "../../models/User";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";

export const authRouter = Router();

authRouter.post(
  "/sync",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      throw new AppError(401, "Authentication required. Please sign in to continue.");
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const primaryEmail = clerkUser.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId) ?? clerkUser.emailAddresses[0];

    if (!primaryEmail) {
      throw new AppError(400, "No email address found for this account.");
    }

    const email = primaryEmail.emailAddress;

    const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();

    const name = fullName || clerkUser.username || email.split("@")[0];

    const raw = process.env.ADMIN_EMAILS || "";

    const adminEmails = new Set(
      raw
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    );

    const existingUser = await User.findOne({ clerkUserId: userId });

    const shouldBeAdmin = adminEmails.has(email.toLowerCase());

    const nextRole = existingUser?.role === "admin" ? "admin" : shouldBeAdmin ? "admin" : existingUser?.role || "user";

    const dbUser = await User.findOneAndUpdate(
      { clerkUserId: userId },
      {
        clerkUserId: userId,
        email,
        name,
        role: nextRole,
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!dbUser) {
      throw new AppError(500, "Failed to synchronize user.");
    }

    res.status(200).json(
      ok({
        user: {
          id: dbUser._id,
          clerkUserId: dbUser.clerkUserId,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        },
      }),
    );
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      throw new AppError(401, "Authentication required. Please sign in to continue.");
    }

    const dbUser = await User.findOne({ clerkUserId: userId });

    if (!dbUser) {
      throw new AppError(404, "User record not found.");
    }

    res.status(200).json(
      ok({
        user: {
          id: dbUser._id,
          clerkUserId: dbUser.clerkUserId,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        },
      }),
    );
  }),
);
