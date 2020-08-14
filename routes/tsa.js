const db = require('../models');

module.exports = (router) => {
    router.get('/api/tsa', async (req, res) => {
        try {
            const TSAItems = await db.TSA.find({});
            res.status(200).send({ message: 'Success', TSA: TSAItems });
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: 'Something went wrong with the server' });
        }
    });
};
