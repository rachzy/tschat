const generateRandomString = require("../globalFunctions/generateRandomString");

//If the UUID doesn't exist, generate one
const authUUID = (req, res) => {
  let { UUID } = req.cookies;

  if (!UUID) {
    const generateUuid = generateRandomString("string", 25);
    const maxAge = Number(60 * 60 * 24 * 30 * 2);

    res.cookie("UUID", generateUuid, { maxAge: maxAge, httpOnly: true });
    return generateUuid;
  }
  return UUID;
};

module.exports = authUUID;
