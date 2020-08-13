const db = require('../models');
const processInvInput = require('../app/processInvInput')
module.exports = (router) => {
    router.post('/api/invRectification', async ({ body }, res) => {
        
        try {
            processInvInput(body.invTable)
            res.status(200).send({ message: 'Route not yet implemented' });
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: 'Something went wrong with the server' });
        }
    });
};
