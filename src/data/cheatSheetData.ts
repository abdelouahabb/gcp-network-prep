export interface VipEntry {
  range: string;
  service: string;
  direction: string;
  examNotes: string;
}

export const MUST_KNOW_VIPS: VipEntry[] = [
  {
    range: '199.36.153.4/30 (.4 – .7)',
    service: 'restricted.googleapis.com (Private Google Access)',
    direction: 'Egress to Google APIs (VPC or On-Prem via VPN/IC)',
    examNotes: 'Enforces VPC Service Controls (VPC-SC)! Blocks non-VPC-SC APIs. Requires route to default-internet-gateway in VPC.'
  },
  {
    range: '199.36.153.8/30 (.8 – .11)',
    service: 'private.googleapis.com (Private Google Access)',
    direction: 'Egress to Google APIs (VPC or On-Prem via VPN/IC)',
    examNotes: 'Supports ALL Google APIs (including non-VPC-SC compliant APIs). Requires route to default-internet-gateway in VPC.'
  },
  {
    range: '35.199.192.0/19',
    service: 'Cloud DNS Outbound Forwarding & Private NS Queries',
    direction: 'Source IP of DNS packets sent to On-Prem / VPC NS',
    examNotes: 'MUST advertise 35.199.192.0/19 as a Custom Advertised Route on Cloud Router and allow on On-Prem firewalls (UDP/TCP 53)!'
  },
  {
    range: '35.235.240.0/20',
    service: 'Identity-Aware Proxy (IAP) TCP Forwarding',
    direction: 'Ingress to VM (SSH port 22, RDP port 3389)',
    examNotes: 'Allow 35.235.240.0/20 on VPC Firewall (and use goto_next in Org Hierarchical Firewall Policies) for SSH/RDP without external IPs.'
  },
  {
    range: '35.191.0.0/16 & 130.211.0.0/22',
    service: 'Google Cloud Load Balancer Health Check Probers',
    direction: 'Ingress to Backend VMs / Pods / Hybrid NEGs',
    examNotes: 'Mandatory for ALL Load Balancers & Cloud Armor/Packet Mirroring collectors. For Hybrid NEGs, advertise & allow across Interconnect/VPN!'
  },
  {
    range: '169.254.169.254',
    service: 'Compute Engine Metadata Server & Local DNS Resolver',
    direction: 'Link-local inside every GCP VM / GKE Node',
    examNotes: 'All Cloud DNS queries from VMs and GKE nodes using Cloud DNS for GKE go to 169.254.169.254:53.'
  },
  {
    range: '169.254.0.0/16',
    service: 'Cloud Router BGP Link-Local Peer IPs',
    direction: 'HA VPN / Interconnect VLAN Attachment BGP session',
    examNotes: 'Used as the /30 link-local IP addresses on each HA VPN tunnel and VLAN attachment BGP session.'
  },
  {
    range: 'ASN 16550',
    service: 'Partner Interconnect Cloud Router Mandatory ASN',
    direction: 'eBGP Session for Partner Interconnect (L2 & L3)',
    examNotes: 'Partner Interconnect ALWAYS requires Cloud Router ASN 16550. Dedicated Interconnect & HA VPN use Private ASNs (64512–65534).'
  }
];

export const KEY_IAM_ROLES = [
  {
    role: 'roles/compute.xpnAdmin',
    title: 'Compute Shared VPC Admin',
    scope: 'Organization or Folder',
    purpose: 'Enables Host Projects and attaches/detaches Service Projects in a Shared VPC.'
  },
  {
    role: 'roles/compute.networkUser',
    title: 'Compute Network User',
    scope: 'Subnet-level (Best Practice) or Host Project',
    purpose: 'Allows Service Project principals & GKE service agents to create VMs/Pods/ILBs inside specific Shared VPC subnets.'
  },
  {
    role: 'roles/container.hostServiceAgentUser',
    title: 'Kubernetes Engine Host Service Agent User',
    scope: 'Shared VPC Host Project',
    purpose: 'Granted to the Service Project GKE Service Agent (`service-SVC_NUM@container-engine-robot...`) so it can manage Host VPC firewall rules.'
  },
  {
    role: 'roles/compute.securityAdmin',
    title: 'Compute Security Admin',
    scope: 'Project',
    purpose: 'Manages VPC Firewall Rules, Cloud Armor Security Policies, and SSL Certificates (cannot modify subnets or routes).'
  },
  {
    role: 'roles/compute.orgSecurityPolicyAdmin & orgSecurityResourceAdmin',
    title: 'Organization Security Policy & Resource Admin',
    scope: 'Organization or Folder',
    purpose: 'Creates and associates Hierarchical Firewall Policies at the Organization or Folder level.'
  },
  {
    role: 'roles/resourcemanager.tagUser',
    title: 'Tag User (IAM Secure Tags)',
    scope: 'Tag Value + VM Instance',
    purpose: 'Required to bind an IAM-governed Secure Tag to a VM for Network Firewall Policies (prevents developers from spoofing tags).'
  }
];
