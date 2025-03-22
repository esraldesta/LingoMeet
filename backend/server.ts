import { Socket } from "socket.io";

import express from "express";
import cors from "cors";
import groupRouter from "./api/routers/group";
import authRouter from "./api/routers/auth";

import { ConvertError, NotFound, ErrorHandler } from "./middleware/error";
import bodyParser from "body-parser";
import { validate } from "./middleware/validation";
import { createGroup } from "./api/validations/group";
import { body } from "express-validator";

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(cors());

app.use("/api/v1", groupRouter);
app.use("/api/v1/auth", authRouter);

// main().catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect("mongodb://127.0.0.1/db");
//   console.log("Db Connected");
// }
const server = require("http").Server(app);

app.use(ConvertError);

// Catch 404 and forward to error handler
app.use(NotFound);

// Error handler, send stacktrace only during development
app.use(ErrorHandler);

const io = require("socket.io")(server);

io.on("connection", (socket: Socket) => {
  // When a user joins a room
  socket.on("join-room", (roomId: string, userId: string) => {
    // Join the room
    socket.join(roomId);

    // Notify other users in the room that a new user has connected
    socket.to(roomId).emit("user-connected", userId);
    // console.log("User joined: Room ID:", roomId, "User ID:", userId);

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
