const express = require("express");
const router = express.Router();

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const Rooms = require("../../models/rooms");

const authUUID = require("../../auth/authUUID");

const callback = require("../../globalFunctions/callback");
const callbackError = require("../../globalFunctions/callbackError");
const generateRandomString = require("../../globalFunctions/generateRandomString");

router.post("/", (req, res) => {
  let UUID = authUUID(req, res);
  let { roomId, content } = req.body;

  if (!roomId || !content) {
    return callbackError(res, { message: "INVALID_PARAMS" });
  }

  const postMessage = async () => {
    try {
      const getRoom = await Rooms.find({ roomId: roomId }, { participants: 1 });

      if (getRoom.length === 0) {
        return callbackError(res, { message: "UNKNOWN_ROOM" });
      }

      const { participants } = getRoom[0];

      let isUserAllowedToPost = false;
      let messageData;
      participants.forEach((participant) => {
        if (participant.uuid === UUID) {
          messageData = {
            id: generateRandomString("number", 10),
            user: participant.uuid,
            nick: participant.nickname,
            pfp: participant.pfp,
            color: participant.color,
            content: content,
          };
          return (isUserAllowedToPost = true);
        }
      });

      if (!isUserAllowedToPost) {
        return callbackError(res, { message: "INVALID_USER" });
      }

      await Rooms.updateOne(
        { roomId: roomId },
        { $push: { messages: messageData } }
      );
      callback(res, {messageId: messageData.id})
    } catch (err) {
      return callbackError(res, { message: err.message, errno: err.errno });
    }
  };
  postMessage();
});

module.exports = router;