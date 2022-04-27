const callbackError = require("../globalFunctions/callbackError");
const server = require("../server");

const checkIfUserIsNotAlreadyInAnotherRoom = (req, res, afterFunction) => {
  let { UUID, CURRENTROOM } = req.cookies;

  if (CURRENTROOM || CURRENTROOM !== "") {
    server.db.query(
      "SELECT roomParticipants FROM rooms WHERE roomId = ?",
      [CURRENTROOM],
      (err, result) => {
        if (err) {
          return callbackError(res, {
            message: err.message,
            errno: err.errno,
          });
        }

        //If the result is empty, that room doesn't exist
        if (result.length === 0) {
          res.clearCookie("CURRENTROOM");
          return afterFunction();
        }

        const participantsArray = JSON.parse(result[0].roomParticipants);

        let isInAnotherRoom = false;
        participantsArray.forEach((participant) => {
          if (participant.uuid !== UUID) return;
          return (isInAnotherRoom = true);
        });

        if (isInAnotherRoom) {
          return callbackError(res, {
            message: "USER_IS_ALREADY_IN_ANOTHER_ROOM",
          });
        }
        afterFunction();
      }
    );
  }
};

module.exports = checkIfUserIsNotAlreadyInAnotherRoom;