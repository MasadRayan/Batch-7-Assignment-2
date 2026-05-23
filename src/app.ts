import express from "express"
import { AuthRouter } from "./modules/auth/auth.route";
import { IssueRouter } from "./modules/issues/issue.route";
import globarHandler from "./middleware/globalErrorHandler";
const app = express()
const port = 3000;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded());


app.get('/', (req, res) => {
  res.json({
    author: "Masad Rayan",
    Project : "Bug fixer",
  })
})


app.use('/api/auth', AuthRouter);
app.use('/api/issues', IssueRouter);

app.use(globarHandler)

export default app;