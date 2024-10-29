import express from 'express';
import documents from "../models/docs.mjs";
import auth from '../models/auth.js';

const router = express.Router();

// Return json with routes
router.get('/', async (req, res) => {
    return res.json({
        data: {
            api_routes: {
                get: [
                    "/",
                    "docs",
                    "docs/{id}"
                ],
                post: [
                    "docs/{id}"
                ],
                put: [
                    "docs/{id}"
                ],
                delete: [
                    "docs/{id}"
                ] 
            }
        }
    });
});

// Get all documents
router.get('/docs', auth.checkToken, async (req, res) => {
    try {
        const docIds = req.query.ids ? req.query.ids.split(',') : null;
        let docs;

        if (docIds) {
            docs = await documents.getByIds(docIds);
        } else {
            docs = await documents.getAll();
        }
        return res.json({
            success: true,
            data: docs
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get one document by ID
router.get('/docs/:id', auth.checkToken, async (req, res) => {
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
            data: doc
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create a new document
router.post('/docs', auth.checkToken, async (req, res) => {
    try {
        const result = await documents.addOne(req.body);
        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update an existing document by ID
router.put('/docs/:id', auth.checkToken, async (req, res) => {
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
router.delete('/docs/:id', auth.checkToken, async (req, res) => {
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

export default router;
