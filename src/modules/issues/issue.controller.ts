import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issueService } from "./issue.service";
import type { JwtPayload } from "jsonwebtoken";
import type { IUserPayloadObject } from "./issue.interface";
import { userInfo } from "node:os";
import { fstat } from "node:fs";

const createIssue = async (req: Request, res: Response) => {
  const user = req.user as IUserPayloadObject;
  try {
    const result = await issueService.createIssueInDB(req.body, user);
    sendResponse(res, 201, true, "Issue created successful", result.rows[0]);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message as string, undefined, error);
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  const { sort, type, status } = req.query;
  try {
    const result = await issueService.getAllIssuesFromDB(
      sort as string,
      type as string,
      status as string,
    );
    sendResponse(res, 200, true, undefined, result);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message, undefined, error);
  }
};

const getASingleissue = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const result = await issueService.getASingleIssueFromDB(id as string);
    sendResponse(res, 200, true, undefined, result);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message, undefined, error);
  }
};

const updateAIssue = async (req: Request, res: Response) => {
  const { role, id: userId } = req.user as IUserPayloadObject;
  const id = req.params.id;
  console.log(role, userId, id, req.body);
  try {
    const result = await issueService.updateIssueIntoDB(
      id as string,
      userId as number,
      role as string,
      req.body,
    );
    sendResponse(res, 200, true, undefined, result?.rows[0]);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message, undefined, error);
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const result = await issueService.deleteIssueFromDB(id as string);
    if (result.rowCount === 0) {
      sendResponse(res, 404, false, "Issue Not Found");
    }
    sendResponse(res, 200, true, "Issue deleted successfully");
  } catch (error: any) {
    sendResponse(res, 500, false, error.message, undefined, error);
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getASingleissue,
  updateAIssue,
  deleteIssue,
};
