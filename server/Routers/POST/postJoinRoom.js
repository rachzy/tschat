const express = require("express");
const router = express.Router();

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const generateRandomString = require("../../globalFunctions/generateRandomString");
const getRoomTemplate = require("../../globalFunctions/getRoomTemplate");
const validateParams = require("../../globalFunctions/validateParams");

const authUUID = require("../../auth/authUUID");
const checkIfUserIsNotAlreadyInAnotherRoom = require("../../auth/checkIfUserIsNotAlreadyInAnotherRoom");

const callback = require("../../globalFunctions/callback");
const callbackError = require("../../globalFunctions/callbackError");
const server = require("../../server");

router.post("/", (req, res) => {
  let UUID = authUUID(req, res);
  let { roomId, nickname, pfp, color } = req.body;

  if (validateParams(res, nickname, pfp, color) === false) return;

  const userArray = {
    uuid: UUID,
    nickname: nickname,
    pfp: pfp,
    color: color,
  };

  const joinRoom = () => {
    server.db.query(
      "SELECT roomParticipants FROM rooms WHERE roomId = ?",
      [roomId],
      (err, result) => {
        if (err) {
          return callbackError(res, { message: err.message, errno: err.errno });
        }

        if (result.length === 0) {
          return callbackError(res, { message: "ROOM_NOT_FOUND" });
        }

        const participantsArray = result[0].roomParticipants;

        let canContinue = true;
        participantsArray.forEach((participant) => {
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
          ...participantsArray,
          userArray,
        ].toString();

        server.db.query(
          "UPDATE rooms SET roomParticipants = ? WHERE roomId = ?",
          [newParticipantsArray, roomId],
          (err2) => {
            if (err2) {
              return callbackError(res, {
                message: err2.message,
                errno: err2.errno,
              });
            }

            const maxAge = Number(60 * 60 * 24 * 30 * 2);
            res.cookie("CURRENTROOM", roomId, {
              maxAge: maxAge,
              httpOnly: true,
            });

            callback(res, { roomId: roomId });
          }
        );
      }
    );
  };
});
