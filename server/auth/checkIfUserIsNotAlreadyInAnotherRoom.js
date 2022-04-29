const Rooms = require("../models/rooms");
const callbackError = require("../globalFunctions/callbackError");

const checkIfUserIsNotAlreadyInAnotherRoom = async (
  req,
  res,
  afterFunction
) => {
  let { UUID, CURRENTROOM } = req.cookies;

  if (CURRENTROOM) {
    try {
      const result = await Rooms.find(
        { roomId: CURRENTROOM },
        { participants: 1 }
      );

      if (result.length !== 0) {
        const { participants } = result[0];

        let isInAnotherRoom = false;
        participants.forEach((participant) => {
          if (participant.uuid === UUID) return (isInAnotherRoom = true);
        });

        if (isInAnotherRoom) {
          return callbackError(res, {
            message: "USER_IS_ALREADY_IN_ANOTHER_ROOM",
            roomId: CURRENTROOM,
          });
        }
      }
      res.clearCookie("CURRENTROOM");
      afterFunction();
    } catch (err) {
      callbackError(res, { message: err.message, errno: err.code });
    }
    return;
  }
  afterFunction();
};

module.exports = checkIfUserIsNotAlreadyInAnotherRoom;
