const mongo = require("mongodb").MongoClient;

const database = {
    getDb: async function getDb(collectionName) {
        let dsn = `mongodb+srv://josf23:${process.env.DB_PASS}@text-editor.n78oh.mongodb.net/?retryWrites=true&w=majority&appName=text-editor`;

        if (process.env.NODE_ENV === "test") {
            dsn = "mongodb://localhost:27017/test";
        }

        const client = await mongo.connect(dsn);
        const db = await client.db("documents");
        const collection = await db.collection(collectionName);

        return {
            db: db,
            collection: collection,
            client: client,
        };
    },
};

module.exports = database;
