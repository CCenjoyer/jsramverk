const express = require("express");
const router = express.Router();

const data = require("../models/docs.js");
router.get(
    "/",
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => data.getAllDataForUser(res, req)
);

module.exports = router;
