import 'dotenv/config'

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import documents from "./docs.mjs";

const port = process.env.PORT || 3000;
const app = express();

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

app.post("/", async (req, res) => {
    const result = await documents.addOne(req.body);

    return res.redirect(`/${result.lastID}`);
});

app.get('/', async (req, res) => {
    return res.render("index", { docs: await documents.getAll() });
});


app.get("/create", async (req, res) => {
    return res.render("create");
});

app.post("/create", async (req, res) => {
    await documents.addOne(req.body);
    return res.redirect("/");
});

app.get('/update/:id', async (req, res) => {
    return res.render(
        "doc",
        { doc: await documents.getOne(req.params.id) }
    );
});

app.post('/update', async (req, res) => {
    const id = req.query.rowid; // capture the 'id' from the query string
    await documents.rowUpdate(req.body, id); // pass the 'id' to rowUpdate
    return res.redirect(`/`);
});





app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
