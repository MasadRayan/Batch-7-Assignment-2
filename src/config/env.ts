import dotenv from "dotenv"
import path from "path";

dotenv.config({
    path : path.join(process.cwd(), '.env.local')
})


const config = {
    db_string : process.env.DATABASE_CONNECTION_STRING,
}

export default config