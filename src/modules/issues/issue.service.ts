import { pool } from "../../database";
import type { ICreateIssue } from "./issue.interface";

const createIssueInDB = async (payload: ICreateIssue) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues (title, description, type) VALUES ($1, $2, $3) RETURNING *     
    `,
    [title, description, type],
  );

  return result

};

export const issueService = {
  createIssueInDB,
};
