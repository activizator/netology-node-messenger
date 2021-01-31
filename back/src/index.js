#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const dbName = "ActMessDB";

const mongoUrl = `mongodb+srv://${process.env.MDBUSER}:${process.env.MDBPASS}@cluster0.0isj7.azure.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const errorMiddleware = require('./middleware/error');
const apiRouter = require('./routes/api/router');

const app = express();

const server = require('http').createServer(app);

const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
});

  app.use(cors());
app.use('/api/', apiRouter);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

async function start () {
    try {
        await
        mongoose.connect(mongoUrl, { useNewUrlParser: true });

        io.on('connection', (socket) => {
            const { id } = socket;
            console.log(`Socket connected: ${id}`);
            socket.on('disconnect', () => {
                console.log(`Socket disconnected: ${id}`);
            });
            // работа с комнатами
            const { roomName } = socket.handshake.query;
            console.log(`Socket roomName: ${roomName}`);
            socket.join(roomName);
            socket.on('message-to-room', (msg) => {
                msg.type = `room: ${roomName}`;
                socket.to(roomName).emit('message-to-room', msg);
                socket.emit('message-to-room', msg);
            });
        });

        server.listen(PORT, () => {
            console.log(`== Server is running on port ${PORT} ==`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();
