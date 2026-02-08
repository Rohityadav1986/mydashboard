const { authenticate } = require("../src/msAuth");
const { fetchAllData } = require("../src/fetchers/fetchers");
const { normalizeData } = require("../src/normalizers/normalizers");
const { sendToLAW } = require("../src/sender/lawSender");

module.exports = async function (context, myTimer) {
    context.log("⏰ Timer trigger started");

    try {
        const authClient = await authenticate();
        const rawData = await fetchAllData(authClient);
        const finalData = normalizeData(rawData);
        await sendToLAW(finalData);

        context.log("✅ Data successfully sent to LAW");
    } catch (err) {
        context.log.error("❌ Error in timer function", err);
        throw err;
    }
};

