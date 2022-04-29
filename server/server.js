require("dotenv").config();

const PORT = process.env.PORT || 8000;
const Express = require("express");
const app = new Express();

const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;

db.on('error', (err) => {console.log(err)});
db.once('open', () => {console.log("Connected to the Database")});

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(cors({credentials: true, origin: true}));
app.use(helmet());

app.disable("x-powered-by");

app.get("/api/", (req, res) => {
  res.sendStatus(200);
});

//POST

const postCreateRoom = require("./Routers/POST/postCreateRoom");
app.use("/api/createroom", postCreateRoom);

const postJoinRoom = require("./Routers/POST/postJoinRoom");
app.use("/api/joinroom", postJoinRoom);

//GET

const getValidateUsers = require("./Routers/GET/getValidateUser");
app.use("/api/validateuser", getValidateUsers);

const getMessages = require("./Routers/GET/getMessages");
app.use("/api/getmessages", getMessages);

app.listen(PORT, () => {
  console.log(`Server hosted on http://localhost:${PORT}`);
});

module.exports.db = db;