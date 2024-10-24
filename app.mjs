import 'dotenv/config'

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import './database.mjs';

// import documents from "./docs.mjs";
import posts from "./routes/posts.mjs"
import api from "./routes/api.mjs"

// login and authentication routes
import auth from "./routes/auth.js";
import users from "./routes/users.js";
import data from "./routes/data.js";

import { console } from 'inspector';

import authModel from "./models/auth.js";

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.options('*', cors());

app.disable('x-powered-by');
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse JSON and form data (from POST requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.all('*', authModel.checkAPIKey);


/** 
 * Routes:
 * adds routes present in routes folder (".routes/*") accessible through:
 * example use:
 * route: "api/"           - routes within routes/api.mjs
 * route: "/"              - routes within routes/posts.mjs
*/
app.use("/", api);
// app.use("/posts", posts);

app.use("/users", users);
app.use("/data", data);
app.use("/auth", auth);


/**
 * Reminder of what port the app is listening on
 */
app.listen(port, () => {
    console.log(`Express app listening on port ${port}`)
});