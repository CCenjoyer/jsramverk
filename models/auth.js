const database = require("../db/database.js");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

const auth = {
    deregister: async function (res, body) {
        const email = body.email;

        try {
            const db = await database.getDb('users');

            // Check if the user exists by email
            const user = await db.collection.findOne({ email: email });

            if (user) {
                await auth.deleteData(res, email, db);
            } else {
                return res.status(404).json({
                    errors: {
                        status: 404,
                        source: "/deregister",
                        title: "User not found",
                        detail: "The email does not exist."
                    }
                });
            }
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: "/deregister",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            if (db && db.client) await db.client.close();
        }
    },

    deleteData: async function (res, email, db) {
        try {
            const result = await db.collection.deleteOne({ email: email });

            if (result.deletedCount === 1) {
                return res.status(200).json({
                    message: "User data has been deleted."
                });
            } else {
                return res.status(404).json({
                    errors: {
                        status: 404,
                        source: "/deleteData",
                        title: "User not found",
                        detail: "No user found with the provided email."
                    }
                });
            }
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: "/deleteData",
                    title: "Database error",
                    detail: e.message
                }
            });
        }
    },

    login: async function (res, body) {
        const email = body.email;
        const password = body.password;

        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        let db;

        try {
            db = await database.getDb('users');
            const user = await db.collection.findOne({ email: email });

            if (user) {
                return auth.comparePasswords(res, password, user);
            } else {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "/login",
                        title: "User not found",
                        detail: "User with provided email not found."
                    }
                });
            }
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: "/login",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            if (db && db.client) await db.client.close();
        }
    },

    comparePasswords: function (res, password, user) {
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/login",
                        title: "bcrypt error",
                        detail: "bcrypt error"
                    }
                });
            }

            if (result) {
                let payload = { email: user.email };
                let jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });

                return res.json({
                    data: {
                        type: "success",
                        message: "User logged in",
                        user: payload,
                        token: jwtToken
                    }
                });
            }

            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Wrong password",
                    detail: "Password is incorrect."
                }
            });
        });
    },

    register: async function (res, body) {
        const email = body.email;
        const password = body.password;

        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/register",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        let db;

        try {
            db = await database.getDb('users');

            // Check if email already exists
            const existingUser = await db.collection.findOne({ email: email });
            if (existingUser) {
                return res.status(400).json({
                    errors: {
                        status: 400,
                        source: "/register",
                        title: "Email already registered",
                        detail: "This email is already registered."
                    }
                });
            }

            // Hash the password
            const hash = await bcrypt.hash(password, 10);

            // Insert new user document
            const newUser = {
                email: email,
                password: hash,
                // You can add additional fields here if necessary
            };

            await db.collection.insertOne(newUser);

            return res.status(201).json({
                data: {
                    message: "User successfully registered."
                }
            });
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: "/register",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            if (db && db.client) await db.client.close();
        }
    },

    checkToken: function (req, res, next) {
        let token = req.headers['x-access-token'];

        if (token) {
            jwt.verify(token, jwtSecret, function (err, decoded) {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: req.path,
                            title: "Failed authentication",
                            detail: err.message
                        }
                    });
                }

                req.user = {};
                req.user.email = decoded.email;

                return next();
            });
        } else {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: req.path,
                    title: "No token",
                    detail: "No token provided in request headers"
                }
            });
        }
    }
};

module.exports = auth;
