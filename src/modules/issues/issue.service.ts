import { pool } from "../../database";
import type {
  ICreateIssue,
  IssueQueryParams,
  IUserPayloadObject,
} from "./issue.interface";

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

const getAllIssuesFromDB = async (
  sort: string | undefined,
  type: string | undefined,
  status: string | undefined,
) => {
  const order = sort === "oldest" ? "ASC" : "DESC";

  if (type && status) {
    return await pool.query(
      `SELECT * FROM issues WHERE type = $1 AND status = $2 ORDER BY created_at ${order}`,
      [type, status],
    );
  } else if (type) {
    return await pool.query(
      `SELECT * FROM issues WHERE type = $1 ORDER BY created_at ${order}`,
      [type],
    );
  } else if (status) {
    return await pool.query(
      `SELECT * FROM issues WHERE status = $1 ORDER BY created_at ${order}`,
      [status],
    );
  } else {
    return await pool.query(
      `SELECT * FROM issues ORDER BY created_at ${order}`,
    );
  }
};


export const issueService = {
  createIssueInDB,
  getAllIssuesFromDB,
};
