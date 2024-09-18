const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const groupRouter = require("./api/routers/group")
const app = express();
app.use(cors());
app.use(express.json())

app.use('/api/v1', groupRouter);

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://talkmate:sRvTLpyUFPloJLss@cluster0.2jhpf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  console.log("Db Connected");
}
const server = require("http").Server(app);
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  // When a user joins a room
  socket.on("join-room", (roomId, userId) => {
    // Join the room
    socket.join(roomId);

    // Notify other users in the room that a new user has connected
    socket.to(roomId).emit("user-connected", userId);
    console.log("User joined: Room ID:", roomId, "User ID:", userId);

    // Handle when user disconnects
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
      console.log("User disconnected: Room ID:", roomId, "User ID:", userId);
    });
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
