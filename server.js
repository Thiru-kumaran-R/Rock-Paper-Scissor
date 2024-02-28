import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { Server } from 'socket.io'

const app = express();

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'view')));
app.use(express.static(path.join(__dirname, 'images')));

app.get('/', (req, res, next) => {
    res.sendFile('index.html');
})

const server = app.listen(PORT);
const io = new Server(server);

let room = [];
let roomID;

io.on('connection', socket => {
    console.log('client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('createRoom', (roomId) => {
        roomID = roomId;
        room[roomID] = {p1Choice : null}
        room[roomID] = {p1Score : 0}
        socket.join(roomID);
        socket.to(roomID).emit('playersConnected', {roomID : roomID})
    });

    socket.on('joinRoom', roomID => {
        console.log(roomID);
        socket.join(roomID);
        room[roomID] = {p2Choice : null}
        room[roomID] = {p2Score : 0}
        console.log('client 2 joined');
        socket.to(roomID).emit('playersConnected');
        socket.emit('playersConnected');
    });

    socket.on('p1Choice', data => {
        if(data){
            const choice = data.rpschoice;
            const roomID = data.roomID;
            room[roomID].p1Choice = choice;
            socket.to(roomID).emit('p1Choice', {rpsValue : choice})
            if(room[roomID].p2Choice != null){
                declareWinner(roomID)
            }
        }  
    });

    socket.on('p2Choice', data => {
        if(data){
            const choice = data.rpschoice;
            const roomID = data.roomID;
            room[roomID].p2Choice = choice;
            socket.to(roomID).emit('p2Choice', {rpsValue : choice})
            if(room[roomID].p1Choice != null){
                declareWinner(roomID)
            }
        }
    })

    socket.on('p1Score', data => {
        const roomID = data.roomID;
        room[roomID].p1Score = data.score;
        room[roomID].p1Choice = null;
        const player1 = data.player1;
        console.log(room);
        if(player1){
            socket.to(roomID).emit('p1Score', {score : room[roomID].p1Score, choice : room[roomID].p1Choice });
        }
    });

    socket.on('p2Score', data => {
        const roomID = data.roomID;
        room[roomID].p2Score = data.score;
        room[roomID].p2Choice = null;
        const player1 = data.player1;
        console.log(room);
        if(!player1){
            socket.to(roomID).emit('p2Score', {score : room[roomID].p2Score, choice : room[roomID].p2Choice});
        }
    });

});

const declareWinner = (roomID) => {
    let winner;
    if(room[roomID].p1Choice == room[roomID].p2Choice){
        winner = 'draw'
    }else if(room[roomID].p1Choice == 'rock'){
        if(room[roomID].p2Choice == 'scissor'){
            winner = 'p1'
        }else{
            winner = 'p2'
        }
    }else if(room[roomID].p1Choice == 'paper'){
        if(room[roomID].p2Choice == 'scissor'){
            winner = 'p2'
        }else{
            winner = 'p1'
        }
    }else if(room[roomID].p1Choice == 'scissor'){
        if(room[roomID].p2Choice == 'rock'){
            winner = 'p2'
        }else{
            winner = 'p1'
        }
    }
    io.sockets.to(roomID).emit('winner', winner)
}