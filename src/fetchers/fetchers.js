import { getAccessToken, fetchAllPaged } from "../msAuth.js";

const GRAPH_SCOPE = "https://graph.microsoft.com/.default";
const MGMT_SCOPE = "https://management.azure.com/.default";

/**
 * Build time window query components - kept for compatibility
 */
function buildTimeFilter({ lastNDays, startDateISO, endDateISO } = {}) {
  if (startDateISO && endDateISO) {
    return { startDateISO, endDateISO };
  }
  const days = lastNDays || 7;
  const end = new Date();
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return { startDateISO: start.toISOString(), endDateISO: end.toISOString() };
}

/**
 * Individual fetchers
 */
export async function fetchM365Users(opts = {}) {
  const token = await getAccessToken(GRAPH_SCOPE);
  if (!token) return [];
  const url = `https://graph.microsoft.com/v1.0/users?$top=250`;
  return await fetchAllPaged(url, token);
}

export async function fetchDefenderAlerts(opts = {}) {
  const token = await getAccessToken(GRAPH_SCOPE);
  if (!token) return [];
  const tf = buildTimeFilter(opts);
  const url = `https://graph.microsoft.com/v1.0/security/alerts?$top=250`;
  return await fetchAllPaged(url, token);
}

export async function fetchDefenderDevices(opts = {}) {
  const token = await getAccessToken(GRAPH_SCOPE);
  if (!token) return [];
  const url = `https://graph.microsoft.com/beta/deviceManagement/managedDevices?$top=250`;
  return await fetchAllPaged(url, token);
}

export async function fetchEntraDevices(opts = {}) {
  const token = await getAccessToken(GRAPH_SCOPE);
  if (!token) return [];
  // Entra / Azure AD registered devices
  const url = `https://graph.microsoft.com/v1.0/devices?$top=250`;
  return await fetchAllPaged(url, token);
}

export async function fetchIntuneApps(opts = {}) {
  const token = await getAccessToken(GRAPH_SCOPE);
  if (!token) return [];
  const url = `https://graph.microsoft.com/v1.0/deviceAppManagement/mobileApps?$top=250`;
  return await fetchAllPaged(url, token);
}

export async function fetchAuditLogs(opts = {}) {
  const token = await getAccessToken(GRAPH_SCOPE);
  if (!token) return [];
  const url = `https://graph.microsoft.com/v1.0/auditLogs/directoryAudits?$top=250`;
  return await fetchAllPaged(url, token);
}

export async function fetchEntraRiskyUsers(opts = {}) {
  const token = await getAccessToken(GRAPH_SCOPE);
  if (!token) return [];
  const url = `https://graph.microsoft.com/v1.0/identityProtection/riskyUsers?$top=250`;
  return await fetchAllPaged(url, token);
}

export async function fetchSecureScore(opts = {}) {
  const token = await getAccessToken(GRAPH_SCOPE);
  if (!token) return [];
  const url = `https://graph.microsoft.com/v1.0/security/secureScores?$top=50`;
  return await fetchAllPaged(url, token);
}

export async function fetchSecureScoreControls(opts = {}) {
  const token = await getAccessToken(GRAPH_SCOPE);
  if (!token) return [];
  const url = `https://graph.microsoft.com/v1.0/security/secureScoreControlProfiles?$top=250`;
  return await fetchAllPaged(url, token);
}

export async function fetchAzureSubscriptions(opts = {}) {
  const token = await getAccessToken(MGMT_SCOPE);
  if (!token) return [];
  const url = `https://management.azure.com/subscriptions?api-version=2020-01-01`;
  const res = await fetchAllPaged(url, token);
  return res;
}

/**
 * Combined fetcher - returns all sets
 */
export async function fetchAllServices(opts = {}) {
  console.log("fetchAllServices: resolving endpoints...");
  const promises = [
    fetchM365Users(opts),
    fetchDefenderAlerts(opts),
    fetchDefenderDevices(opts),
    fetchIntuneApps(opts),
    fetchAuditLogs(opts),
    fetchEntraRiskyUsers(opts),
    fetchSecureScore(opts),
    fetchSecureScoreControls(opts),
    fetchAzureSubscriptions(opts),
    fetchEntraDevices(opts)
  ].map(p => p.catch(e => { console.error("fetch error:", e?.message || e); return []; }));

  const [
    users,
    defenderAlerts,
    defenderDevices,
    intuneApps,
    auditLogs,
    riskyUsers,
    secureScores,
    secureScoreControls,
    subscriptions,
    entraDevices
  ] = await Promise.all(promises);

  return {
    users,
    defenderAlerts,
    defenderDevices,
    intuneApps,
    auditLogs,
    riskyUsers,
    secureScores,
    secureScoreControls,
    subscriptions,
    entraDevices
  };
}

// // --------------------------------------------------------------------
// // NEW Fetcher 
// // --------------------------------------------------------------------
