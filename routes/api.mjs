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

export default router;
