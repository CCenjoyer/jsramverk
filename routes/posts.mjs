import express from 'express';
const router = express.Router();
import documents from "../models/docs.mjs";

/**
 * Route index 
 * List of all db rows with a link attached to /update/:rowid 
 */
router.post("/", async (req, res) => {
    const result = await documents.addOne(req.body);

    return res.redirect(`/${result.lastID}`);
});

router.get('/', async (req, res) => {
    return res.render("index", {
        docs: await documents.getAll()
    });
});

/**
 * Route Create
 * Create new rows of data
 */
router.get("/create", async (req, res) => {
    return res.render("create");
});

router.post("/create", async (req, res) => {
    await documents.addOne(req.body);
    return res.redirect("/");
});

/** 
 * Route Update
 * Update row data on row :id
 */
router.get('/update/:id', async (req, res) => {
    return res.render(
        "doc", {
            doc: await documents.getOne(req.params.id)
        }
    );
});

router.post('/update', async (req, res) => {
    const id = req.query._id;
    await documents.rowUpdate(req.body, id);
    return res.redirect(`/`);
});


export default router;
