import express from "express";
import auth from "../models/auth.js";
import docs from "../models/docs.mjs";
import users from "../models/users.js";

const router = express.Router();

// Get all docs
router.get("/", auth.checkToken, async (req, res) => {
    try {
        const documentIds = req.query.ids ? req.query.ids.split(",") : null;
        let documents;

        if (documentIds) {
            documents = await docs.getByIds(documentIds);
        } else {
            documents = await docs.getAll();
        }
        return res.json({
            success: true,
            data: documents,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Get one document by ID
router.get("/:id", auth.checkToken, async (req, res) => {
    try {
        const document = await docs.getOne(req.params.id);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }
        return res.json({
            success: true,
            data: document,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Create a new document
router.post("/", auth.checkToken, async (req, res) => {
    try {
        const result = await docs.addOne(req.body);
        return res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Update an existing document by ID
router.put("/:id", auth.checkToken, async (req, res) => {
    try {
        const id = req.params.id;
        const updatedDoc = await docs.updateDocument(id, req.body);
        if (!updatedDoc) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }
        return res.json({
            success: true,
            data: updatedDoc,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Delete a document by ID
router.delete("/:id", auth.checkToken, async (req, res) => {
    try {
        const result = await docs.deleteOne(req.params.id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }
        return res.json({
            success: true,
            message: "Document deleted",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Share a document with another user
router.post("/:id/share", auth.checkToken, async (req, res) => {
    try {
        const documentId = req.params.id;
        const { user, addEmail } = req.body;
        const document = await docs.getOne(documentId);

        console.log("Attempting to share document:", {
            documentId,
            sharedByUser: user,
            sharedWithUser: addEmail,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }

        const result = await docs.shareWithUser(documentId, user, addEmail);
        if (!result) {
            return res.status(400).json({
                success: false,
                message: "Failed to share document",
            });
        }

        return res.json({
            success: true,
            message: "Document shared successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

router.get("/email/:email", auth.checkToken, async (req, res) => {
    try {
        const documents = await docs.getAllFromEmail(req.params.email);
        return res.json({
            success: true,
            data: documents,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
