// MÉTHODE 8: Service mock pour développement sans ONOS
export class OnosApiMock {
  private mockData = {
    devices: {
      devices: [
        {
          id: "of:0000000000000001",
          type: "SWITCH",
          available: true,
          role: "MASTER",
          mfr: "Open vSwitch",
          hw: "2.5.0",
          sw: "2.5.0",
          serial: "1",
          driver: "ovs",
          chassisId: "1",
          lastUpdate: Date.now(),
          humanReadableLastUpdate: new Date().toISOString()
        },
        {
          id: "of:0000000000000002",
          type: "SWITCH",
          available: true,
          role: "MASTER",
          mfr: "Open vSwitch",
          hw: "2.5.0",
          sw: "2.5.0",
          serial: "2",
          driver: "ovs",
          chassisId: "2",
          lastUpdate: Date.now(),
          humanReadableLastUpdate: new Date().toISOString()
        }
      ]
    },
    hosts: {
      hosts: [
        {
          id: "00:00:00:00:00:01/None",
          mac: "00:00:00:00:00:01",
          vlan: "None",
          ipAddresses: ["10.0.0.1"],
          locations: [
            {
              elementId: "of:0000000000000001",
              port: "1"
            }
          ]
        },
        {
          id: "00:00:00:00:00:02/None",
          mac: "00:00:00:00:00:02",
          vlan: "None",
          ipAddresses: ["10.0.0.2"],
          locations: [
            {
              elementId: "of:0000000000000002",
              port: "1"
            }
          ]
        }
      ]
    },
    links: {
      links: [
        {
          src: {
            device: "of:0000000000000001",
            port: "2"
          },
          dst: {
            device: "of:0000000000000002",
            port: "2"
          },
          type: "DIRECT",
          state: "ACTIVE"
        }
      ]
    },
    flows: {
      flows: [
        {
          id: "1",
          deviceId: "of:0000000000000001",
          tableId: 0,
          priority: 40000,
          timeout: 0,
          isPermanent: true,
          state: "ADDED",
          selector: {
            criteria: [
              {
                type: "IN_PORT",
                port: "1"
              }
            ]
          },
          treatment: {
            instructions: [
              {
                type: "OUTPUT",
                port: "2"
              }
            ]
          }
        }
      ]
    }
  };

  async getDevices() {
    await this.simulateDelay();
    return this.mockData.devices;
  }

  async getHosts() {
    await this.simulateDelay();
    return this.mockData.hosts;
  }

  async getLinks() {
    await this.simulateDelay();
    return this.mockData.links;
  }

  async getFlows(deviceId?: string) {
    await this.simulateDelay();
    if (deviceId) {
      return {
        flows: this.mockData.flows.flows.filter(flow => flow.deviceId === deviceId)
      };
    }
    return this.mockData.flows;
  }

  async getTopology() {
    await this.simulateDelay();
    return {
      time: Date.now(),
      devices: this.mockData.devices.devices.length,
      links: this.mockData.links.links.length,
      clusters: 1
    };
  }

  async testConnection() {
    await this.simulateDelay();
    return {
      success: true,
      data: { message: "Mock connection successful" },
      mode: "mock"
    };
  }

  async executeRequest(method: string, endpoint: string, data?: any) {
    await this.simulateDelay();
    return {
      success: true,
      data: { message: `Mock ${method} request to ${endpoint}`, requestData: data },
      status: 200
    };
  }

  private async simulateDelay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const onosApiMock = new OnosApiMock();