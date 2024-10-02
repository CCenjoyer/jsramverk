import {
    MongoClient,
    ObjectId,
    ServerApiVersion
} from 'mongodb';

// const uri = "mongodb://localhost:27017";


// sets the database uri to a mongoDB atlas cloud connection.
// --> Requires a .env file with DB_PASS set as a appropriate password.
const uri = `mongodb+srv://josf23:${process.env.DB_PASS}@text-editor.n78oh.mongodb.net/?retryWrites=true&w=majority&appName=text-editor`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
        serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const docs = {
    /**
     * Returns all datarows from database
     * Route /
     */
    getAll: async function getAll() {
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

    /**
     * Returns one data row if id exists else reutrn {}
     * @param {int} id 
     */
    getOne: async function getOne(id) {
        try {
            await client.connect();

            const database = client.db('documents');
            const collection = database.collection('documents');

            const query = {
                _id: new ObjectId(id)
            };

            return await collection.findOne(query);

        } catch (e) {
            console.error(e);
        } finally {
            // Ensure that the client will close when you finish
            await client.close();
        }
    },

    /**
     * Create a new data row with data
     * @param {title: text, content: textarea} body 
     */
    addOne: async function addOne(body) {
        try {
            await client.connect();
            const database = client.db('documents');
            const collection = database.collection('documents');

            const newDoc = {
                title: body.title,
                content: body.content,
            };

            // Insert the document
            return await collection.insertOne(newDoc);
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    },
    /**
     * Updates row data on route /Update?id=x
     * @param {title: text, content: textarea} body 
     * @param {int} id 
     */
    rowUpdate: async function rowUpdate(body, id) {
        try {
            await client.connect();
            const database = client.db('documents');
            const collection = database.collection('documents');

            const filter = {
                _id: new ObjectId(id)
            };

            const updateDoc = {
                $set: {
                    title: body.title,
                    content: body.content,
                }
            };

            // Update the document
            return await collection.updateOne(filter, updateDoc);
        } catch (e) {
            console.error('Error updating document:', e);
        } finally {
            await client.close();
        }
    },

    /**
     * Deletes document on route delete call to -> api/docs/:id
     * @param {string} id 
     */
    deleteOne: async function deleteOne(id) {
        try {
            await client.connect();

            const database = client.db('documents');
            const collection = database.collection('documents');

            const filter = { _id: new ObjectId(id) };
            const result = await collection.deleteOne(filter);

            // Check if the document was deleted
            if (result.deletedCount === 1) {
                console.log(`Successfully deleted document with id ${id}`);
                return {
                    success: true,
                    message: `Document with id ${id} deleted.`
                };
            } else {
                console.log(`No document found with id ${id}`);
                return {
                    success: false,
                    message: `No document found with id ${id}`
                };
            }
        } catch (e) {
            console.error('Error deleting document:', e);
            return {
                success: false,
                message: e.message
            };
        } finally {
            await client.close();
        }
    }
};

export default docs;