import express from "express"
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

export default app;