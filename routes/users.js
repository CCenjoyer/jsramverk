const express = require('express');
const router = express.Router();

const users = require("../models/users.js");

router.get('/', (req, res) => users.getAll(res));
router.get('/:id', (req, res) => users.getUser(res, req.params.id));

// Add a document_id to a user
router.post('/:email/add-doc', (req, res) => {
    const email = req.params.email;
    const document_id = req.body.document_id;

    if (!document_id || !email) {
        return res.status(400).json({
            error: {
                status: 400,
            },
            message: "Missing document_id or email"
    })
    }

    users.addDocumentToUser(email, document_id, res);

});

module.exports = router;