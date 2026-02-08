import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const WORKSPACE_ID = process.env.LAW_WORKSPACE_ID;
const SHARED_KEY = process.env.LAW_SHARED_KEY;
const API_VERSION = "2016-04-01";

if (!WORKSPACE_ID || !SHARED_KEY) {
  console.warn("WARNING: LAW_WORKSPACE_ID or LAW_SHARED_KEY not set. LAW send will fail if DRY_RUN=false");
}

function buildSignature(customerId, sharedKey, date, contentLength, method, contentType, resource){
  const xHeaders = `x-ms-date:${date}`;
  const stringToHash = `${method}\n${contentLength}\n${contentType}\n${xHeaders}\n${resource}`;
  const decodedKey = Buffer.from(sharedKey, "base64");
  const encodedHash = crypto.createHmac("sha256", decodedKey).update(stringToHash, "utf8").digest("base64");
  return `SharedKey ${customerId}:${encodedHash}`;
}

function preserveOriginalFields(record) {
  const clean = {};
  for (const key in record) {
    let val = record[key];
    if (val === undefined) continue;
    if (val instanceof Date || (!Array.isArray(val) && typeof val === "string" && !isNaN(Date.parse(val)))) {
      clean[key] = new Date(val).toISOString();
      continue;
    }
    if (typeof val === "object" && val !== null) {
      clean[key] = JSON.stringify(val);
      continue;
    }
    clean[key] = val;
  }
  return clean;
}

export async function sendToLAW(tableName, records = [], dryRun = true) {
  if (!records || records.length === 0) {
    console.log(`No records for ${tableName}, skipping send.`);
    return { sent: 0 };
  }
  const mappedRecords = records.map(preserveOriginalFields);
  console.log(`Preparing to send ${mappedRecords.length} records to LAW table ${tableName}`);

  if (dryRun) {
    console.log(`DRY_RUN enabled - not sending to LAW. (Would send ${mappedRecords.length} items to ${tableName})`);
    return { sent: mappedRecords.length, dryRun: true };
  }

  if (!WORKSPACE_ID || !SHARED_KEY) {
    throw new Error("Missing LAW_WORKSPACE_ID or LAW_SHARED_KEY in env");
  }

  const chunkSize = 500;
  const resource = `/api/logs`;
  const contentType = "application/json";
  let sent = 0;

  for (let i = 0; i < mappedRecords.length; i += chunkSize) {
    const chunk = mappedRecords.slice(i, i + chunkSize);
    const body = JSON.stringify(chunk);
    const contentLength = Buffer.byteLength(body, "utf8");
    const rfc1123date = new Date().toUTCString();
    const signature = buildSignature(WORKSPACE_ID, SHARED_KEY, rfc1123date, contentLength, "POST", contentType, resource);
    const url = `https://${WORKSPACE_ID}.ods.opinsights.azure.com${resource}?api-version=${API_VERSION}`;

    try {
      const res = await axios.post(url, body, {
        headers: {
          "Content-Type": contentType,
          "Authorization": signature,
          "Log-Type": tableName.replace(/[^a-zA-Z0-9_]/g, "_"),
          "x-ms-date": rfc1123date,
          "time-generated-field": ""
        },
        timeout: 60000
      });

      console.log(
        `Sent chunk ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(mappedRecords.length / chunkSize)} — status ${res.status}`
      );
      sent += chunk.length;

    } catch (err) {
      console.error(`Failed send to LAW (${tableName}):`, err.response?.data || err.message);
    }
  }

  return { sent };
}
