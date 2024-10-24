const database = require("../db/database.js");

const users = {
    getAll: async function (res) {
        let db;

        try {
            db = await database.getDb();

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
    }
};

module.exports = users;