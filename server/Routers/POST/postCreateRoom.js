const express = require("express");
const router = express.Router();

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const generateRandomString = require("../../globalFunctions/generateRandomString");
const getRoomTemplate = require("../../globalFunctions/getRoomTemplate");

const authUUID = require("../../auth/authUUID");
const checkIfUserIsNotAlreadyInAnotherRoom = require("../../auth/checkIfUserIsNotAlreadyInAnotherRoom");

const callback = require("../../globalFunctions/callback");
const callbackError = require("../../globalFunctions/callbackError");
const server = require("../../server");

router.get("/", (req, res) => {
  let UUID = authUUID(req, res);

  const createRoom = () => {
    let canContinue = true;
    let roomId = generateRandomString("string", 5);

    const checkIfRoomIdIsAvailable = () => {
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
    checkIfRoomIdIsAvailable();

    const insertRoom = () => {
      server.db.query(
        "INSERT INTO rooms (roomId, roomParticipants, roomHostUuid) VALUES (?, ?, ?)",
        [roomId, `["${UUID}"]`, UUID],
        (err) => {
          if (err) {
            return callbackError(res, {
              message: err.message,
              errno: err.errno,
            });
          }
          server.db.query(getRoomTemplate(roomId), (err2) => {
            if (err2) {
              return callbackError(res, {
                errno: err2.errno,
                code: err2.code,
              });
            }
            const maxAge = Number(60 * 60 * 24 * 30 * 2);
            res.cookie("CURRENTROOM", roomId, {
              maxAge: maxAge,
              httpOnly: true,
            });

            callback(res, { roomId: roomId });
          });
        }
      );
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
