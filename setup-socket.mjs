import { createServer } from "http";
import { Server } from "socket.io";
import docs from "./models/docs.mjs";

const setupSocket = (app) => {
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: [
                process.env.FRONTEND_URL || "http://localhost:3000",
                process.env.FRONTEND_URL_2,
            ],
            methods: ["GET", "POST"],
            credentials: true,
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

        socket.on("comment", async ({ room, comment }) => {
            console.log(`Socket ${socket.id} sending comment to room: ${room}`);
            try {
                // Add the comment to the database and get the new comment ID
                const addedCommentId = await docs.addComment(
                    room,
                    comment.quote,
                    comment.content
                );

                comment.comment = comment.content;
                delete comment.content;

                // Attach the new comment ID to the comment object
                comment._id = addedCommentId;

                // Broadcast the comment to all clients in the room, including the sender
                io.to(room).emit("commentReceived", comment);

                console.log(
                    `Socket ${
                        socket.id
                    } sent comment to room: ${room}, comment: ${JSON.stringify(
                        comment
                    )}`
                );
            } catch (error) {
                console.error(`Error adding comment: ${error.message}`);
            }
        });

        socket.on("deleteComment", async ({ room, commentId }) => {
            console.log(
                `Socket ${socket.id} deleting comment in room: ${room}`
            );
            try {
                // Delete the comment from the database
                await docs.deleteComment(room, commentId);

                // Broadcast the deletion to all clients in the room
                io.to(room).emit("commentDeleted", { commentId });

                console.log(
                    `Socket ${socket.id} deleted comment in room: ${room}, commentId: ${commentId}`
                );
            } catch (error) {
                console.error(`Error deleting comment: ${error.message}`);
            }
        });
    });

    return httpServer; // Return the server so it can be started
};

export default setupSocket;
