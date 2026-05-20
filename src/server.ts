import app from "./app";
import { initDB } from "./database";
const port = 3000;

const main = () => {
    initDB()
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};


main()