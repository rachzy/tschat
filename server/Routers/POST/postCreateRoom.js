const express = require("express");
const router = express.Router();

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const generateRandomString = require("../../globalFunctions/generateRandomString");
const getRoomTemplate = require("../../globalFunctions/getRoomTemplate");

const callback = require("../../globalFunctions/callback");
const callbackError = require("../../globalFunctions/callbackError");
const server = require("../../server");

router.get("/", (req, res) => {
  let { uuid } = req.cookies;

  if (!uuid || uuid === "") {
    const generateUuid = generateRandomString("string", 25);
    const maxAge = Number(60 * 60 * 24 * 30 * 2);

    res.cookie("uuid", generateUuid, { maxAge: maxAge, httpOnly: true });
    uuid = generateUuid;
  }

  let canContinue = false;
  let roomId = generateRandomString("string", 5);

  const checkIfRoomIdIsAvaliable = () => {
    console.log(roomId);
    server.db.query(
      "SELECT roomId FROM rooms WHERE roomId = ?",
      [roomId],
      (err, result) => {
        if (err) {
          clearInterval(loopChecker);
          return callbackError({ message: err.message, errno: err.errno });
        }

        if (result.length !== 0) {
          return (roomId = generateRandomString("string", 5));
        }

        return (canContinue = true);
      }
    );
  };
  checkIfRoomIdIsAvaliable();

  const insertRoom = () => {
    server.db.query(
      "INSERT INTO rooms (roomId, roomParticipants, roomHostUuid) VALUES (?, ?, ?)",
      [roomId, `[${uuid}]`, uuid],
      (err) => {
        if (err) {
          return callbackError(res, { message: err.message, code: err.errno });
        }
        server.db.query(getRoomTemplate(roomId), (err2) => {
          if (err2) {
            return callbackError(res, {
              errno: err2.errno,
              code: err2.code,
            });
          }
          callback(res, { roomId: roomId });
        });
      }
    );
  };

  const checkIfInsertionCanBeMade = () => {
      if(canContinue) {
          insertRoom();
          return clearInterval(loopChecker);
      }
      checkIfRoomIdIsAvaliable();
  }
  checkIfInsertionCanBeMade();

  const loopChecker = setInterval(checkIfInsertionCanBeMade, 100);
});

module.exports = router;
