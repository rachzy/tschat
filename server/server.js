const PORT = process.env.PORT || 8000;
const Express = require("express");
const app = new Express();

const cors = require("cors");
const helmet = require("helmet");
const mysql = require("mysql2");

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "tschat",
});

const callback = require("./globalFunctions/callback");
const callbackError = require("./globalFunctions/callbackError");

app.get("/api/", (req, res) => {
  db.query("SELECT 1 + 1", (err, result) => {
    if (err) res.sendStatus(500);
    if (result) res.sendStatus(200);
  });
});

const postCreateRoom = require("./Routers/POST/postCreateRoom");
app.use("/api/createroom", postCreateRoom)

app.listen(PORT, () => {
  console.log(`Server hosted on http://localhost${PORT}`);
});

module.exports.db = db;