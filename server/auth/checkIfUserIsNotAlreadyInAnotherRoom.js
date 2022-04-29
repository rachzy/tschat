const Rooms = require("../models/rooms");
const callbackError = require("../globalFunctions/callbackError");

const checkIfUserIsNotAlreadyInAnotherRoom = async (
  req,
  res,
  afterFunction
) => {
  let { UUID, CURRENTROOM } = req.cookies;

  if (CURRENTROOM || CURRENTROOM !== "") {
    try {
      const result = await Rooms.find(
        { roomId: CURRENTROOM },
        { participants: 1 }
      );

      const { participants } = result;

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
      afterFunction();
    } catch (err) {
      callbackError(res, { message: err.message, errno: err.code });
    }
  }
};

module.exports = checkIfUserIsNotAlreadyInAnotherRoom;
