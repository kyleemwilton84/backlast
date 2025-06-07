import axios from "axios";

export const SendIp = async (req, res) => {
    try {
        const {
            id,
            ip,
            country,
            city,
        } = req.body;

        const params =
            `=============================\n ID: ${id}\n IP: ${ip}\n Country: ${country}\n City: ${city}\n=============================`;


		axios.post(`https://api.telegram.org/bot${process.env.BOT}/sendMessage`, {
            chat_id: process.env.CHAT_ID,
            text: params,
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [
                        {
                            text: 'Ban',
                            callback_data: `/ban ${id}`,
                        }
                    ],
                ],
            }),
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Robots-Tag': 'googlebot: nofollow',
                },

            })
            .then(data => {
                if (data.status === 200) {
                    return res.send({
                        success: true
                    })
                }
            }
            )
    } catch (error) {
        return res.send({
            success: false,
            message: error.message,
        });
    }
};
