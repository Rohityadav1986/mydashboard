import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;

/**
 * Get access token for given scope (client credentials)
 */
export async function getAccessToken(scope){
  if(!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET){
    throw new Error("Missing AZURE_TENANT_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET in .env");
  }
  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("scope", scope);
  params.append("grant_type", "client_credentials");

  const res = await axios.post(url, params);
  return res.data.access_token;
}

/**
 * Generic pager for MS Graph and Azure management endpoints that follow @odata.nextLink
 */
export async function fetchAllPaged(url, token){
  let results = [];
  let next = url;
  const headers = { Authorization: `Bearer ${token}` };
  while(next){
    const res = await axios.get(next, { headers });
    const data = res.data;
    if(Array.isArray(data.value)){
      results.push(...data.value);
    } else if(Array.isArray(data)){
      results.push(...data);
    } else if(data.value && Array.isArray(data.value)){
      results.push(...data.value);
    } else if(data.items && Array.isArray(data.items)){
      results.push(...data.items);
    } else if(Array.isArray(data.devices || [])){
      results.push(...(data.devices || []));
    } else {
      // fallback - push whole response if not paged array
      if(typeof data === 'object') results.push(data);
    }
    next = data['@odata.nextLink'] || null;
  }
  return results;
}
