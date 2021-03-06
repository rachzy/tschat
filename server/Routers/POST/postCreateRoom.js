const express = require("express");
const router = express.Router();

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const generateRandomString = require("../../globalFunctions/generateRandomString");
const validateParams = require("../../globalFunctions/validateParams");

const authUUID = require("../../auth/authUUID");
const checkIfUserIsNotAlreadyInAnotherRoom = require("../../auth/checkIfUserIsNotAlreadyInAnotherRoom");

const Rooms = require("../../models/rooms");

const callback = require("../../globalFunctions/callback");
const callbackError = require("../../globalFunctions/callbackError");

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
        const getRoom = await Rooms.find({ roomId: roomId }, { roomId: 1 });

        if (getRoom.length !== 0) {
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

      const defaultMessage = [{
        id: generateRandomString("number", 10),
        user: "BOT",
        nick: "TSB",
        pfp: "bot.png",
        color: "white",
        content: "I'm the TS Bot, have fun in your chat room!"
      }]

      const Room = new Rooms({
        roomId: roomId,
        participants: participantsArray,
        messages: defaultMessage,
        token: token,
      });

      try {
        await Room.save();

        const maxAge = Number(60 * 60 * 24 * 7);
        res.cookie("CURRENTROOM", roomId, { maxAge: maxAge, httpOnly: true });

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
