import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

const app = express();

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "view")));
app.use(express.static(path.join(__dirname, "images")));

app.get("/", (req, res, next) => {
  res.sendFile("index.html");
});

const server = app.listen(PORT);
const io = new Server(server);

let room = [];
let roomID;

io.on("connection", (socket) => {
  console.log("client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("createRoom", (roomId) => {
    roomID = roomId;
    room[roomID] = { p1Choice: null };
    room[roomID] = { p1Score: 0 };
    socket.join(roomID);
    socket.to(roomID).emit("playersConnected", { roomID: roomID });
  });

  socket.on("joinRoom", (roomID) => {
    console.log(roomID);
    socket.join(roomID);
    room[roomID] = { p2Choice: null };
    room[roomID] = { p2Score: 0 };
    console.log("client 2 joined");
    socket.to(roomID).emit("playersConnected");
    socket.emit("playersConnected");
  });

  socket.on("p1Choice", (data) => {
    if (data) {
      const choice = data.rpschoice;
      const roomID = data.roomID;
      room[roomID].p1Choice = choice;
      socket
        .to(roomID)
        .emit("p1Choice", { rpsValue: choice, score: room[roomID].p1Score });
      if (room[roomID].p2Choice ) {
        declareWinner(roomID);
      }else{
        socket.emit('waitingForPlayer')
      }
    }
  });

  socket.on("p2Choice", (data) => {
    if (data) {
      const choice = data.rpschoice;
      const roomID = data.roomID;
      room[roomID].p2Choice = choice;
      socket
        .to(roomID)
        .emit("p2Choice", { rpsValue: choice, score: room[roomID].p2Score });
      if (room[roomID].p1Choice ) {
        declareWinner(roomID);
      }else{
        socket.emit('waitingForPlayer')
      }
    }
  });

  socket.on("playerClicked", (data) => {
    const roomID = data.roomID;
    room[roomID].p1Score = data.score;
    room[roomID].p1Choice = null;
    console.log(room[roomID]);
    socket
      .to(roomID)
      .emit("playAgain", {
        p1Score: room[roomID].p1Score,
        p2Score: room[roomID].p2Score,
      });
  });

  socket.on('exitGame', (data) => {
    const roomID = data.roomID;
    socket.leave(roomID);
    socket.emit('startPage');
  });

});


const declareWinner = (roomID) => {
  let winner;
  if (room[roomID].p1Choice == room[roomID].p2Choice) {
    winner = "draw";
  } else if (room[roomID].p1Choice == "rock") {
    if (room[roomID].p2Choice == "scissor") {
      winner = "p1";
    } else {
      winner = "p2";
    }
  } else if (room[roomID].p1Choice == "paper") {
    if (room[roomID].p2Choice == "scissor") {
      winner = "p2";
    } else {
      winner = "p1";
    }
  } else if (room[roomID].p1Choice == "scissor") {
    if (room[roomID].p2Choice == "rock") {
      winner = "p2";
    } else {
      winner = "p1";
    }
  }
  io.sockets.to(roomID).emit("winner", winner);
};
