import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";

const createIssue = async (req : Request, res: Response) => {
    try {
        const result = ''
    } catch (error : any) {
        sendResponse(res, 500, false, error.message as string, undefined, error)
    }

}

export const issueController = {
    createIssue
}