//Validate params for creating rooms

const callbackError = require("../globalFunctions/callbackError");

const validateParams = (res, nickname, pfp, color) => {
  if (!nickname || nickname.length < 4 || !pfp || !color) {
    callbackError(res, { message: "INVALID_PARAMS" });
    return false;
  }

  if (!["red", "blue", "green", "yellow", "white"].includes(color)) {
    callbackError(res, { message: "INVALID_COLOR" });
    return false;
  }

  return true;
};

module.exports = validateParams;