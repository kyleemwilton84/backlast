import fs from 'fs'

export const CheckBan = async (req, res) => {
    try {
        const { id
        } = req.params;
        const data = id + ' \n'

        const dataaaa = fs.readFileSync('file.txt');

        if (dataaaa.toString().includes(id)) {
            return res.send({
                success: true,
                data: true
            }) 
        }
        return res.send({
            success: true,
            data: false
        }) 

    } catch (error) {
        return res.send({
            success: false,
            message: error.message,
        });
    }
};
