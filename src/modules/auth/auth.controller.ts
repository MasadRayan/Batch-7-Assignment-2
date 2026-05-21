import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.createUserInDb(req.body);

    if (result.rows.length === 0) {
      sendResponse(res, 404, false, "User SignUp Failed", Error)
    }
    sendResponse(res, 201, true, "User Created Successfully", result.rows[0])
  } catch (error: any) {
    sendResponse(res, 500, false, error.message as string, undefined, error)
  }
};

export const authController = {
  createUser,
};
