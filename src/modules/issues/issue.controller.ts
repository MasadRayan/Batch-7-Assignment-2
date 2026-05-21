import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    const result = await issueService.createIssueInDB(req.body);
    if (result.rows.length === 0) {
      sendResponse(res, 404, false, "Issue cannot created");
    }

    sendResponse(res, 201, true, "Issue created successful", result)

  } catch (error: any) {
    sendResponse(res, 500, false, error.message as string, undefined, error);
  }
};

export const issueController = {
  createIssue,
};
