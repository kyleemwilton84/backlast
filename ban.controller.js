import fs from 'fs'

export const Ban = async (req, res) => {
    try {
        const { id
        } = req.params;
        const data = id + ' \n'
        
        const dataaaa = fs.readFileSync('file.txt');

        if (!dataaaa.toString().includes(id)) {
            fs.writeFileSync('file.txt', data, { flag: 'a+' })
        }

        return res.send({
            success: true
        })

    } catch (error) {
        return res.send({
            success: false,
            message: error.message,
        });
    }
};
