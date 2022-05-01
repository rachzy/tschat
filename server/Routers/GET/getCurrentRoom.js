const express = require("express");
const router = express.Router();

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const Rooms = require("../../models/rooms");

const authUUID = require("../../auth/authUUID");

const callback = require("../../globalFunctions/callback");
const callbackError = require("../../globalFunctions/callbackError");

router.get("/", (req, res) => {
  let UUID = authUUID(req, res);
  let { CURRENTROOM } = req.cookies;

  if (!CURRENTROOM) return callbackError(res, { message: "NO_CURRENT_ROOM" });

  const checkIfUserIsAlreadyInARoom = async () => {
    const clearCookieErrorCallback = (message) => {
      res.clearCookie("CURRENTROOM");
      callbackError(res, { message: message });
    };

    try {
      const getRoom = await Rooms.find(
        { roomId: CURRENTROOM },
        { participants: 1 }
      );
      if (getRoom.length === 0) return clearCookieErrorCallback("UNKNOWN_ROOM");

      const { participants } = getRoom[0];
      let isMember = false;
      participants.forEach((participant) => {
        if (participant.uuid === UUID) return (isMember = true);
      });

      if (isMember) return callback(res, { roomId: CURRENTROOM });
      return clearCookieErrorCallback("INVALID_MEMBER");
    } catch (err) {
      callbackError(res, { message: err.message, errno: err.code });
    }
  };
  checkIfUserIsAlreadyInARoom();
});

module.exports = router;
