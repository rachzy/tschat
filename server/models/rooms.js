const Mongoose = require("mongoose");

const participant = [
  {
    uuid: String,
    nickname: String,
    pfp: String,
    color: "red" | "blue" | "green" | "yellow" | "white",
    host: Boolean,
  },
];

const messages = [
  {
    id: Number,
    user: String,
    nick: String,
    pfp: String,
    color: "red" | "blue" | "green" | "yellow" | "white",
    content: String,
  },
];

const roomsSchema = new Mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  participants: {
    type: participant,
    required: true,
  },
  messages: {
    type: messages,
    required: false,
  },
  token: {
    type: String,
    required: true,
  },
});

module.exports = Mongoose.model("Rooms", roomsSchema);
