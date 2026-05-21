import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.createUserInDb(req.body);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User SignUp Failed",
      });
    }

    sendResponse(res, 201, true, "User Created Successfully", result.rows[0])
    
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
