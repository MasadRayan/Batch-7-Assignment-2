import bcrypt from "bcryptjs";
import { pool } from "../../database";
import type { ICreateUser } from "./auth.interface";

const createUserInDb = async (payload: ICreateUser) => {
  const { name, email, password, role } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
        INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, COALESCE($4, 'contributor')) RETURNING *
    `,
    [name, email, hashedPassword, role],
  );

  delete result.rows[0].password
  return result
};

export const authService = {
  createUserInDb,
};
