
export const jsonTemplates = {
  flow: `{
  "priority": 40000,
  "timeout": 0,
  "isPermanent": true,
  "deviceId": "of:0000000000000001",
  "treatment": {
    "instructions": [
      {
        "type": "OUTPUT",
        "port": "2"
      }
    ]
  },
  "selector": {
    "criteria": [
      {
        "type": "IN_PORT",
        "port": "1"
      },
      {
        "type": "ETH_TYPE",
        "ethType": "0x0800"
      }
    ]
  }
}`,
  batchFlows: `{
  "flows": [
    {
      "priority": 40000,
      "timeout": 0,
      "isPermanent": true,
      "deviceId": "of:0000000000000001",
      "treatment": {
        "instructions": [
          {
            "type": "OUTPUT",
            "port": "2"
          }
        ]
      },
      "selector": {
        "criteria": [
          {
            "type": "IN_PORT",
            "port": "1"
          }
        ]
      }
    }
  ]
}`,
  intent: `{
  "type": "HostToHostIntent",
  "appId": "org.onosproject.cli",
  "one": "00:00:00:00:00:01/-1",
  "two": "00:00:00:00:00:02/-1"
}`,
  device: `{
  "type": "SWITCH",
  "manufacturer": "Open vSwitch",
  "hwVersion": "2.5.0",
  "swVersion": "2.5.0",
  "serialNumber": "1"
}`,
  host: `{
  "mac": "00:00:00:00:00:01",
  "vlan": -1,
  "location": {
    "elementId": "of:0000000000000001",
    "port": "1"
  },
  "ipAddresses": ["192.168.1.100"]
}`,
  group: `{
  "type": "ALL",
  "deviceId": "of:0000000000000001",
  "buckets": [
    {
      "treatment": {
        "instructions": [
          {
            "type": "OUTPUT",
            "port": "2"
          }
        ]
      }
    }
  ]
}`,
  meter: `{
  "deviceId": "of:0000000000000001",
  "unit": "KB_PER_SEC",
  "burst": true,
  "bands": [
    {
      "type": "DROP",
      "rate": 1000
    }
  ]
}`,
  filterObjective: `{
  "type": "PERMIT",
  "priority": 40000,
  "conditions": [
    {
      "type": "IN_PORT",
      "port": 1
    }
  ]
}`,
  forwardObjective: `{
  "flag": "SPECIFIC",
  "priority": 40000,
  "selector": {
    "criteria": [
      {
        "type": "ETH_TYPE",
        "ethType": "0x0800"
      }
    ]
  },
  "treatment": {
    "instructions": [
      {
        "type": "OUTPUT",
        "port": "2"
      }
    ]
  }
}`,
  nextObjective: `{
  "type": "SIMPLE",
  "treatments": [
    {
      "instructions": [
        {
          "type": "OUTPUT",
          "port": "2"
        }
      ]
    }
  ]
}`,
  configuration: `{
  "ipv6NeighborDiscovery": "false",
  "hostRemovalEnabled": "true"
}`
};
