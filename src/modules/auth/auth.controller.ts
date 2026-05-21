import type { Request, Response } from "express";
import { authService } from "./auth.service";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.createUserInDb(req.body);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User SignUp Failed",
      });
    }

    res.status(200).json({
      success: true,
      message: "User Created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const authController = {
  createUser,
};
