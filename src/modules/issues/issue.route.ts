import { Router } from "express";
import { issueController } from "./issue.controller";
import createIssue from "../../middleware/createIssue";
import { USER_ROLE } from "../../types";

const router = Router();

router.post('/', createIssue(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.createIssue)


export const IssueRouter = router