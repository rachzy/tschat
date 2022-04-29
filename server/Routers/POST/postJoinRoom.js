const express = require("express");
const router = express.Router();

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const validateParams = require("../../globalFunctions/validateParams");

const authUUID = require("../../auth/authUUID");
const checkIfUserIsNotAlreadyInAnotherRoom = require("../../auth/checkIfUserIsNotAlreadyInAnotherRoom");

const callbackError = require("../../globalFunctions/callbackError");

const Rooms = require("../../models/rooms");

router.post("/", (req, res) => {
  let UUID = authUUID(req, res);
  let { roomId, nickname, pfp, color } = req.body;

  if (validateParams(res, nickname, pfp, color) === false) return;

  const joinRoom = async () => {
    try {
      const getRoom = await Rooms.find(
        { roomId: roomId },
        { roomParticipants: 1 }
      );

      if (getRoom.length === 0) {
        return callbackError(res, { message: "ROOM_NOT_FOUND" });
      }

      const { participants } = getRoom;

      let canContinue = true;
      participants.forEach((participant) => {
        if (!canContinue) return;

        if (participant.uuid === UUID) {
          canContinue = false;
          return callbackError(res, { message: "USER_ALREADY_IN_THE_ROOM" });
        }

        if (participant.nickname === nickname) {
          canContinue = false;
          return callbackError(res, { message: "NICKNAME_ALREADY_IN_USE" });
        }
      });

      if (!canContinue) return;

      const newParticipantsArray = [
        ...participants,
        {
          uuid: UUID,
          nickname: nickname,
          pfp: pfp,
          color: color,
          host: false,
        },
      ];

      await Rooms.updateOne(
        { roomId: roomId },
        { $push: { participants: newParticipantsArray } }
      );
    } catch (err) {
      return callbackError(res, { message: err.message, errno: err.code });
    }
  };

  checkIfUserIsNotAlreadyInAnotherRoom(req, res, joinRoom);
});

module.exports = router;
