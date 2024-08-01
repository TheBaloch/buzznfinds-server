import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import {
  sendVerifyEmail,
  sendResetEmail,
  sendFailEmail,
  sendPaymentFailEmail,
} from "../utils/mailer/sendMail";
import { v4 as uuidv4 } from "uuid";

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User();
    newUser.email = email;
    newUser.password = password;
    newUser.username = username;

    await userRepository.save(newUser);

    const token = jwt.sign(
      { email: newUser.email },
      process.env.JWT_SECRET || "",
      {
        expiresIn: parseInt(process.env.JWT_EXPIRY || "86400"),
      }
    );

    return res.status(200).json({ auth_token: token, message: "sucess" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token)
    return res.status(400).json({ message: "Token is required in body" });
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return res.status(204).json({ message: "Token not found or expired" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await userRepository.save(user);

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    user.emailVerificationToken = uuidv4();
    await userRepository.save(user);

    await sendVerifyEmail(
      user.email,
      user.username,
      user.emailVerificationToken
    );

    return res
      .status(200)
      .json({ message: "Verification email resent successfully" });
  } catch (error) {
    console.error("Error resending verification email:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.passwordVerificationToken = uuidv4();
    await userRepository.save(user);

    await sendResetEmail(
      user.email,
      user.username,
      user.passwordVerificationToken
    );

    return res
      .status(200)
      .json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { passwordVerificationToken: token },
    });

    if (!user) {
      return res.status(404).json({ message: "Token not found or expired" });
    }

    user.password = newPassword;
    user.passwordVerificationToken = null;
    await userRepository.save(user);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET || "",
      {
        expiresIn: parseInt(process.env.JWT_EXPIRY || "86400"),
      }
    );

    return res.status(200).json({ auth_token: token, message: "sucess" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    return res.status(200).json({
      message: "Successful",
      user: {
        ...user,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

// export const updateUser = async (req: Request, res: Response) => {
//   const user = req.user as User;
//   const {
//     email,
//     oldPassword,
//     newPassword,
//     firstname,
//     lastname,
//     phone,
//     address,
//   } = req.body;

//   try {
//     const userRepository = AppDataSource.getRepository(User);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (email) {
//       user.emailVerificationToken = uuidv4();
//       user.email = email;
//       user.isEmailVerified = false;
//       await sendVerifyEmail(
//         user.email,
//         `${user.firstname} ${user.lastname}`,
//         user.emailVerificationToken
//       );
//     }
//     if (oldPassword && newPassword) {
//       const isMatch = await bcrypt.compare(oldPassword, user.password);
//       if (!isMatch) {
//         return res.status(202).json({ message: "Incorrect Password" });
//       }
//       user.password = newPassword;
//       //send password update notification
//     }
//     if (firstname) user.firstname = firstname;
//     if (lastname) user.lastname = lastname;
//     if (phone) user.phone = phone;
//     if (address) user.address = address;

//     await userRepository.save(user);

//     return res.status(200).json({ message: "User updated successfully" });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     return res.status(500).json({ message: "Internal server error", error });
//   }
// };
