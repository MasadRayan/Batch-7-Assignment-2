
  import { createRequire } from 'module';
  const require = createRequire(import.meta.url);
 

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";

// src/database/index.ts
import { Pool } from "pg";

// src/config/env.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env.local")
});
var config = {
  db_string: process.env.DATABASE_CONNECTION_STRING,
  accessToken_key: process.env.ACCESSTOKEN_KEY
};
var env_default = config;

// src/database/index.ts
var pool = new Pool({
  connectionString: env_default.db_string
});
var initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL NOT NULL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(50) DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )      
    `);
    pool.query(`
        CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY NOT NULL,
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
            status VARCHAR(30) DEFAULT 'open',
            reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
import jwt from "jsonwebtoken";
var createUserInDb = async (payload) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
        INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, COALESCE($4, 'contributor')) RETURNING *
    `,
    [name, email, hashedPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginUserIntoDB = async (email, password) => {
  const userInfo2 = await pool.query(
    `
        SELECT * FROM users WHERE email = $1
    `,
    [email]
  );
  if (userInfo2.rows.length === 0) {
    throw new Error("User Not Found");
  }
  const user = userInfo2.rows[0];
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    throw new Error("Invalid credentials");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accesstoken = jwt.sign(jwtPayload, env_default.accessToken_key, {
    expiresIn: "1d"
  });
  delete user.password;
  return { accesstoken, user };
};
var authService = {
  createUserInDb,
  loginUserIntoDB
};

// src/utils/sendResponse.ts
var sendResponse = (res, statusCode, success, message, data, error) => {
  return res.status(statusCode).json({
    success,
    ...message !== void 0 && { message },
    ...data !== void 0 && { data },
    ...error !== void 0 && { error }
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await authService.createUserInDb(req.body);
    if (result.rows.length === 0) {
      sendResponse_default(res, 404, false, "User SignUp Failed", Error);
    }
    sendResponse_default(res, 201, true, "User Created Successfully", result.rows[0]);
  } catch (error) {
    sendResponse_default(res, 500, false, error.message, void 0, error);
  }
};
var loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await authService.loginUserIntoDB(email, password);
    const { accesstoken: token, user } = result;
    sendResponse_default(res, 200, true, "Login successful", { token, user });
  } catch (error) {
    sendResponse_default(res, 500, false, error.message, void 0, error);
  }
};
var authController = {
  createUser,
  loginUser
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.createUser);
router.post("/login", authController.loginUser);
var AuthRouter = router;

// src/modules/issues/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issue.service.ts
var createIssueInDB = async (payload, user) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *     
    `,
    [title, description, type, user.id]
  );
  if (result.rows.length === 0) {
    throw new Error("Issue cannot created");
  }
  return result;
};
var getAllIssuesFromDB = async (sort, type, status) => {
  const order = sort === "oldest" ? "ASC" : "DESC";
  let issuesLength;
  if (type && status) {
    issuesLength = await pool.query(
      `SELECT * FROM issues WHERE type = $1 AND status = $2 ORDER BY created_at ${order}`,
      [type, status]
    );
  } else if (type) {
    issuesLength = await pool.query(
      `SELECT * FROM issues WHERE type = $1 ORDER BY created_at ${order}`,
      [type]
    );
  } else if (status) {
    issuesLength = await pool.query(
      `SELECT * FROM issues WHERE status = $1 ORDER BY created_at ${order}`,
      [status]
    );
  } else {
    issuesLength = await pool.query(
      `SELECT * FROM issues ORDER BY created_at ${order}`
    );
  }
  const issues = issuesLength.rows;
  if (issues.length === 0) {
    throw new Error("No issues found");
  }
  const allRepoterId = issues.map((issue) => issue.reporter_id);
  const getUsers = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id = ANY($1)
    `,
    [allRepoterId]
  );
  const reporterMap = new Map(getUsers.rows.map((user) => [user.id, user]));
  const result = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterMap.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return result;
};
var getASingleIssueFromDB = async (id) => {
  const issue = await pool.query(
    `
        SELECT * FROM issues where id = $1
    `,
    [id]
  );
  if (issue.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const reporterId = issue.rows[0].reporter_id;
  const reporterInfo = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id = $1
    `,
    [reporterId]
  );
  if (reporterInfo.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const user = reporterInfo.rows[0];
  const result = {
    id: issue.rows[0].id,
    title: issue.rows[0].title,
    description: issue.rows[0].description,
    type: issue.rows[0].type,
    status: issue.rows[0].status,
    reporter: user,
    created_at: issue.rows[0].created_at,
    updated_at: issue.rows[0].updated_at
  };
  return result;
};
var updateIssueIntoDB = async (id, userId, role, payload) => {
  const { title, description, type } = payload;
  const issueInfo = await pool.query(
    `
        SELECT * FROM issues WHERE id = $1    
    `,
    [id]
  );
  const issue = issueInfo.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  if (role === "contributor" && userId !== issue.reporter_id) {
    throw new Error("Unauthorize Access!!");
  }
  if (role === "contributor" && issue.status !== "open") {
    throw new Error("This Issue is In Progress");
  }
  if (role === "contributor" && issue.status === "open" && userId === issue.reporter_id) {
    const result = await pool.query(
      `
        UPDATE issues
        SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           type = COALESCE($3, type),
           status = 'in_progress',
           updated_at = NOW()
       WHERE id = $4
       RETURNING *
    `,
      [title, description, type, id]
    );
    return result;
  } else if (role === "maintainer") {
    const result = await pool.query(
      `
        UPDATE issues
        SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           type = COALESCE($3, type),
           status = 'in_progress',
           updated_at = NOW()
       WHERE id = $4
       RETURNING *
    `,
      [title, description, type, id]
    );
    return result;
  }
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM issues WHERE id = $1
  `,
    [id]
  );
  return result;
};
var issueService = {
  createIssueInDB,
  getAllIssuesFromDB,
  getASingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/modules/issues/issue.controller.ts
import "os";
import "fs";
var createIssue = async (req, res) => {
  const user = req.user;
  try {
    const result = await issueService.createIssueInDB(req.body, user);
    sendResponse_default(res, 201, true, "Issue created successful", result.rows[0]);
  } catch (error) {
    sendResponse_default(res, 500, false, error.message, void 0, error);
  }
};
var getAllIssues = async (req, res) => {
  const { sort, type, status } = req.query;
  try {
    const result = await issueService.getAllIssuesFromDB(
      sort,
      type,
      status
    );
    sendResponse_default(res, 200, true, void 0, result);
  } catch (error) {
    sendResponse_default(res, 500, false, error.message, void 0, error);
  }
};
var getASingleissue = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await issueService.getASingleIssueFromDB(id);
    sendResponse_default(res, 200, true, void 0, result);
  } catch (error) {
    sendResponse_default(res, 500, false, error.message, void 0, error);
  }
};
var updateAIssue = async (req, res) => {
  const { role, id: userId } = req.user;
  const id = req.params.id;
  console.log(role, userId, id, req.body);
  try {
    const result = await issueService.updateIssueIntoDB(
      id,
      userId,
      role,
      req.body
    );
    sendResponse_default(res, 200, true, void 0, result?.rows[0]);
  } catch (error) {
    sendResponse_default(res, 500, false, error.message, void 0, error);
  }
};
var deleteIssue = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await issueService.deleteIssueFromDB(id);
    if (result.rowCount === 0) {
      sendResponse_default(res, 404, false, "Issue Not Found");
    }
    sendResponse_default(res, 200, true, "Issue deleted successfully");
  } catch (error) {
    sendResponse_default(res, 500, false, error.message, void 0, error);
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getASingleissue,
  updateAIssue,
  deleteIssue
};

// src/middleware/createIssue.ts
import jwt2 from "jsonwebtoken";
var createIssue2 = (...roles) => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      sendResponse_default(res, 401, false, "Unauthorize Access!!");
    }
    const payload = jwt2.verify(
      token,
      env_default.accessToken_key
    );
    const userInfo2 = await pool.query(
      `
            SELECT * FROM users WHERE email = $1    
        `,
      [payload.email]
    );
    const user = userInfo2.rows[0];
    if (userInfo2.rows.length === 0) {
      sendResponse_default(res, 404, false, "User Not Found");
    }
    if (roles.length && !roles.includes(user.role)) {
      sendResponse_default(res, 403, false, "Forbidden Access!!!");
    }
    req.user = payload;
    next();
  };
};
var createIssue_default = createIssue2;

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issues/issue.route.ts
var router2 = Router2();
router2.post("/", createIssue_default(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.createIssue);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getASingleissue);
router2.patch("/:id", createIssue_default(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.updateAIssue);
router2.delete("/:id", createIssue_default(USER_ROLE.maintainer), issueController.deleteIssue);
var IssueRouter = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded());
app.get("/", (req, res) => {
  res.json({
    author: "Masad Rayan",
    Project: "Bug fixer"
  });
});
app.use("/api/auth", AuthRouter);
app.use("/api/issues", IssueRouter);
var app_default = app;

// src/server.ts
var port = 3e3;
var main = () => {
  initDB();
  app_default.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
main();
//# sourceMappingURL=server.js.map