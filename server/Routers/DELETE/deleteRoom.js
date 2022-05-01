const express = require("express");
const router = express.Router();

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const authUUID = require("../../auth/authUUID");

const Rooms = require("../../models/rooms");

const callback = require("../../globalFunctions/callback");
const callbackError = require("../../globalFunctions/callbackError");

router.delete("/:roomId", (req, res) => {
  let UUID = authUUID(req, res);
  let { roomId } = req.params;

  if (!roomId) {
    return callbackError(res, { message: "INVALID_PARAMS" });
  }

  const deleteRoom = async () => {
    try {
      const getRoom = await Rooms.find({ roomId: roomId }, { participants: 1 });

      if (getRoom.length === 0) {
        return callbackError(res, { message: "UNKNOWN_ROOM" });
      }

      const { participants } = getRoom[0];
      let isRoomHost = false;
      participants.forEach((participant) => {
        if (participant.uuid === UUID && participant.host) {
          return (isRoomHost = true);
        }
      });

      if (isRoomHost) {
        await Rooms.deleteOne({ roomId: roomId });

        res.clearCookie("CURRENTROOM");
        return callback(res, { message: "Room successfully deleted" });
      }
      return callbackError(res, { message: "NOT_ALLOWED" });
    } catch (err) {
      return callbackError(res, { message: err.message, errno: err.code });
    }
  };
  deleteRoom();
});

module.exports = router;
