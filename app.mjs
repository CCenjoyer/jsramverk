import 'dotenv/config'

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import documents from "./docs.mjs";
import {
    console
} from 'inspector';


const port = process.env.PORT || 3000;
const app = express();


app.use(cors());

app.disable('x-powered-by');

app.set("view engine", "ejs");

app.use(express.static(path.join(process.cwd(), "public")));

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Middleware to parse JSON and form data (from POST requests)
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
/**
 * Route index 
 * List of all db rows with a link attached to /update/:rowid 
 */
app.post("/", async (req, res) => {
    const result = await documents.addOne(req.body);

    return res.redirect(`/${result.lastID}`);
});

app.get('/', async (req, res) => {
    return res.render("index", {
        docs: await documents.getAll()
    });
});

/**
 * Route Create
 * Create new rows of data
 */
app.get("/create", async (req, res) => {
    return res.render("create");
});

app.post("/create", async (req, res) => {
    await documents.addOne(req.body);
    return res.redirect("/");
});

/** 
 * Route Update
 * Update row data on row :id
 */
app.get('/update/:id', async (req, res) => {
    return res.render(
        "doc", {
            doc: await documents.getOne(req.params.id)
        }
    );
});

app.post('/update', async (req, res) => {
    const id = req.query._id;
    await documents.rowUpdate(req.body, id);
    return res.redirect(`/`);
});




/**
 * API Routes
 * 
 * 
 * 
 * 
 */

// Get all documents
app.get('/api/docs', async (req, res) => {
    try {
        const docs = await documents.getAll();
        return res.json({
            success: true,
            data: docs });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get one document by ID
app.get('/api/docs/:id', async (req, res) => {
    try {
        const doc = await documents.getOne(req.params.id);
        if (!doc) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }
        return res.json({
            success: true,
            data: doc });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create a new document
app.post('/api/docs', async (req, res) => {
    try {
        const result = await documents.addOne(req.body);
        return res.status(201).json({
            success: true,
            data: result });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update an existing document by ID
app.put('/api/docs/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedDoc = await documents.rowUpdate(req.body, id);
        if (!updatedDoc) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }
        return res.json({
            success: true,
            data: updatedDoc
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a document by ID
app.delete('/api/docs/:id', async (req, res) => {
    try {
        const result = await documents.deleteOne(req.params.id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }
        return res.json({
            success: true,
            message: 'Document deleted'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


/**
 * Reminder of what port the app is listening on
 */
app.listen(port, () => {
    console.log(`React app listening on port ${port}`)
});