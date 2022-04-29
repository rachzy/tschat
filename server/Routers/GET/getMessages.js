const express = require("express");
const router = express.Router();

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const Rooms = require("../../models/rooms");

const authUUID = require("../../auth/authUUID");

const callback = require("../../globalFunctions/callback");
const callbackError = require("../../globalFunctions/callbackError");

router.get("/:roomId", (req, res) => {
  let UUID = authUUID(req, res);
  let { roomId } = req.params;

  const getMessages = async () => {
    try {
      const getRoom = await Rooms.find(
        { roomId: roomId },
        { participants: 1, messages: 1 }
      );

      if (getRoom.length === 0) {
        return callbackError(res, { message: "UNKNOWN_ROOM" });
      }

      const { participants, messages } = getRoom[0];

      let isAllowedToGetMessages = false;
      participants.forEach((participant) => {
        if (participant.uuid === UUID) return (isAllowedToGetMessages = true);
      });

      if (!isAllowedToGetMessages) {
        return callbackError(res, { message: "NOT_ALLOWED" });
      }

      callback(res, { messages: messages });
    } catch (err) {
      callbackError(res, { message: err.message, errno: err.code });
    }
  };
  getMessages();
});

module.exports = router;
