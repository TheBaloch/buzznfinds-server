import express from "express";
import passport from "../auth/jwt";
import {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
} from "../controllers/userController";

const router = express.Router();

// User routes
//router.post("/users/register", registerUser);
//router.post("/users/login", loginUser);

router.get(
  "/users/me",
  passport.authenticate("jwt", { session: false }),
  getMe
);

// Email verification routes
//router.post("/users/verify-email", verifyEmail);
//router.post("/users/resend-verification-email", resendVerificationEmail);

// Password reset routes
//router.post("/users/request-password-reset", requestPasswordReset);
//router.post("/users/reset-password", resetPassword);

export default router;
