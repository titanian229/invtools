const db = require('../models');
const processInvInput = require('../app/processInvInput');
const rectifyInventory = require('../app/rectifyInventory');
module.exports = (router) => {
    router.post('/api/invRectification', async ({ body }, res) => {
        try {
            // FIRST SAVE ALL DATA IN STRING FORMAT TO THE DB, FOR FUTURE DEBUGGING
            db.Debug.create({ information: body.invTable });
            // Process the data
            const reportStatement = await processInvInput(body.invTable);
            // console.table(processedData);
            res.status(200).send(reportStatement);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: 'Something went wrong with the server' });
        }
    });
    router.get('/api/invRectification/:dateStart/:dateEnd', async ({ params }, res) => {
        try {
            const { overviewReport, totalOverviewOffsets, finalReport } = await rectifyInventory.completeCheck(
                params.dateStart,
                params.dateEnd
            );
            res.status(200).send({
                message: 'Successfully generated report',
                overviewReport,
                totalOverviewOffsets,
                finalReport,
            });
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "There was an error generating your report, it's been logged.  Ask James." });
        }
    });
};
