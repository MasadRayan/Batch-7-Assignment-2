import type { NextFunction, Request, Response } from "express";
import sendResponse from "../utils/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/env";
import { pool } from "../database";
import type { Role } from "../types";

const createIssue = (...roles : Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      sendResponse(res, 401, false, "Unauthorize Access!!");
    }

    const payload = jwt.verify(
      token as string,
      config.accessToken_key as string,
    ) as JwtPayload;

    const userInfo = await pool.query(
      `
            SELECT * FROM users WHERE email = $1    
        `,
      [payload.email],
    );

    const user = userInfo.rows[0];
    console.log(user.role)

    if (userInfo.rows.length === 0) {
        sendResponse(res, 404, false, "User Not Found")
    }

    if (roles.length && !roles.includes(user.role)) {
        sendResponse(res, 403, false, "Forbidden Access!!!");
    }

    req.user = payload

    next();
  };
};

export default createIssue;
