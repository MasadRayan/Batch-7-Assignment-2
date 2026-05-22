import { Router } from "express";
import { issueController } from "./issue.controller";
import createIssue from "../../middleware/createIssue";
import { USER_ROLE } from "../../types";

const router = Router();

router.post('/', createIssue(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.createIssue);
router.get('/', issueController.getAllIssues);
router.get("/:id", issueController.getASingleUser);
router.patch('/:id', createIssue(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.updateAIssue)
router.delete('/:id', createIssue(USER_ROLE.maintainer), issueController.deleteIssue)

export const IssueRouter = router