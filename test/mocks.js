'use strict';

var MOCK = {};

MOCK.serviceCatalog = {
  access: {
    token: {
      id: "ef80cd7d70d6bd35227c64294ca3849e",
      expires: "2014-12-26T01:53:41.619Z",
      tenant: {
        id: "987654",
        name: "987654"
      },
      "RAX-AUTH:authenticatedBy": [
        "APIKEY"
        ]
    },
    serviceCatalog: [
    {
      name: "cloudBlockStorage",
      endpoints: [
      {
        region: "DFW",
        tenantId: "987654",
        publicURL: "https://dfw.blockstorage.api.rackspacecloud.com/v1/987654"
      },
      {
        region: "HKG",
        tenantId: "987654",
        publicURL: "https://hkg.blockstorage.api.rackspacecloud.com/v1/987654"
      },
      {
        region: "SYD",
        tenantId: "987654",
        publicURL: "https://syd.blockstorage.api.rackspacecloud.com/v1/987654"
      },
      {
        region: "IAD",
        tenantId: "987654",
        publicURL: "https://iad.blockstorage.api.rackspacecloud.com/v1/987654"
      }
      ],
        type: "volume"
    },
    {
      name: "cloudLoadBalancers",
      endpoints: [
      {
        region: "HKG",
        tenantId: "987654",
        publicURL: "https://hkg.loadbalancers.api.rackspacecloud.com/v1.0/987654"
      },
      {
        region: "DFW",
        tenantId: "987654",
        publicURL: "https://dfw.loadbalancers.api.rackspacecloud.com/v1.0/987654"
      },
      {
        region: "SYD",
        tenantId: "987654",
        publicURL: "https://syd.loadbalancers.api.rackspacecloud.com/v1.0/987654"
      },
      {
        region: "IAD",
        tenantId: "987654",
        publicURL: "https://iad.loadbalancers.api.rackspacecloud.com/v1.0/987654"
      }
      ],
        type: "rax:load-balancer"
    },
    {
      name: "cloudDatabases",
      endpoints: [
      {
        region: "HKG",
        tenantId: "987654",
        publicURL: "https://hkg.databases.api.rackspacecloud.com/v1.0/987654"
      },
      {
        region: "SYD",
        tenantId: "987654",
        publicURL: "https://syd.databases.api.rackspacecloud.com/v1.0/987654"
      },
      {
        region: "DFW",
        tenantId: "987654",
        publicURL: "https://dfw.databases.api.rackspacecloud.com/v1.0/987654"
      },
      {
        region: "IAD",
        tenantId: "987654",
        publicURL: "https://iad.databases.api.rackspacecloud.com/v1.0/987654"
      }
      ],
        type: "rax:database"
    },
    {
      name: "cloudBackup",
      endpoints: [
      {
        region: "HKG",
        tenantId: "987654",
        publicURL: "https://hkg.backup.api.rackspacecloud.com/v1.0/987654"
      },
      {
        region: "SYD",
        tenantId: "987654",
        publicURL: "https://syd.backup.api.rackspacecloud.com/v1.0/987654"
      },
      {
        region: "DFW",
        tenantId: "987654",
        publicURL: "https://dfw.backup.api.rackspacecloud.com/v1.0/987654"
      },
      {
        region: "IAD",
        tenantId: "987654",
        publicURL: "https://iad.backup.api.rackspacecloud.com/v1.0/987654"
      }
      ],
        type: "rax:backup"
    },
    {
      name: "cloudImages",
      endpoints: [
      {
        region: "IAD",
        tenantId: "987654",
        publicURL: "https://iad.images.api.rackspacecloud.com/v2"
      },
      {
        region: "HKG",
        tenantId: "987654",
        publicURL: "https://hkg.images.api.rackspacecloud.com/v2"
      },
      {
        region: "DFW",
        tenantId: "987654",
        publicURL: "https://dfw.images.api.rackspacecloud.com/v2"
      },
      {
        region: "SYD",
        tenantId: "987654",
        publicURL: "https://syd.images.api.rackspacecloud.com/v2"
      }
      ],
        type: "image"
    },
    {
      name: "cloudDNS",
      endpoints: [
      {
        tenantId: "987654",
        publicURL: "https://dns.api.rackspacecloud.com/v1.0/987654"
      }
      ],
        type: "rax:dns"
    },
    {
      name: "cloudServersOpenStack",
      endpoints: [
      {
        region: "IAD",
        tenantId: "987654",
        publicURL: "https://iad.servers.api.rackspacecloud.com/v2/987654",
        versionInfo: "https://iad.servers.api.rackspacecloud.com/v2",
        versionList: "https://iad.servers.api.rackspacecloud.com/",
        versionId: "2"
      },
      {
        region: "HKG",
        tenantId: "987654",
        publicURL: "https://hkg.servers.api.rackspacecloud.com/v2/987654",
        versionInfo: "https://hkg.servers.api.rackspacecloud.com/v2",
        versionList: "https://hkg.servers.api.rackspacecloud.com/",
        versionId: "2"
      },
      {
        region: "DFW",
        tenantId: "987654",
        publicURL: "https://dfw.servers.api.rackspacecloud.com/v2/987654",
        versionInfo: "https://dfw.servers.api.rackspacecloud.com/v2",
        versionList: "https://dfw.servers.api.rackspacecloud.com/",
        versionId: "2"
      },
      {
        region: "SYD",
        tenantId: "987654",
        publicURL: "https://syd.servers.api.rackspacecloud.com/v2/987654",
        versionInfo: "https://syd.servers.api.rackspacecloud.com/v2",
        versionList: "https://syd.servers.api.rackspacecloud.com/",
        versionId: "2"
      }
      ],
        type: "compute"
    },
    {
      name: "cloudQueues",
      endpoints: [
      {
        region: "HKG",
        tenantId: "987654",
        publicURL: "https://hkg.queues.api.rackspacecloud.com/v1/987654",
        internalURL: "https://snet-hkg.queues.api.rackspacecloud.com/v1/987654"
      },
      {
        region: "SYD",
        tenantId: "987654",
        publicURL: "https://syd.queues.api.rackspacecloud.com/v1/987654",
        internalURL: "https://snet-syd.queues.api.rackspacecloud.com/v1/987654"
      },
      {
        region: "DFW",
        tenantId: "987654",
        publicURL: "https://dfw.queues.api.rackspacecloud.com/v1/987654",
        internalURL: "https://snet-dfw.queues.api.rackspacecloud.com/v1/987654"
      },
      {
        region: "IAD",
        tenantId: "987654",
        publicURL: "https://iad.queues.api.rackspacecloud.com/v1/987654",
        internalURL: "https://snet-iad.queues.api.rackspacecloud.com/v1/987654"
      }
      ],
        type: "rax:queues"
    },
    {
      name: "cloudBigData",
      endpoints: [
      {
        region: "IAD",
        tenantId: "987654",
        publicURL: "https://iad.bigdata.api.rackspacecloud.com/v1.0/987654"
      },
      {
        region: "DFW",
        tenantId: "987654",
        publicURL: "https://dfw.bigdata.api.rackspacecloud.com/v1.0/987654"
      }
      ],
        type: "rax:bigdata"
    },
    {
      name: "cloudOrchestration",
      endpoints: [
      {
        region: "HKG",
        tenantId: "987654",
        publicURL: "https://hkg.orchestration.api.rackspacecloud.com/v1/987654"
      },
      {
        region: "DFW",
        tenantId: "987654",
        publicURL: "https://dfw.orchestration.api.rackspacecloud.com/v1/987654"
      },
      {
        region: "IAD",
        tenantId: "987654",
        publicURL: "https://iad.orchestration.api.rackspacecloud.com/v1/987654"
      },
      {
        region: "SYD",
        tenantId: "987654",
        publicURL: "https://syd.orchestration.api.rackspacecloud.com/v1/987654"
      }
      ],
        type: "orchestration"
    },
    {
      name: "autoscale",
      endpoints: [
      {
        region: "DFW",
        tenantId: "987654",
        publicURL: "https://dfw.autoscale.api.rackspacecloud.com/v1.0/987654"
      },
      {
        region: "HKG",
        tenantId: "987654",
        publicURL: "https://hkg.autoscale.api.rackspacecloud.com/v1.0/987654"
      },
      {
        region: "IAD",
        tenantId: "987654",
        publicURL: "https://iad.autoscale.api.rackspacecloud.com/v1.0/987654"
      },
      {
        region: "SYD",
        tenantId: "987654",
        publicURL: "https://syd.autoscale.api.rackspacecloud.com/v1.0/987654"
      }
      ],
        type: "rax:autoscale"
    },
    {
      name: "cloudMetrics",
      endpoints: [
      {
        region: "IAD",
        tenantId: "987654",
        publicURL: "https://global.metrics.api.rackspacecloud.com/v2.0/987654"
      }
      ],
        type: "rax:cloudmetrics"
    },
    {
      name: "cloudFeeds",
      endpoints: [
      {
        region: "HKG",
        tenantId: "987654",
        publicURL: "https://hkg.feeds.api.rackspacecloud.com/987654",
        internalURL: "https://atom.prod.hkg1.us.ci.rackspace.net/987654"
      },
      {
        region: "SYD",
        tenantId: "987654",
        publicURL: "https://syd.feeds.api.rackspacecloud.com/987654",
        internalURL: "https://atom.prod.syd2.us.ci.rackspace.net/987654"
      },
      {
        region: "IAD",
        tenantId: "987654",
        publicURL: "https://iad.feeds.api.rackspacecloud.com/987654",
        internalURL: "https://atom.prod.iad3.us.ci.rackspace.net/987654"
      },
      {
        region: "DFW",
        tenantId: "987654",
        publicURL: "https://dfw.feeds.api.rackspacecloud.com/987654",
        internalURL: "https://atom.prod.dfw1.us.ci.rackspace.net/987654"
      },
      {
        region: "ORD",
        tenantId: "987654",
        publicURL: "https://ord.feeds.api.rackspacecloud.com/987654",
        internalURL: "https://atom.prod.ord1.us.ci.rackspace.net/987654"
      }
      ],
        type: "rax:feeds"
    },
    {
      name: "cloudMonitoring",
      endpoints: [
      {
        tenantId: "987654",
        publicURL: "https://monitoring.api.rackspacecloud.com/v1.0/987654"
      }
      ],
        type: "rax:monitor"
    },
    {
      name: "cloudFilesCDN",
      endpoints: [
      {
        region: "IAD",
        tenantId: "MossoCloudFS_987654",
        publicURL: "https://cdn5.clouddrive.com/v1/MossoCloudFS_987654"
      },
      {
        region: "SYD",
        tenantId: "MossoCloudFS_987654",
        publicURL: "https://cdn4.clouddrive.com/v1/MossoCloudFS_987654"
      },
      {
        region: "DFW",
        tenantId: "MossoCloudFS_987654",
        publicURL: "https://cdn1.clouddrive.com/v1/MossoCloudFS_987654"
      },
      {
        region: "HKG",
        tenantId: "MossoCloudFS_987654",
        publicURL: "https://cdn6.clouddrive.com/v1/MossoCloudFS_987654"
      }
      ],
        type: "rax:object-cdn"
    },
    {
      name: "cloudFiles",
      endpoints: [
      {
        region: "IAD",
        tenantId: "MossoCloudFS_987654",
        publicURL: "https://storage101.iad3.clouddrive.com/v1/MossoCloudFS_987654",
        internalURL: "https://snet-storage101.iad3.clouddrive.com/v1/MossoCloudFS_987654"
      },
      {
        region: "SYD",
        tenantId: "MossoCloudFS_987654",
        publicURL: "https://storage101.syd2.clouddrive.com/v1/MossoCloudFS_987654",
        internalURL: "https://snet-storage101.syd2.clouddrive.com/v1/MossoCloudFS_987654"
      },
      {
        region: "DFW",
        tenantId: "MossoCloudFS_987654",
        publicURL: "https://storage101.dfw1.clouddrive.com/v1/MossoCloudFS_987654",
        internalURL: "https://snet-storage101.dfw1.clouddrive.com/v1/MossoCloudFS_987654"
      },
      {
        region: "HKG",
        tenantId: "MossoCloudFS_987654",
        publicURL: "https://storage101.hkg1.clouddrive.com/v1/MossoCloudFS_987654",
        internalURL: "https://snet-storage101.hkg1.clouddrive.com/v1/MossoCloudFS_987654"
      }
      ],
        type: "object-store"
    }
    ],
      user: {
        id: "54b6f3983d63f36886ed3c2811b0960c",
        roles: [
        {
          tenantId: "MossoCloudFS_987654",
          id: "5",
          description: "A Role that allows a user access to keystone Service methods",
          name: "object-store:default"
        },
        {
          tenantId: "987654",
          id: "6",
          description: "A Role that allows a user access to keystone Service methods",
          name: "compute:default"
        },
        {
          id: "3",
          description: "User Admin Role.",
          name: "identity:user-admin"
        }
        ],
          name: "testuser",
          "RAX-AUTH:defaultRegion": "IAD"
      }
  }
};

module.exports = MOCK;
