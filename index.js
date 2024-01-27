const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let users = [];
let exerciseData = [];

// Function to generate a unique ID
function generateUserId() {
  return "_" + Math.random().toString(36).substr(2, 16);
}

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const userId = generateUserId();

  // Create a new user object
  const newUser = {
    _id: userId,
    username: username,
  };

  // Store the new user locally
  users.push(newUser);

  res.status(200).json(newUser);
});

function getusername(userId) {
  const user = users.find(user => user._id === userId);
    return user ? user.username : null;
}


app.post("/api/users/:_id/exercises", (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  const username = getusername(userId);

  const formattedDate = date ? new Date(date).toDateString() : new Date().toDateString();

  // Create a new exercise object
  const newExercise = {
    _id: userId,
    username: username,
    date: formattedDate,
    duration: duration,
    description: description
  };

  // if (!exerciseData[userId]) {
  //   exerciseData[userId] = [];
  // }

  // exerciseData[userId].push(newExercise);

  res.status(200).send(newExercise);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const userExercises = exerciseData[userId] || [];
  let filteredExercises = userExercises;

  if (from && to) {
    filteredExercises = filteredExercises.filter(exercise => {
      const exerciseDate = new Date(exercise.date);
      return exerciseDate >= new Date(from) && exerciseDate <= new Date(to);
    });
  }

  if (limit) {
    filteredExercises = filteredExercises.slice(0, parseInt(limit));
  }

  res.status(200).json({
    _id: userId,
    username: getusername(userId),
    count: filteredExercises.length,
    log: filteredExercises
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
