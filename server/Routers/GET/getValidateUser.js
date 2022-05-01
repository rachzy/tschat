const express = require("express");
const router = express.Router();

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const authUUID = require("../../auth/authUUID");

const callback = require("../../globalFunctions/callback");
const callbackError = require("../../globalFunctions/callbackError");

const Rooms = require("../../models/rooms");

router.get("/:roomId/", (req, res) => {
  let UUID = authUUID(req, res);
  const { roomId } = req.params;

  if (!UUID || !roomId) {
    return callbackError(res, { message: "INVALID_PARAMS" });
  }

  const validateUser = async() => {
    try {
      const getRoom = await Rooms.find({roomId: roomId}, {participants: 1});

      if(getRoom.length === 0) {
        return callbackError(res, { message: "UNKNOWN_ROOM" });
      }

      const { participants } = getRoom[0];

      let isUserInThisRoom = false;
      let userData;
      participants.forEach((participant) => {
        if (participant.uuid === UUID) {
          userData = {
            nick: participant.nickname,
            color: participant.color,
            isHost: participant.host
          }
          return (isUserInThisRoom = true);
        }
      });

      if (isUserInThisRoom) {
        return callback(res, {
          userData: userData
        });
      }
      return callbackError(res, { message: "INVALID_USER" });
    } catch(err) {
      return callbackError(res, { message: err.message, errno: err.code })
    }
  };
  validateUser();
});

module.exports = router;
