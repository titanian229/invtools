const db = require('../models');

module.exports = (router) => {
    router.get('/api/nssdr', async (req, res) => {
        try {
            const NSSDRItems = await db.NSSDR.find({})            
            res.status(200).send({ message: 'Success', NSSDR: NSSDRItems  });
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: 'Something went wrong with the server' });
        }
    });
};
