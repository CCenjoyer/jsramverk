import openDb from './db/database.mjs';
const database = import("./db/database.js");

import {
    MongoClient,
    ObjectId
} from 'mongodb';


const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const docs = {
    /**
     * Returns all datarows from database
     * Route /
     */
    getAll: async function getAll() {
        let db = await openDb();

        try {
            return await db.all('SELECT rowid as id, * FROM documents');
        } catch (e) {
            console.error(e);

            return [];
        } finally {
            await db.close();
        }
    },

    /**
     * Returns one data row if id exists else reutrn {}
     * @param {int} id 
     */
    getOne: async function getOne(id) {
        let db = await openDb();

        try {
            return await db.get('SELECT rowid, * FROM documents WHERE rowid=?', id);
        } catch (e) {
            console.error(e);

            return {};
        } finally {
            await db.close();
        }
    },

    /**
     * Create a new data row with data
     * @param {title: text, content: textarea} body 
     */
    addOne: async function addOne(body) {
        let db = await openDb();

        try {
            return await db.run(
                'INSERT INTO documents (title, content) VALUES (?, ?)',
                body.title,
                body.content,
            );
        } catch (e) {
            console.error(e);
        } finally {
            await db.close();
        }
    },
    /**
     * Updates row data on route /Update?id=x
     * @param {title: text, content: textarea} body 
     * @param {int} id 
     */
    rowUpdate: async function rowUpdate(body, id) {
        let db = await openDb();

        try {
            return await db.run(
                `UPDATE documents 
                SET title = ?, content = ?  
                WHERE rowid = ?`,
                body.title,
                body.content,
                id,
            );
        } catch (e) {
            console.error(e);
        } finally {
            await db.close();
        }
    },

    GetAllDB: async function GetAllDB() {
        try {
            // Connect to the MongoDB cluster
            await client.connect();

            // Choose the database and collection
            const database = client.db('documents');
            const collection = database.collection('documents');

            // Find all documents in the collection
            return await collection.find({}).toArray();

        } catch (e) {
            console.error(e);
        } finally {
            // Ensure that the client will close when you finish
            await client.close();
        }

    },
    getOneDB: async function getOneDB(id) {
        try {
            // Connect to the MongoDB cluster
            await client.connect();
    
            // Choose the database and collection
            const database = client.db('documents'); 
            const collection = database.collection('documents');
    
            // Convert the string `id` to an ObjectId
            const query = { _id: new ObjectId(id) };
    
            // Find the single document by _id
            const document = await collection.findOne(query);
                
            return document; // Return the single document
    
        } catch (e) {
            console.error(e);
        } finally {
            // Ensure that the client will close when you finish
            await client.close();
        }
    },
    rowUpdateDB: async function rowUpdateDB(id) {
        try {
            await client.connect();
            const database = client.db('documents'); 
            const collection = database.collection('documents');
    
            // Convert `id` to ObjectId
            const filter = { _id: id };
    
            // Define the update operation
            const updateDoc = {
                $set: {
                    title: body.title,
                    content: body.content,
                }
            };
    
            // Update the document
            const result = await collection.updateOne(filter, updateDoc);
    
            console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s).`);
    
            return result;
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    },

};

export default docs;