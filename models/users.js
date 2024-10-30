const { ObjectId } = require('mongodb');
const database = require("../db/database.js");

const users = {
    getAll: async function (res) {
        let db;

        try {
            db = await database.getDb('users');

            const filter = {};
            const projection = { email: 1, _id: 0 };

            const usersCursor = await db.collection.find(filter).project(projection).toArray();

            const returnObject = usersCursor.map(user => ({ email: user.email }));

            return res.status(200).json({
                data: returnObject
            });
        } catch (err) {
            return res.status(500).json({
                error: {
                    status: 500,
                    path: "/users",
                    title: "Database error",
                    message: err.message
                }
            });
        } finally {
            await db.client.close();
        }
    },
    addDocumentToUser: async function (email, documentId, res) {
        let db;

        try {
            // Validate documentId format
            if (!ObjectId.isValid(documentId)) {
                return res.status(400).json({
                    error: {
                        status: 400,
                        path: "/users",
                        title: "Invalid ID",
                        message: `Document ID ${documentId} is not a valid ObjectId`
                    }
                });
            }

            db = await database.getDb('users');

            // Check if user exists
            const user = await db.collection.findOne({ email: email });
            if (!user) {
                return res.status(404).json({
                    error: {
                        status: 404,
                        path: "/users",
                        title: "User not found",
                        message: `User with email ${email} not found`
                    }
                });
            }

            // Check if document exists
            const documentDb = await database.getDb('documents');
            const document = await documentDb.collection.findOne({ _id: new ObjectId(documentId) });
            if (!document) {
                return res.status(404).json({
                    error: {
                        status: 404,
                        path: "/documents",
                        title: "Document not found",
                        message: `Document with ID ${documentId} not found`
                    }
                });
            }

            const filter = { email: email };
            const update = { $addToSet: { documents: documentId } };

            const result = await db.collection.updateOne(filter, update);

            return res.status(200).json({
                message: `Document ID ${documentId} added to user with email ${email}`
            });
        } catch (err) {
            return res.status(500).json({
                error: {
                    status: 500,
                    path: "/users",
                    title: "Database error",
                    message: err.message
                }
            });
        } finally {
            await db.client.close();
        }
    }
};

module.exports = users;