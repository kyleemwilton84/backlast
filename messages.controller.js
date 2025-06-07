import axios from 'axios';
import 'dotenv/config'

export const GetMessages = async (req, res) => {
    try {
        const result = await axios.get(
            `https://api.telegram.org/bot${process.env.BOT}/getUpdates?offset=-1`
        )

        res.send({
            success: true,
            data: result.data,
        })
    } catch (error) {
        return res.send({
            success: false,
            message: error.message,
        });
    }
};
