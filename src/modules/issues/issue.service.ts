import { pool } from "../../database";
import type { ICreateIssue, IUserPayloadObject } from "./issue.interface";

const createIssueInDB = async (
  payload: ICreateIssue,
  user: IUserPayloadObject,
) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *     
    `,
    [title, description, type, user.id],
  );

  if (result.rows.length === 0) {
    throw new Error("Issue cannot created");
  }

  return result;
};

export const issueService = {
  createIssueInDB,
};
