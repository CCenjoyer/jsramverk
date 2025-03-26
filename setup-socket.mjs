import { createServer } from "http";
import { Server } from "socket.io";

const setupSocket = (app) => {
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    });

    // Listen for new socket connections
    io.sockets.on("connection", (socket) => {
        console.log(`New connection: ${socket.id}`);

        // Handle room creation/joining
        socket.on("create", (room) => {
            console.log(`Socket ${socket.id} joining room: ${room}`);
            socket.join(room);
        });

        // Handle document updates
        socket.on("updateDocument", ({ room, title, content }) => {
            // Broadcast the update to other clients in the room
            socket.to(room).emit("documentUpdated", { title, content });
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return httpServer; // Return the server so it can be started
};

export default setupSocket;
