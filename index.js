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

app.get("/api/users",(req, res)=>{
  const formattedUsers = users.map(user => ({ _id: user._id, username: user.username }));
  res.status(200).json(formattedUsers);
})

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
  console.log("🚀 ~ app.post ~ username:", username)

  const formattedDate = date ? new Date(date).toDateString() : new Date().toDateString();

  const newExercise = {
    description: description,
    duration: parseInt(duration),
    date: formattedDate,
  };

  if (!exerciseData[userId]) {
    exerciseData[userId] = [];
  }

  exerciseData[userId].push(newExercise);
  
  const updatedUser = {
    username: username,
    _id: userId,
    description: description,
    duration: parseInt(duration),
    date: formattedDate,
  };

  res.status(200).json(updatedUser);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const userExercises = exerciseData[userId] || [];
  
  // Apply filters based on from and to dates if provided
  let filteredExercises = userExercises.filter(exercise => {
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const exerciseDate = new Date(exercise.date);
      return exerciseDate >= fromDate && exerciseDate <= toDate;
    }
    return true; // Return all exercises if no from and to dates provided
  });
  
  // Apply limit if provided
  if (limit) {
    filteredExercises = filteredExercises.slice(0, parseInt(limit));
  }

  const log = filteredExercises.map(exercise => ({
    description: exercise.description,
    duration: parseInt(exercise.duration),
    date: new Date(exercise.date).toDateString() // Convert to dateString format
  }));

  res.status(200).json({
    _id: userId,
    count: log.length,
    log: log
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
