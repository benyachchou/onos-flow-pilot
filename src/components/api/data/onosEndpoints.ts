
export const onosEndpoints = {
  devices: [
    { url: '/devices', method: 'GET', description: 'Lists all infrastructure devices' },
    { url: '/devices/{deviceId}', method: 'GET', description: 'Lists details of a specific device' },
    { url: '/devices/{deviceId}/ports', method: 'GET', description: 'Lists ports of a specific device' },
    { url: '/devices', method: 'POST', description: 'Creates a new infrastructure device' },
    { url: '/devices/{deviceId}', method: 'PUT', description: 'Updates a device' },
    { url: '/devices/{deviceId}', method: 'DELETE', description: 'Deletes a device' }
  ],
  links: [
    { url: '/links', method: 'GET', description: 'Lists all infrastructure links' },
    { url: '/links?device={deviceId}&port={portNumber}&direction={direction}', method: 'GET', description: 'Lists details of a link with filters' },
    { url: '/links', method: 'POST', description: 'Creates a new infrastructure link' },
    { url: '/links/{linkId}', method: 'PUT', description: 'Updates a link' },
    { url: '/links/{linkId}', method: 'DELETE', description: 'Deletes a link' }
  ],
  hosts: [
    { url: '/hosts', method: 'GET', description: 'Lists all end-station hosts' },
    { url: '/hosts/{hostId}', method: 'GET', description: 'Lists details of a specific host by ID' },
    { url: '/hosts/{mac}/{vlan}', method: 'GET', description: 'Lists details of a host by MAC and VLAN' },
    { url: '/hosts', method: 'POST', description: 'Creates a new end-station host' },
    { url: '/hosts/{hostId}', method: 'PUT', description: 'Updates an end-station host' },
    { url: '/hosts/{hostId}', method: 'DELETE', description: 'Deletes an end-station host' }
  ],
  topology: [
    { url: '/topology', method: 'GET', description: 'Gets overview of current topology' },
    { url: '/topology/clusters', method: 'GET', description: 'Gets list of topology clusters' },
    { url: '/topology/clusters/{clusterId}', method: 'GET', description: 'Gets overview of specific cluster' },
    { url: '/topology/clusters/{clusterId}/devices', method: 'GET', description: 'Gets devices in cluster' },
    { url: '/topology/clusters/{clusterId}/links', method: 'GET', description: 'Gets links in cluster' },
    { url: '/topology/broadcast/{connectPoint}', method: 'GET', description: 'Checks if point permits broadcast' },
    { url: '/topology/infrastructure/{connectPoint}', method: 'GET', description: 'Checks if point is infrastructure' }
  ],
  paths: [
    { url: '/paths/{sourceId}/{destinationId}', method: 'GET', description: 'Gets shortest paths between elements' }
  ],
  flows: [
    { url: '/flows', method: 'GET', description: 'Gets all flow rules in the system' },
    { url: '/flows/{deviceId}', method: 'GET', description: 'Gets flow rules for a device' },
    { url: '/flows/{deviceId}/{flowId}', method: 'GET', description: 'Gets details of a specific flow rule' },
    { url: '/flows/{deviceId}', method: 'POST', description: 'Creates a flow rule for a device' },
    { url: '/flows', method: 'POST', description: 'Adds a batch of flow rules' },
    { url: '/flows/{deviceId}/{flowId}', method: 'DELETE', description: 'Deletes a flow rule' },
    { url: '/statistics/flows/link/{linkId}', method: 'GET', description: 'Gets flow statistics for a link' }
  ],
  flowObjectives: [
    { url: '/flowobjectives/{deviceId}/filter', method: 'POST', description: 'Creates filtering objective' },
    { url: '/flowobjectives/{deviceId}/forward', method: 'POST', description: 'Creates forwarding objective' },
    { url: '/flowobjectives/{deviceId}/next', method: 'POST', description: 'Creates next objective' },
    { url: '/flowobjectives/next', method: 'GET', description: 'Gets globally unique nextId' },
    { url: '/flowobjectives/policy', method: 'POST', description: 'Installs filtering rules' }
  ],
  groups: [
    { url: '/groups', method: 'GET', description: 'Gets all group entries in the system' },
    { url: '/groups/{deviceId}', method: 'GET', description: 'Gets group entries for a device' },
    { url: '/groups/{deviceId}/{groupKey}', method: 'GET', description: 'Gets details of a specific group' },
    { url: '/groups/{deviceId}', method: 'POST', description: 'Creates a group entry for a device' },
    { url: '/groups/{deviceId}/{groupKey}', method: 'DELETE', description: 'Deletes a group entry' }
  ],
  meters: [
    { url: '/meters', method: 'GET', description: 'Gets all meter entries in the system' },
    { url: '/meters/{deviceId}', method: 'GET', description: 'Gets meter entries for a device' },
    { url: '/meters/{deviceId}/{meterId}', method: 'GET', description: 'Gets details of a specific meter' },
    { url: '/meters/{deviceId}', method: 'POST', description: 'Creates a meter entry for a device' },
    { url: '/meters/{deviceId}/{meterId}', method: 'DELETE', description: 'Deletes a meter entry' }
  ],
  intents: [
    { url: '/intents', method: 'GET', description: 'Gets all Intent objects in the system' },
    { url: '/intents/{app-id}/{intent-id}', method: 'GET', description: 'Gets details of a specific Intent' },
    { url: '/intents', method: 'POST', description: 'Creates a new Intent object' },
    { url: '/intents/{app-id}/{intent-id}', method: 'DELETE', description: 'Removes an intent from the system' }
  ],
  applications: [
    { url: '/applications', method: 'GET', description: 'Gets list of all installed applications' },
    { url: '/applications/{app-name}', method: 'GET', description: 'Gets info about named application' },
    { url: '/applications', method: 'POST', description: 'Installs application using app.xml or ZIP' },
    { url: '/applications/{app-name}', method: 'DELETE', description: 'Uninstalls the named application' },
    { url: '/applications/{app-name}/active', method: 'POST', description: 'Activates the named application' },
    { url: '/applications/{app-name}/active', method: 'DELETE', description: 'Deactivates the named application' },
    { url: '/applications/ids/entry', method: 'GET', description: 'Gets applicationId entry by id or name' },
    { url: '/applications/ids', method: 'GET', description: 'Gets list of all registered applicationIds' }
  ],
  configuration: [
    { url: '/configuration', method: 'GET', description: 'Gets all components and their configuration' },
    { url: '/configuration/{component}', method: 'GET', description: 'Gets configuration for a component' },
    { url: '/configuration/{component}', method: 'POST', description: 'Adds configuration to a component' },
    { url: '/configuration/{component}', method: 'DELETE', description: 'Removes component configuration' }
  ]
};
