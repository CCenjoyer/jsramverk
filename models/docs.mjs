import { ObjectId } from 'mongodb';
import database from '../db/database.js';

const docs = {
    /**
     * Returns all datarows from database
     * Route /
     */
    getAll: async function getAll() {
        let db;

        try {
            // Get the database and collection
            db = await database.getDb('documents');

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
            db = await database.getDb('documents');

            const query = {
                _id: new ObjectId(id)
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
            db = await database.getDb('documents');

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
            db = await database.getDb('documents');

            const filter = {
                _id: new ObjectId(id)
            };

            const updateDoc = {
                $set: doc
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
            db = await database.getDb('documents');

            const filter = {
                _id: new ObjectId(id)
            };

            return await db.collection.deleteOne(filter);
        } catch (e) {
            console.error(e);
        } finally {
            // Ensure that the client will close when you finish
            await db.client.close();
        }
    }
};

export default docs;