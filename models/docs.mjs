import { ObjectId } from "mongodb";
import database from "../db/database.js";
import sendEmail from "./sendgrid.js";
import users from "./users.js";

const docs = {
    /**
     * Returns all data rows from database
     * Route /
     */
    getAll: async function getAll() {
        let db;

        try {
            // Get the database and collection
            db = await database.getDb("documents");

            // Find all documents in the collection
            return await db.collection.find({}).toArray();
        } catch (e) {
            console.error(e);
        } finally {
            // Ensure that the client will close when you finish
            await db.client.close();
        }
    },

    /**
     *
     * @param {string} email
     * @returns
     */
    getAllFromEmail: async function getAllFromEmail(email) {
        let db;

        try {
            // Get the database and collection
            db = await database.getDb("documents");

            // Find all documents in the collection
            return await db.collection.find({ users: email }).toArray();
        } catch (e) {
            console.error(e);
        } finally {
            // Ensure that the client will close when you finish
            await db.client.close();
        }
    },

    /**
     * Returns one data row if id exists else return {}
     * @param {string} id
     */
    getOne: async function getOne(id) {
        let db;

        try {
            // Validate id format
            if (!ObjectId.isValid(id)) {
                throw new Error(`Invalid ID format: ${id}`);
            }

            // Get the database and collection
            db = await database.getDb("documents");

            const query = {
                _id: new ObjectId(id),
            };

            return await db.collection.findOne(query);
        } catch (e) {
            console.error(e);
        } finally {
            // Ensure that the client will close when you finish
            await db.client.close();
        }
    },

    /**
     * Create a new document
     * @param {object} doc
     */
    addOne: async function addOne(doc) {
        let db;

        try {
            // Get the database and collection
            db = await database.getDb("documents");

            // Insert the document
            return await db.collection.insertOne(doc);
        } catch (e) {
            console.error(e);
        } finally {
            // Ensure that the client will close when you finish
            await db.client.close();
        }
    },

    /**
     * Update an existing document by ID
     * @param {string} id
     * @param {object} doc
     */
    updateOne: async function updateOne(id, doc) {
        let db;

        try {
            // Validate id format
            if (!ObjectId.isValid(id)) {
                throw new Error(`Invalid ID format: ${id}`);
            }

            // Get the database and collection
            db = await database.getDb("documents");

            const filter = {
                _id: new ObjectId(id),
            };

            const updateDoc = {
                $set: doc,
            };

            return await db.collection.updateOne(filter, updateDoc);
        } catch (e) {
            console.error(e);
        } finally {
            // Ensure that the client will close when you finish
            await db.client.close();
        }
    },

    /**
     * Delete a document by ID
     * @param {string} id
     */
    deleteOne: async function deleteOne(id) {
        let db;

        try {
            // Validate id format
            if (!ObjectId.isValid(id)) {
                throw new Error(`Invalid ID format: ${id}`);
            }

            // Get the database and collection
            db = await database.getDb("documents");

            const filter = {
                _id: new ObjectId(id),
            };

            return await db.collection.deleteOne(filter);
        } catch (e) {
            console.error(e);
        } finally {
            // Ensure that the client will close when you finish
            await db.client.close();
        }
    },

    /**
     * Share a document with a user
     * @param {string} docId        // id of document
     * @param {string} userEmail    // email of user present in users array
     * @param {string} addEmail     // email to add to array
     */
    shareWithUser: async function shareWithUser(docId, userEmail, addEmail) {
        let db;

        try {
            // Validate id format
            if (!ObjectId.isValid(docId)) {
                throw new Error(`Invalid ID format: ${docId}`);
            }

            // Get the database and collection
            db = await database.getDb("documents");

            const filter = {
                _id: new ObjectId(docId),
            };
            console.log("Attempting to share document:", {
                documentId: docId,
                sharedByUser: userEmail,
                sharedWithUser: addEmail,
            });

            const document = await this.getOne(docId);
            if (
                !document ||
                !document.users ||
                !document.users.includes(userEmail) ||
                document.users.includes(addEmail)
            ) {
                return false;
            }

            const updateDoc = { $push: { users: addEmail } };
            const result = await db.collection.updateOne(filter, updateDoc);
            const userList = await users.getAll();

            if (!Array.isArray(userList) || !userList.includes(addEmail)) {
                sendEmail(
                    addEmail,
                    "A Document has been shared with you",
                    `You have been added to a document by ${userEmail}. Document ID: ${docId},
                    Register here:,
                    <a href="https://www.student.bth.se/~josf23/editor/login">Register</a>`
                );
            }
            return result;
        } catch (e) {
            console.error(e);
            return false;
        } finally {
            // Ensure that the client will close when you finish
            await db.client.close();
        }
    },

    updateDocument: async function updateDocument(id, body) {
        let db;

        try {
            // Validate id format
            if (!ObjectId.isValid(id)) {
                throw new Error(`Invalid ID format: ${id}`);
            }

            // Get the database and collection
            db = await database.getDb("documents");

            const filter = {
                _id: new ObjectId(id),
            };

            const updateDoc = {
                $set: {
                    content: body.content,
                    title: body.title,
                },
            };

            return await db.collection.updateOne(filter, updateDoc);
        } catch (e) {
            console.error(e);
        } finally {
            // Ensure that the client will close when you finish
            await db.client.close();
        }
    },
};

export default docs;
