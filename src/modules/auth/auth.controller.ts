import type { Request, Response } from "express";
import { authService } from "./auth.service";

const createUser = async (req : Request, res: Response) => {
    const result = await authService.createUserInDb(req.body);
    res.status(200).json({
        success: true,
        message : "User Created successfully",
        data: result
    })
}


export const authController = {
    createUser,
}