import app from "./app";
const port = 3000;

const main = () => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};


main()