import { Request, Response, NextFunction } from "express";
import { User } from "../entities/User";

// Middleware to check if the user has admin role
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user as User).role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Admins only" });
};
