import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issueService } from "./issue.service";
import type { JwtPayload } from "jsonwebtoken";
import type { IUserPayloadObject } from "./issue.interface";

const createIssue = async (req: Request, res: Response) => {
  const user = req.user as IUserPayloadObject;
  try {
    const result = await issueService.createIssueInDB(req.body, user );
    sendResponse(res, 201, true, "Issue created successful", result.rows[0]);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message as string, undefined, error);
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  const {sort, type, status} = req.query
  try {
    const result = await issueService.getAllIssuesFromDB(sort as string, type as string, status as string)
    sendResponse(res, 200, true, "All Issues Retrieved from Database", result?.rows)
  } catch (error : any) {
    sendResponse(res, 500, false, "Internal server error", undefined, error)
  }
}

export const issueController = {
  createIssue,
  getAllIssues
};
