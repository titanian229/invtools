const db = require('../models');

module.exports = (router) => {
    router.get('/api/items/:itemNumber', async ({ params }, res) => {
        const { itemNumber } = params;
        try {
            const results = await db.Items.find({
                $or: [{ localItemNumber: { $regex: itemNumber } }, { foreignItemNumber: { $regex: itemNumber } }],
            });
            // const unitaryResult = await db.Items.find({
            //     $or: [{ localItemNumber: itemNumber }, { foreignItemNumber: itemNumber }],
            // });
            if (results.length === 1) {
                res.status(200).send({ message: 'Search Successful', unitaryResult: results[0], results });
                return;
            }
            // if (results.length > 50){
            //     res.status(200).send({message: "Search Successful", shortened: true, results: results.splice(0, 50)})
            //     return
            // }

            res.status(200).send({ message: 'Search successful', results });
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: 'Something went wrong with the server' });
        }
    });
};
