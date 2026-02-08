// import { getAccessToken } from "../../src/msAuth.js";

// const MGMT_SCOPE = "https://management.azure.com/.default";
// const RESOURCE_GRAPH_API = "https://management.azure.com/providers/Microsoft.ResourceGraph/resources?api-version=2021-03-01";

// /**
//  * Run an Azure Resource Graph KQL query
//  */
// async function runResourceGraphQuery(kql, subscriptions) {
//   const token = await getAccessToken(MGMT_SCOPE);

//   if (!token) {
//     throw new Error("Unable to obtain Resource Graph token");
//   }

//   const body = { subscriptions, query: kql };
//   const res = await fetch(RESOURCE_GRAPH_API, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(body)
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`ResourceGraph query failed: ${text}`);
//   }

//   const json = await res.json();
//   return json.data || [];
// }

// /**
//  * Fetch patch assessment status (missing/available updates).
//  */
// export async function fetchPatchAssessmentStatus(subscriptions = []) {
//   const kql = `
//     patchassessmentresources
//     | where type in ("microsoft.compute/virtualmachines/patchassessmentresults", "microsoft.hybridcompute/machines/patchassessmentresults")
//     | extend props = parse_json(properties)
//     | extend lastAssessmentTime = todatetime(props.lastModifiedDateTime)
//     | project
//         vmId = tostring(split(id, "/patchAssessmentResults")[0]),
//         osType = tostring(props.osType),
//         lastAssessment = lastAssessmentTime,
//         missingCritical = toint(props.availablePatchCountByClassification.critical),
//         missingSecurity = toint(props.availablePatchCountByClassification.security),
//         missingOther = toint(props.availablePatchCountByClassification.updates)
//     | order by lastAssessment desc
//   `;
//   return runResourceGraphQuery(kql, subscriptions);
// }

// /**
//  * Fetch patch installation results (status and counts).
//  */
// export async function fetchPatchInstallationStatus(subscriptions = []) {
//   const kql = `
//     patchinstallationresources
//     | where type in ("microsoft.compute/virtualmachines/patchinstallationresults", "microsoft.hybridcompute/machines/patchinstallationresults")
//     | extend props = parse_json(properties)
//     | extend lastRunTime = todatetime(props.lastModifiedDateTime)
//     | project
//         vmId = tostring(split(id, "/patchInstallationResults")[0]),
//         status = tostring(props.status),
//         installedCount = toint(props.installedPatchCount),
//         failedCount = toint(props.failedPatchCount),
//         pendingCount = toint(props.pendingPatchCount),
//         lastRun = lastRunTime
//     | order by lastRun desc
//   `;
//   return runResourceGraphQuery(kql, subscriptions);
// }

// /**
//  * Fetch combined patch status info (both assessment & installation).
//  */
// export async function fetchPatchStatus(subscriptions = []) {
//   const [assessment, installation] = await Promise.all([
//     fetchPatchAssessmentStatus(subscriptions),
//     fetchPatchInstallationStatus(subscriptions)
//   ]);
//   return { assessment, installation };
// }
