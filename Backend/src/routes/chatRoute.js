const express = require("express");
const chatRouter = express.Router();
const Chat = require("../controllers/chatController");

chatRouter.post("/doc",Chat);

module.exports = chatRouter;