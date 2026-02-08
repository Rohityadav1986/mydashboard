const { authenticate } = require("../src/msAuth");
const { fetchAllData } = require("../src/fetchers/fetchers");
const { normalizeData } = require("../src/normalizers/normalizers");
const { sendToLAW } = require("../src/sender/lawSender");

module.exports = async function (context, myTimer) {
    context.log("⏰ Timer trigger started");

    try {
        // 1️⃣ Auth
        const authClient = await authenticate();

        // 2️⃣ Fetch data
        const rawData = await fetchAllData(authClient);

        // 3️⃣ Normalize
        const finalData = normalizeData(rawData);

        // 4️⃣ Send to Log Analytics
        await sendToLAW(finalData);

        context.log("✅ Data successfully sent to LAW");
    } catch (err) {
        context.log.error("❌ Error in timer function", err);
        throw err;
    }
};


context.log("Timer function executed at:", new Date().toISOString());
