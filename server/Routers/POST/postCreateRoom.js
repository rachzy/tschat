const express = require("express");
const router = express.Router();

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const generateRandomString = require("../../globalFunctions/generateRandomString");
const getRoomTemplate = require("../../globalFunctions/getRoomTemplate");
const validateParams = require("../../globalFunctions/validateParams");

const authUUID = require("../../auth/authUUID");
const checkIfUserIsNotAlreadyInAnotherRoom = require("../../auth/checkIfUserIsNotAlreadyInAnotherRoom");

const Rooms = require("../../models/rooms");

const callback = require("../../globalFunctions/callback");
const callbackError = require("../../globalFunctions/callbackError");
const server = require("../../server");

router.post("/", (req, res) => {
  let UUID = authUUID(req, res);
  let { nickname, pfp, color } = req.body;

  if (validateParams(res, nickname, pfp, color) === false) return;

  const createRoom = () => {
    let canContinue = true;
    let roomId = generateRandomString("string", 5);

    const checkIfRoomIdIsAvailable = async () => {
      //The name "ROOMS" is a reserved name
      if (roomId === "ROOMS") {
        return (roomId = generateRandomString("string", 5));
      }

      try {
        const result = await Rooms.find({ roomId: roomId }, { roomId: 1 });

        if (result.length !== 0) {
          return (roomId = generateRandomString("string", 5));
        }

        return (canContinue = true);
      } catch (err) {
        callbackError(res, { message: err.message, errno: err.code });
      }
    };
    checkIfRoomIdIsAvailable();

    const insertRoom = async () => {
      const participantsArray = [
        {
          uuid: UUID,
          nickname: nickname,
          pfp: pfp,
          color: color,
          host: true
        },
      ];

      const token = generateRandomString("string", 20);

      const Room = new Rooms({
        roomId: roomId,
        participants: participantsArray,
        token: token,
      });

      try {
        await Room.save();
        await server.db.createCollection(roomId);
        callback(res, { roomId: roomId });
      } catch (err) {
        callbackError(res, { message: err.message, errno: err.code });
      }
    };

    //Execute the function every 100ms
    const loopChecker = setInterval(() => {
      if (canContinue) {
        insertRoom();
        return clearInterval(loopChecker);
      }
      checkIfRoomIdIsAvailable();
    }, 100);
  };

  checkIfUserIsNotAlreadyInAnotherRoom(req, res, createRoom);
});

module.exports = router;
