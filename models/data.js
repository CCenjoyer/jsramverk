const database = require("../db/database.js");
const ObjectId = require("mongodb").ObjectId;

const data = {
    getAllDataForUser: async function (res, req) {
        let db;

        try {
            db = await database.getDb();

            const filter = {
                "users.email": req.user.email,
            };

            const cursor = db.collection.aggregate([
                { $match: filter },
                { $unwind: "$users" },
                { $match: { "users.email": req.user.email } },
                { $replaceRoot: { newRoot: "$users" } },
            ]);

            const userData = await cursor.toArray();

            return res.json({ data: userData });
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    path: "/data",
                    title: "Database error",
                    message: e.message,
                },
            });
        } finally {
            if (db && db.client) await db.client.close();
        }
    },

    createData: async function (res, req) {
        const email = req.user.email;
        let db;

        try {
            db = await database.getDb();

            const filter = { "users.email": email };
            const updateDoc = {
                $push: {
                    "users.$.data": {
                        artefact: req.body.artefact,
                        _id: new ObjectId(),
                    },
                },
            };

            const result = await db.collection.findOneAndUpdate(
                filter,
                updateDoc,
                { returnDocument: "after" }
            );

            if (result.value) {
                return res.status(201).json({ data: result.value });
            } else {
                return res.status(404).json({
                    errors: {
                        status: 404,
                        path: "/data",
                        title: "User not found",
                        message: "User with provided email does not exist.",
                    },
                });
            }
        } catch (e) {
            return res.status(500).json({
                error: {
                    status: 500,
                    path: "POST /data INSERT",
                    title: "Database error",
                    message: e.message,
                },
            });
        } finally {
            if (db && db.client) await db.client.close();
        }
    },

    updateData: async function (res, req) {
        const { id, artefact } = req.body;

        if (!id) {
            return res.status(400).json({
                error: {
                    status: 400,
                    path: "PUT /data no id",
                    title: "No id provided",
                    message: "No data id provided",
                },
            });
        }

        let db;

        try {
            db = await database.getDb();

            const filter = { "users.data._id": ObjectId(id) };
            const originalObject = await db.collection.findOne(filter);

            if (!originalObject) {
                return res.status(404).json({
                    errors: {
                        status: 404,
                        path: "PUT /data",
                        title: "Data not found",
                        message: "Data with provided id does not exist.",
                    },
                });
            }

            const updateFilter = { _id: originalObject["_id"] };
            const updateDoc = {
                $set: {
                    "users.$[user].data.$[data].artefact": artefact,
                },
            };
            const arrayFilters = [
                { "user.email": req.user.email },
                { "data._id": ObjectId(id) },
            ];

            await db.collection.updateOne(updateFilter, updateDoc, {
                arrayFilters,
            });

            return res.status(204).send();
        } catch (e) {
            return res.status(500).json({
                error: {
                    status: 500,
                    path: "PUT /data UPDATE",
                    title: "Database error",
                    message: e.message,
                },
            });
        } finally {
            if (db && db.client) await db.client.close();
        }
    },

    deleteData: async function (res, req) {
        const id = req.body.id;

        if (!id) {
            return res.status(400).json({
                error: {
                    status: 400,
                    path: "DELETE /data no id",
                    title: "No id provided",
                    message: "No data id provided",
                },
            });
        }

        let db;

        try {
            db = await database.getDb();

            const filter = {
                "users.email": req.user.email,
                "users.data._id": ObjectId(id),
            };

            const deleteDoc = {
                $pull: {
                    "users.$.data": {
                        _id: ObjectId(id),
                    },
                },
            };

            const result = await db.collection.updateOne(filter, deleteDoc);

            if (result.modifiedCount === 0) {
                return res.status(404).json({
                    errors: {
                        status: 404,
                        path: "DELETE /data",
                        title: "Data not found",
                        message: "Data with provided id does not exist.",
                    },
                });
            }

            return res.status(204).send();
        } catch (e) {
            return res.status(500).json({
                error: {
                    status: 500,
                    path: "DELETE /data DELETE",
                    title: "Database error",
                    message: e.message,
                },
            });
        } finally {
            if (db && db.client) await db.client.close();
        }
    },
};

module.exports = data;
