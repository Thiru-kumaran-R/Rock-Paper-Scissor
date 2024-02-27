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
let player;
let roomID;

io.on('connection', socket => {
    player = socket.id;
    console.log('client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('createRoom', roomId => {
        room[roomId] = {}
        socket.join(roomId);
        socket.to(roomId).emit('playersConnected')
    });

    socket.on('joinRoom', roomId => {
        console.log(roomId);
        socket.join(roomId);
        console.log('client 2 joined');
        socket.to(roomId).emit('playersConnected');
        socket.emit('playersConnected');
    });

    socket.on('p1Choice', data => {
        room[data.roomID].p1Choice = data.choice;
        if(room[data.roomID].p2Choice != null){
            socket.emit('oppoChoice', room[data.roomID].p2Choice)
        }
        console.log(room);
    });

    socket.on('p2Choice', data => {
        room[data.roomID].p2Choice = data.choice;
        if(room[data.roomID].p1Choice != null){
            socket.emit('oppoChoice', room[data.roomID].p1Choice)
        }
    })

});
