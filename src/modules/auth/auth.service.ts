import bcrypt from "bcryptjs";
import { pool } from "../../database";
import type { ICreateUser } from "./auth.interface";
import jwt from "jsonwebtoken";
import config from "../../config/env";
import AppError from "../../utils/AppError";

const createUserInDb = async (payload: ICreateUser) => {
  const { name, email, password, role } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
        INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, COALESCE($4, 'contributor')) RETURNING *
    `,
    [name, email, hashedPassword, role],
  );

  delete result.rows[0].password;
  return result;
};

const loginUserIntoDB = async (email: string, password: string) => {
  //1. user exist kore naki chk korte heb
  //2. Compare the passwoed
  //3. Create jwt token

  const userInfo = await pool.query(
    `
        SELECT * FROM users WHERE email = $1
    `,
    [email],
  );

  if (userInfo.rows.length === 0) {
    throw new AppError("Invalid credentials", 401);
  }

  const user = userInfo.rows[0];

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    throw new AppError("Invalid credentials", 401);
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accesstoken = jwt.sign(jwtPayload, config.accessToken_key as string, {
    expiresIn: "1d",
  });
  delete user.password;

  return { accesstoken, user };
};

export const authService = {
  createUserInDb,
  loginUserIntoDB,
};
