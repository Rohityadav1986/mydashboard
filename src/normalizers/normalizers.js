export function normalizeUser(u) {
  return {
    id: u.id || u.userPrincipalName || null,
    displayName: u.displayName || null,
    mail: u.mail || u.userPrincipalName || null,
    jobTitle: u.jobTitle || null,
    department: u.department || null,
    accountEnabled: u.accountEnabled ?? null,
    source: "m365_users",
    raw: u
  };
}

export function normalizeDevice(d) {
  // device from Intune/managedDevices
  return {
    id: d.id || d.deviceId || null,
    deviceId: d.deviceId || null,
    deviceName: d.deviceName || d.computerName || null,
    os: d.operatingSystem || d.deviceOS || null,
    osVersion: d.osVersion || d.operatingSystemVersion || null,
    complianceState: d.complianceState || null,
    managedBy: d.managedBy || "Intune",
    owner: d.userPrincipalName || d.userDisplayName || null,
    lastSync: d.lastSyncDateTime || d.lastSeen || null,
    source: "intune_devices",
    raw: d
  };
}

export function normalizeAlert(a) {
  return {
    id: a.id,
    title: a.title || a.alertDisplayName || null,
    severity: a.severity || a.alertSeverity || null,
    status: a.status || null,
    createdDateTime: a.createdDateTime || a.firstObservedDateTime || null,
    vendor: a.vendorInformation?.provider || null,
    source: "security_alerts",
    raw: a
  };
}

export function normalizeSubscription(s) {
  return {
    id: s.subscriptionId || s.id,
    displayName: s.displayName || s.name,
    state: s.state || null,
    source: "azure_subscriptions",
    raw: s
  };
}

// Entra devices normalizer with prefixed fields to avoid column collisions in LAW
export function normalizeEntraDevice(d) {
  return {
    id: d.id || "",
    entra_deviceId: d.deviceId || "",
    entra_displayName: d.displayName || "",
    entra_operatingSystem: d.operatingSystem || "",
    entra_operatingSystemVersion: d.operatingSystemVersion || "",
    entra_trustType: d.trustType || "",
    entra_isManaged: d.isManaged ?? false,
    entra_isCompliant: d.isCompliant ?? false,
    entra_deviceOwnership: d.deviceOwnership || "",
    entra_lastSignIn: d.approximateLastSignInDateTime || "",
    entra_profileType: d.profileType || "",
    source: "entra_devices",
    raw: d
  };
}
