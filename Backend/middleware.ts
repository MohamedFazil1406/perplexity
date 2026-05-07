import type { Request, Response, NextFunction } from "express";
import { createSupabaseClient } from "./client";
import { prisma } from "./db";

const client = createSupabaseClient();

export async function middleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(403).json({
      msg: "No authorization header",
    });

    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(403).json({
      msg: "Invalid token",
    });

    return;
  }

  const data = await client.auth.getUser(token);
  const userId = data.data.user?.id;
  console.log(token);

  if (userId) {
    try {
      await prisma.user.create({
        data: {
          id: data.data.user?.id,
          supabaseId: data.data.user?.id!,
          email: data.data.user?.email!,
          provider:
            data.data.user?.app_metadata.provider === "google"
              ? "Google"
              : "Github",
          name: data.data.user?.user_metadata.full_name,
        },
      });
    } catch (e) {}

    req.userId = userId;
    next();
  } else {
    res.status(403).json({
      msg: "Incorrect inputs",
    });
  }
}
