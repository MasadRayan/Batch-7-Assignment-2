import type { JwtPayload } from "jsonwebtoken";

export interface ICreateIssue {
  title: string;
  description: string;
  type: "bug" | "feature_request";
}

export interface IUserPayloadObject extends JwtPayload {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface IssueQueryParams  {
  sort : string;
  type: string;
  status : string;
}
