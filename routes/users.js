const express = require("express");
const router = express.Router();

const users = require("../models/users.js");

router.get("/", (req, res) => users.getAll(res));
router.get("/:id", (req, res) => users.getUser(res, req.params.id));

module.exports = router;
