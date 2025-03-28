import "dotenv/config";

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import setupSocket from "./setup-socket.mjs";

import "./database.mjs";

import api from "./routes/api.mjs";
import docs from "./routes/docs.mjs";

// login and authentication routes
import { console } from "inspector";
import auth from "./routes/auth.js";
import users from "./routes/users.js";

const port = process.env.PORT || 8080;
const app = express();

app.use(
    cors({
        origin: [
            process.env.FRONTEND_URL || "http://localhost:3000",
            process.env.FRONTEND_URL_2,
        ],
        methods: ["GET", "PUT", "POST", "DELETE"],
        credentials: true,
    })
);

// const corsOptions = {
//     origin: [
//         process.env.FRONTEND_URL || "http://localhost:3000",
//         process.env.FRONTEND_URL_2,
//     ],
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true, // Allow cookies if needed
// };

// app.options("*", cors(corsOptions));
// app.use(cors({ origin: "*" }));

app.disable("x-powered-by");
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));

// don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
    // use morgan to log at command line
    app.use(morgan("combined")); // 'combined' outputs the Apache style LOGs
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
app.use("/auth", auth);
app.use("/docs", docs);

const httpServer = setupSocket(app);

// Start the server
httpServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
