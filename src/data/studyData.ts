import { StudyDomain } from '../types';

export const STUDY_DOMAINS: StudyDomain[] = [
  {
    id: 'domain-1',
    number: 1,
    title: 'Designing, Planning, and Prototyping a GCP Network',
    shortTitle: '1. Network Architecture & Design',
    weight: '26%',
    description:
      'Master Andromeda SDN internals, Shared VPC vs. VPC Peering vs. NCC, Private Connectivity (PSC, PSA, PGA), IP subnetting & GKE secondary ranges, and hybrid Cloud DNS architectures.',
    color: 'blue',
    concepts: [
      {
        id: 'vpc-multi-project-design',
        title: 'Shared VPC vs. VPC Network Peering vs. Network Connectivity Center (NCC)',
        subtitle: 'Choosing the right multi-VPC and multi-project enterprise topology',
        tags: ['Shared VPC', 'VPC Peering', 'NCC', 'Andromeda SDN', 'IAM'],
        howItWorks: [
          'Google Cloud VPCs are global software-defined networks powered by Andromeda. Unlike AWS/Azure where VPCs are regional and subnets are zonal, a GCP VPC is global and subnets are regional (spanning all zones in that region).',
          'Shared VPC (Centralized Governance): A singleVPC lives in a Host Project. Service Projects attach to the Host Project so their VMs, GKE clusters, and internal load balancers consume subnets directly from the Host VPC. All communication stays within the SAME VPC—no peering limits, transitive access to Shared VPC hybrid attachments (VLAN attachments / HA VPNs), and centralized firewall/route control.',
          'VPC Network Peering (Decentralized Autonomy): Connects two independent VPCs (same or different organizations) over Andromeda Layer 3 without traversing the public internet or incurring egress bandwidth charges (only standard zonal/regional rates apply). Strictly NON-TRANSITIVE (if VPC-A peers with VPC-B, and VPC-B peers with VPC-C, A cannot reach C). Maximum 25 peerings per VPC network by default (quota limit on total dynamic routes/subnet routes across peering group).',
          'Network Connectivity Center (NCC): Hub-and-spoke control plane that manages full-mesh or star connectivity across VPC spokes, HA VPN spokes, Interconnect VLAN attachment spokes, and Router Appliance (NVA) spokes. VPC spokes attached to an NCC Hub share subnet routes dynamically without managing N*(N-1)/2 manual peering links, and support Star topology (Client VPC spokes only talk to Center VPC spokes, e.g., centralized inspection VPC).'
        ],
        architectureNotes: [
          'Shared VPC Least Privilege IAM: Organization Admin grants `roles/compute.xpnAdmin` (Shared VPC Admin) to a network lead. To allow a Service Project admin to deploy VMs ONLY into a specific subnet, assign `roles/compute.networkUser` at the SUBNET level (not the project level!).',
          'GKE in Shared VPC requires enabling the Kubernetes Engine API in BOTH Host and Service projects, granting `roles/compute.networkUser` on the primary AND both secondary ranges to the Service Project GKE service account (`service-PROJECT_NUMBER@container-engine-robot.iam.gserviceaccount.com`) and Google APIs service account, plus `roles/container.hostServiceAgentUser` on the Host Project so the Service Project GKE robot can manage host-level firewall rules and load balancers.',
          'VPC Peering Custom Route Exchange: By default, VPC Peering ONLY exchanges subnet routes (primary and secondary CIDR ranges). Static and dynamic (BGP) routes are NOT exchanged unless BOTH sides explicitly configure `export-custom-routes` (hub) and `import-custom-routes` (spoke).'
        ],
        asciiOrFlowDiagram: {
          title: 'Transitivity & Hybrid Reachability Pattern',
          nodes: [
            { label: 'On-Premises Data Center', detail: 'BGP via HA VPN / Interconnect', color: 'amber' },
            { label: 'Hub Shared VPC (Host Project)', detail: 'Cloud Router + Global Dynamic Routing (Exports custom routes)', color: 'blue' },
            { label: 'Service Project VMs / GKE', detail: 'Directly in Shared VPC subnets -> Native hybrid reachability', color: 'emerald' },
            { label: 'Peered Spoke VPC', detail: 'Imports custom routes -> Reaches on-prem, CANNOT reach other peered spokes', color: 'purple' }
          ],
          flowNote: 'Exam Rule: Two peered Spoke VPCs cannot communicate through a Hub VPC using native VPC Peering alone unless you insert a Next-Hop NVA / Private Service Connect / NCC VPC Spokes.'
        },
        comparisonTable: {
          title: 'Multi-VPC & Multi-Project Connectivity Matrix',
          headers: ['Feature / Constraint', 'Shared VPC', 'VPC Network Peering', 'NCC (VPC Spokes)', 'Private Service Connect (PSC)'],
          rows: [
            ['Cross-Organization Support', 'No (Must be under same GCP Org)', 'Yes (Works across different GCP Orgs)', 'No (Same GCP Org)', 'Yes (Works across Orgs & overlapping IPs)'],
            ['Overlapping IP Ranges Allowed?', 'No (Single VPC namespace)', 'No (Fails if any subnet in peered VPCs overlaps)', 'No (Non-overlapping required for exported subnets)', 'Yes! Uses consumer IP or NAT subnet'],
            ['Transitive Routing', 'N/A (Single VPC - full reachability)', 'No (Strictly non-transitive)', 'Yes (Full Mesh or Star between Hub VPC spokes)', 'Point-to-point service publication'],
            ['Hybrid (VPN/Interconnect) Sharing', 'Native (All Service Projects share Host attachments)', 'Via Custom Route Export/Import', 'Native via Hybrid Spokes + VPC Spokes (with Hub routing)', 'Only for published service / PSC endpoint'],
            ['Quota Bottleneck', 'Up to 1,000 service projects per host', 'Max 25 peerings per VPC; Peering group route/VM quotas', 'Up to 250+ VPC spokes per NCC Hub', 'Per-endpoint / Service Attachment limits']
          ]
        },
        examTraps: [
          'TRAP 1: An acquisition scenario states "Two companies with separate GCP Organizations (or overlapping RFC 1918 IP space) must expose a specific internal microservice swiftly." Never pick Shared VPC (requires same Org) or VPC Peering (fails on overlapping IPs). Pick Private Service Connect (PSC)!',
          'TRAP 2: "VPC-A (On-prem VPN) <-> VPC-B <-> VPC-C. VMs in VPC-C must reach On-prem." VPC Peering custom route export ONLY passes routes 1 hop. VPC-A exports to VPC-B, and VPC-B CANNOT re-export VPC-A’s BGP routes to VPC-C!',
          'TRAP 3: When deleting a Shared VPC Service Project or detaching it, you must first delete all instance templates, GKE clusters, and internal load balancers referencing the Host VPC subnets.'
        ],
        cliCommands: [
          {
            description: 'Enable Shared VPC Host Project and attach a Service Project',
            command: 'gcloud compute shared-vpc enable HOST_PROJECT_ID &&\ngcloud compute shared-vpc associated-projects add SERVICE_PROJECT_ID --host-project=HOST_PROJECT_ID'
          },
          {
            description: 'Update VPC Peering to export custom (static/BGP) routes to a spoke',
            command: 'gcloud compute networks peerings update PEERING_NAME \\\n  --network=HUB_VPC \\\n  --export-custom-routes \\\n  --export-subnet-routes-with-public-ip'
          }
        ]
      },
      {
        id: 'private-connectivity-spectrum',
        title: 'Private Connectivity Spectrum: PGA vs. PSA vs. PSC vs. Serverless VPC Access',
        subtitle: 'The #1 most tested distinction on the PCNE exam',
        tags: ['Private Google Access', 'Private Services Access', 'Private Service Connect', 'VIPs'],
        howItWorks: [
          '1. Private Google Access (PGA): Enabled at the SUBNET level (`--enable-private-ip-google-access`). Allows VMs WITHOUT external IP addresses to reach Google APIs and services (Cloud Storage, BigQuery, Artifact Registry, Pub/Sub). Traffic stays completely on Google’s internal network. For on-premises hosts reaching Google APIs over VPN/Interconnect, enable "Private Google Access for on-premises hosts" by routing `199.36.153.8/30` (`private.googleapis.com`) or `199.36.153.4/30` (`restricted.googleapis.com`) over the tunnel and advertising that /30 via Cloud Router.',
          '2. Private Services Access (PSA): Implemented as a VPC Network Peering connection between your VPC and a Google-managed Service Producer VPC (`servicenetworking-googleapis-com`). Used by Cloud SQL, Memorystore, Filestore, AlloyDB, and Vertex AI Training. You allocate an internal IP address range (`/16` to `/24`) in your VPC and create a private connection. Caveat: Because PSA uses VPC Peering under the hood, on-premises hosts or peered Spoke VPCs cannot reach PSA Cloud SQL unless you export custom routes on the `servicenetworking-googleapis-com` peering connection (and it still cannot traverse two peering hops!).',
          '3. Private Service Connect (PSC): Next-generation service-oriented private connectivity without VPC Peering. Supports two primary consumption models: (A) PSC Endpoints (Forwarding Rule allocates an internal IP from your consumer VPC subnet; traffic goes directly to a Google API bundle like `all-apis` or `vpc-sc`, OR to a published Producer Service Attachment sitting behind an Internal LB), and (B) PSC Backends (A Network Endpoint Group pointing to a PSC target, placed behind a Consumer Load Balancer so you can apply Cloud Armor, Custom Certificates, or URL Maps).',
          '4. Direct VPC Egress vs. Serverless VPC Access Connector: Allows Cloud Run / Cloud Functions / App Engine Standard to send egress traffic into your VPC (to reach internal VMs, Memorystore, or on-prem via VPN). Direct VPC Egress is the modern, lower-latency, zero-proxy-VM option that attaches directly to a subnet; Serverless VPC Access Connector uses a dedicated `/28` subnet and spins up managed e2-micro/f1-micro/e2-standard connector VMs.'
        ],
        architectureNotes: [
          'CRITICAL VIP DIFFERENCE (`private.googleapis.com` vs `restricted.googleapis.com`):',
          '• `private.googleapis.com` (`199.36.153.8/30` — IPs `.8, .9, .10, .11`): Supports ALL Google APIs, including those that do NOT support VPC Service Controls (VPC-SC). Requires default internet route (`0.0.0.0/0` next-hop `default-internet-gateway`) or explicit `/30` route to `default-internet-gateway` in the VPC.',
          '• `restricted.googleapis.com` (`199.36.153.4/30` — IPs `.4, .5, .6, .7`): Enforces VPC Service Controls (VPC-SC) perimeter security! Blocks any Google API that is not VPC-SC compliant, preventing data exfiltration via non-compliant Google services.',
          '• Custom PSC Google API Endpoint (e.g., `10.10.0.50`): You pick ANY single internal IP from your VPC (doesn’t even need a subnet—just an internal IP) and create a global forwarding rule targeting `all-apis` or `vpc-sc`. Automatic Cloud DNS private zone `p.googleapis.com` is created (e.g., `storage-myendpoint.p.googleapis.com`), or you can create a CNAME override for `*.googleapis.com`.'
        ],
        comparisonTable: {
          title: 'Google API VIPs & Private Connectivity Reference',
          headers: ['Mechanism / Domain', 'IP Range / Target', 'VPC-SC Compliant Only?', 'On-Premises Accessible?', 'Transitive Across Peering?'],
          rows: [
            ['private.googleapis.com', '199.36.153.8/30', 'No (Allows all Google APIs)', 'Yes (Advertise /30 via Cloud Router)', 'No (Unless custom route exported)'],
            ['restricted.googleapis.com', '199.36.153.4/30', 'Yes! (Blocks non-VPC-SC APIs)', 'Yes (Advertise /30 via Cloud Router)', 'No (Unless custom route exported)'],
            ['PSC Endpoint for Google APIs', '1 Custom Internal IP (e.g., 10.0.0.99)', 'Configurable (`all-apis` or `vpc-sc` bundle)', 'Yes (Advertise /32 via Cloud Router)', 'Can be placed directly in each spoke VPC'],
            ['Private Services Access (PSA)', 'Allocated CIDR (/16 to /24) via VPC Peering', 'Service-dependent (Cloud SQL, AlloyDB)', 'Requires `--export-custom-routes` on `servicenetworking-googleapis-com`', 'No! Peered Spoke VPCs cannot reach PSA VPC (Non-transitive peering)'],
            ['PSC Service Attachment (Producer)', 'Consumer Forwarding Rule IP -> Producer NAT Subnet', 'N/A (Customer/Third-party managed service)', 'Yes! If `--enable-proxy-protocol` or consumer subnet is routed to on-prem', 'Avoids peering completely! Any spoke can create its own PSC endpoint']
          ]
        },
        examTraps: [
          'TRAP 1: "A company uses VPC Service Controls (VPC-SC) to prevent data exfiltration from Cloud Storage and BigQuery. VMs have no external IPs. Which DNS/route configuration should you use?" Always choose `restricted.googleapis.com` (`199.36.153.4/30`) or a PSC Endpoint with the `vpc-sc` bundle! Do NOT use `private.googleapis.com` (`199.36.153.8/30`) when VPC-SC is required.',
          'TRAP 2: "VMs have no external IP and `enable-private-ip-google-access` is ON, and DNS points `*.googleapis.com` to `199.36.153.8/30`. You deleted the default `0.0.0.0/0` route to `default-internet-gateway` for security. Now Cloud Storage fails." WHY? Even private traffic to `199.36.153.8/30` or `199.36.153.4/30` requires an explicit VPC route whose next-hop is `default-internet-gateway`! Without `0.0.0.0/0`, you MUST add a static route for `199.36.153.8/30` (or `.4/30`) with `next-hop-gateway=default-internet-gateway`.',
          'TRAP 3: "Spoke VPC A is peered with Hub VPC B. Hub VPC B connects to Cloud SQL via Private Services Access (PSA). VMs in Spoke VPC A cannot reach Cloud SQL." Because PSA is a VPC Peering (`servicenetworking-googleapis-com`), Spoke A <-> Hub B <-> PSA VPC is transitive peering (blocked!). Solution: Use a Cloud SQL Auth Proxy VM in Hub B, an Internal Passthrough/Regional Proxy LB with PSC, or deploy Cloud SQL with a Private Service Connect (PSC) endpoint directly in Spoke VPC A.'
        ],
        cliCommands: [
          {
            description: 'Add explicit route for restricted.googleapis.com when 0.0.0.0/0 is removed',
            command: 'gcloud compute routes create route-restricted-googleapis \\\n  --network=prod-vpc \\\n  --destination-range=199.36.153.4/30 \\\n  --next-hop-gateway=default-internet-gateway'
          },
          {
            description: 'Export custom routes from your VPC to Private Services Access (Cloud SQL) so On-Prem can reach Cloud SQL',
            command: 'gcloud compute networks peerings update servicenetworking-googleapis-com \\\n  --network=prod-vpc \\\n  --export-custom-routes \\\n  --import-custom-routes'
          }
        ]
      },
      {
        id: 'cloud-dns-hybrid-architecture',
        title: 'Cloud DNS Hybrid Architecture, Peering, Forwarding & Split-Horizon',
        subtitle: 'Mastering Inbound Server Policies, Outbound Forwarding Zones, and DNS Peering',
        tags: ['Cloud DNS', '35.199.192.0/19', 'DNS Peering', 'Forwarding Zones', 'Split-Horizon'],
        howItWorks: [
          'Every GCP VM resolves DNS by querying its local metadata server (`169.254.169.254`).Cloud DNS evaluates resolution in strict order from most-specific to least-specific domain match: (1) Response Policy rules (RPZ), (2) Private zones / Forwarding zones / Peering zones attached to the VPC, (3) Internal Compute Engine automatic zones (`.internal`), (4) Public DNS resolution.',
          'Outbound DNS Forwarding (GCP -> On-Prem): Create a Cloud DNS Private Forwarding Zone for `corp.onprem.local` and specify the IP addresses of on-premises DNS servers as forwarding targets. Choose between Standard Routing (queries originate from `35.199.192.0/19` and route over Cloud VPN/Interconnect) or Private Routing (queries can traverse VPC Peering).',
          'Inbound DNS Server Policy (On-Prem -> GCP): Enabling an Inbound Server Policy on a VPC automatically allocates one local IP address from EACH regional subnet in that VPC to act as an inbound DNS listener (port 53 UDP/TCP). On-premises DNS servers forward queries for `.gcp.internal` to any of these allocated regional subnet IPs over HA VPN / Interconnect.',
          'DNS Peering Zone: Delegates DNS resolution for a namespace (e.g., `svc.internal`) from a Consumer VPC to a Producer VPC’s authoritative DNS records/forwarding rules WITHOUT requiring VPC Network Peering! Note: DNS Peering is a ONE-WAY control-plane delegation—you must still have a data-plane path (like VPN, Interconnect, or PSC) if you want to connect to the resolved IPs.'
        ],
        architectureNotes: [
          'MEMORIZE `35.199.192.0/19`: When Cloud DNS performs outbound forwarding (or queries an authoritative name server inside a private network) using standard routing, the source IP of the DNS query packets is ALWAYS from `35.199.192.0/19`. You MUST advertise `35.199.192.0/19` over your Cloud Router BGP session to on-premises AND allow `35.199.192.0/19` on your VPC/on-prem firewalls (UDP/TCP 53)!',
          'Centralized Hub-and-Spoke DNS Pattern: Attach Inbound Server Policy and Outbound Forwarding Zones to the Hub VPC. In each Spoke VPC, create a Cloud DNS Peering Zone for `.` (root) or `onprem.corp` targeting the Hub VPC. That way all Spoke VPCs resolve on-prem and hub private records through the Hub VPC!',
          'GKE DNS Options: `kube-dns` runs as Pods inside the cluster (can become a bottleneck at scale and consumes Pod CPU/memory). `NodeLocal DNSCache` runs as a DaemonSet on each GKE node to cache DNS locally and use TCP to upstream `kube-dns`. `Cloud DNS for GKE` completely replaces `kube-dns` with the node-local metadata server (`169.254.169.254`), eliminating in-cluster DNS pods and scaling effortlessly!'
        ],
        comparisonTable: {
          title: 'Cloud DNS Zone Types & Directionality',
          headers: ['Zone / Feature', 'Direction', 'Source IP Seen by Target', 'Use Case'],
          rows: [
            ['Private Managed Zone', 'Internal to authorized VPCs', '169.254.169.254 (Metadata)', 'Authoritative records (`A`, `CNAME`, `SRV`) for VMs in attached VPCs; supports Split-Horizon'],
            ['Forwarding Zone', 'Outbound (GCP -> On-Prem / NVA)', '35.199.192.0/19', 'Forward queries for on-prem domains (`corp.local`) to on-prem Active Directory / BIND servers'],
            ['Inbound Server Policy', 'Inbound (On-Prem -> GCP)', 'On-Prem DNS Server IP', 'Creates an internal IP in every subnet so on-prem DNS can query Cloud DNS private zones'],
            ['DNS Peering Zone', 'Cross-VPC Delegation (Spoke -> Hub)', 'Evaluated in Target VPC context', 'Let Spoke VPCs resolve Hub VPC Private Zones & Hub Forwarding Zones without duplicating configs'],
            ['Response Policy (RPZ)', 'Override Policy (Highest Priority)', '169.254.169.254', 'DNS sinkholing, security overrides, or local CNAME/A record injection across VPCs']
          ]
        },
        examTraps: [
          'TRAP 1: "You configured a Cloud DNS Forwarding Zone for `onprem.corp` pointing to `172.16.1.53` over HA VPN. VMs can ping `172.16.1.53`, and `dig @172.16.1.53 host.onprem.corp` works directly from a VM, but normal `nslookup host.onprem.corp` via Cloud DNS times out!" WHY? Direct `dig @172.16.1.53` uses the VM’s subnet IP as source. Normal DNS goes through Cloud DNS, which uses `35.199.192.0/19` as the source IP! You forgot to advertise `35.199.192.0/19` as a Custom Advertised Route on Cloud Router (or allow it on the on-prem firewall).',
          'TRAP 2: "Inbound Server Policy IP changes or disappears when a region’s subnet is deleted." Always create dedicated regional subnets or reserve static inbound DNS IPs and configure multiple regional Inbound Policy IPs on your on-premises DNS conditional forwarder for high availability.'
        ],
        cliCommands: [
          {
            description: 'Enable Inbound DNS Server Policy on a Hub VPC and list allocated regional listener IPs',
            command: 'gcloud dns policies create hub-inbound-policy \\\n  --networks=hub-vpc \\\n  --enable-inbound-forwarding &&\ngcloud compute addresses list --filter="purpose=DNS_RESOLVER"'
          },
          {
            description: 'Advertise Cloud DNS range (35.199.192.0/19) and Private Google Access range via Cloud Router',
            command: 'gcloud compute routers update prod-router \\\n  --region=us-central1 \\\n  --advertisement-mode=CUSTOM \\\n  --set-advertisement-groups=ALL_SUBNETS \\\n  --set-advertisement-ranges=35.199.192.0/19,199.36.153.4/30'
          }
        ]
      },
      {
        id: 'ip-addressing-gke-subnetting',
        title: 'IP Addressing, Subnet Expansion, Non-RFC 1918, and GKE Alias IP Sizing',
        subtitle: 'Calculating Pod/Node/Service CIDRs and preventing IP exhaustion',
        tags: ['IPAM', 'GKE Alias IPs', 'RFC 1918', 'PUPI', 'IPv6 Dual-Stack'],
        howItWorks: [
          'Every GCP subnet has 4 reserved IP addresses that cannot be assigned to VMs: Network address (1st IP, e.g., `.0`), Default gateway (2nd IP, e.g., `.1`), Second-to-last IP (`.254` in a `/24`, reserved for future use), and Broadcast address (last IP, `.255`). Thus usable IPs = `2^(32 - prefix) - 4`.',
          'Primary Subnet Prefix Expansion: You can expand a subnet’s primary CIDR range in-place (e.g., from `/24` to `/20`) WITHOUT downtime or recreating VMs (`gcloud compute networks subnets expand-ip-range`). You can NEVER shrink a primary CIDR range!',
          'VPC-Native GKE Clusters (Alias IPs): Uses three separate IP ranges on the subnet: (1) Primary Subnet Range -> Assigned to GKE Nodes, (2) Secondary Range 1 -> Assigned to Pods (drawn per Node as a `/24` by default!), (3) Secondary Range 2 -> Assigned to ClusterIP Services (managed by GKE control plane, not advertised outside the cluster).',
          'GKE Pod CIDR Math (Crucial Exam Calculation): By default, GKE sets `--max-pods-per-node=110`, which reserves a `/24` (256 IPs, ~2x max pods) from the Pod Secondary Range for EVERY SINGLE NODE! Even if a node only runs 5 pods, it still consumes a full `/24` slice of the Pod secondary range. If you decrease `--max-pods-per-node` to `32`, each node only claims a `/26` (64 IPs), allowing 4x more nodes in the same Pod secondary CIDR!'
        ],
        architectureNotes: [
          'Adding Secondary Ranges to Running GKE Clusters (Multi-Pod CIDR): If a GKE cluster runs out of Pod IPs because the secondary range is too small, you CANNOT expand a secondary range in-place if it conflicts, Instead, add a NEW secondary IP range to the subnet and attach it to the cluster or specific Node Pool using `--additional-pod-ipv4-ranges` (Discontinuous Multi-Pod CIDR)!',
          'GKE IP Masquerade Agent (`ip-masq-agent`): By default, traffic from GKE Pods to destinations outside the Pod CIDR (except RFC 1918 destinations depending on default non-masquerade CIDRs) may be SNATed to the GKE Node’s primary IP. If on-premises firewalls only allow the GKE Node primary subnet (`10.1.0.0/24`) and drop the Pod secondary range (`10.240.0.0/14`), configure `ip-masq-agent` so traffic to on-prem CIDRs IS masqueraded (SNATed) to the Node IP—reducing the BGP route table size on-premises!',
          'Privately Used Public IPs (PUPI): GCP allows configuring non-RFC 1918 public CIDR blocks inside your VPC subnets. To export them over VPC Peering or Cloud Router, you must explicitly enable `--export-subnet-routes-with-public-ip` and `--import-subnet-routes-with-public-ip`.'
        ],
        comparisonTable: {
          title: 'GKE Max Pods Per Node vs. Node Pod CIDR Slice Allocation',
          headers: ['Max Pods Per Node', 'Allocated CIDR Slice Per Node', 'IPs Reserved Per Node', 'Max Nodes in a /21 Pod Range (2,048 IPs)'],
          rows: [
            ['8 pods', '/28', '16 IPs', '128 Nodes'],
            ['9 – 16 pods', '/27', '32 IPs', '64 Nodes'],
            ['17 – 32 pods', '/26', '64 IPs', '32 Nodes'],
            ['33 – 64 pods', '/25', '128 IPs', '16 Nodes'],
            ['65 – 110 pods (Default!)', '/24', '256 IPs', 'Only 8 Nodes! (Most common exam failure scenario)'],
            ['111 – 256 pods (GKE Dataplane V2)', '/23', '512 IPs', 'Only 4 Nodes']
          ]
        },
        examTraps: [
          'TRAP 1: "A GKE cluster has a `/20` primary subnet (4,092 usable IPs) for nodes, and a `/21` secondary range for Pods. When scaling the node pool from 8 nodes to 12 nodes, node creation fails with `IP_SPACE_EXHAUSTED`." WHY? With the default 110 max pods per node, each node takes a `/24` from the `/21` Pod range (`2^(24-21) = 8` nodes max!). Even though the node primary range has 4,000+ free IPs, the Pod secondary range is 100% exhausted at 8 nodes! Fix: Either add an additional Pod secondary range (`--additional-pod-ipv4-ranges`) or create a new node pool with a smaller `--max-pods-per-node` (e.g., 32).',
          'TRAP 2: "On-premises routers have limited TCAM memory and cannot accept dozens of `/14` GKE Pod secondary CIDR routes over BGP." Fix: Do NOT advertise the GKE Pod secondary ranges on Cloud Router (`--set-advertisement-ranges` to exclude them), and configure GKE `ip-masq-agent` (or Cloud NAT) so Pod traffic destined to on-premises is SNATed to the GKE Node’s primary IP!'
        ],
        cliCommands: [
          {
            description: 'Expand a primary subnet range in-place without downtime',
            command: 'gcloud compute networks subnets expand-ip-range prod-subnet \\\n  --region=us-central1 \\\n  --prefix-length=20'
          },
          {
            description: 'Create a GKE node pool with reduced max-pods-per-node and an additional Pod secondary range',
            command: 'gcloud container node-pools create high-density-pool \\\n  --cluster=prod-cluster \\\n  --region=us-central1 \\\n  --max-pods-per-node=32 \\\n  --pod-ipv4-range=gke-pods-secondary-2'
          }
        ]
      }
    ]
  },
  {
    id: 'domain-2',
    number: 2,
    title: 'Implementing Virtual Private Cloud (VPC) Instances',
    shortTitle: '2. VPC Routing, NAT & NVA Topologies',
    weight: '21%',
    description:
      'Master the GCP VPC Route Selection Algorithm, Global vs. Regional dynamic routing MED costs, Cloud NAT port exhaustion & EIM, Network Virtual Appliances (Multi-NIC), and NCC.',
    color: 'emerald',
    concepts: [
      {
        id: 'vpc-routing-order-deep-dive',
        title: 'VPC Route Selection Algorithm & Priority Order',
        subtitle: 'How Andromeda decides packet forwarding: Policy-based routes, Longest Prefix Match, MED, and AS-Path',
        tags: ['Routing Order', 'LPM', 'Policy-Based Routes', 'Internal NLB Next-Hop', 'ECMP'],
        howItWorks: [
          'Step 0 (Highest Precedence — Overrides LPM!): Policy-Based Routes (PBR) and Special Return Paths. A Policy-Based Route can match on Source IP, Destination IP, Protocol, and VPC network/Attachment (including Interconnect VLAN attachments!) to steer traffic into an Internal Passthrough Network Load Balancer (ILB) fronting firewall NVAs—even overriding subnet routes or more-specific prefix routes!',
          'Step 1: Subnet Routes (Primary & Secondary CIDRs in local or peered VPCs). Subnet routes have priority `0` and cannot be overridden by static or dynamic routes for the exact same or broader prefix (unless you use a Policy-Based Route or NCC/NVA peering workaround).',
          'Step 2: Longest Prefix Match (LPM) among Static and Dynamic (BGP) Routes. A `/25` route with priority `5000` ALWAYS beats a `/24` route with priority `100`! Prefix specificity ALWAYS comes before route priority/MED!',
          'Step 3: Among routes with the EXACT SAME destination prefix length, GCP compares Route Priority (lowest numerical value wins, e.g., `100` beats `200`). For BGP routes learned by Cloud Router, Effective Priority = `Base Priority (default 100) + Learned BGP MED + Region-to-Region Inter-Region Cost (if Global Dynamic Routing is enabled)`.',
          'Step 4: If prefix length and priority are tied, GCP prefers routes in the same VPC over routes imported from a Peered VPC, and conducts ECMP (Equal-Cost Multi-Path) hashing across equal-cost next hops.'
        ],
        architectureNotes: [
          'Internal Passthrough NLB as a Next-Hop (`--next-hop-ilb`): When inserting stateful third-party firewall appliances (Palo Alto, Fortinet, Check Point) in a VPC, NEVER point static routes to a single VM instance (no automatic failover). Always front the NVA MIG with an Internal Passthrough Network Load Balancer (`--next-hop-ilb`) and enable symmetric hashing so forward and reverse flows land on the same stateful firewall VM!',
          'Multi-NIC Network Virtual Appliances (NVAs): In GCP, each NIC (`nic0`, `nic1`, `nic2`...) of a VM MUST attach to a DIFFERENT VPC network (and a subnet in the same region as the VM). The maximum number of NICs scales with the vCPU count of the machine type (min 2 NICs, up to 8 NICs for machines with >= 8 vCPUs). Guest OS IP forwarding (`--can-ip-forward`) must be enabled at VM creation time.'
        ],
        comparisonTable: {
          title: 'Deterministic VPC Route Selection Order',
          headers: ['Step', 'Rule / Tie-Breaker', 'Winner Example', 'Crucial Exam Nuance'],
          rows: [
            ['1', 'Policy-Based Route (PBR)', 'PBR matching `src 10.1.0.0/16 -> ILB`', 'Can override subnet routes and LPM! Ideal for forcing East-West or North-South traffic through an NVA ILB'],
            ['2', 'Most Specific Prefix (Longest Prefix Match)', '`172.16.1.0/25` (prio 1000) beats `172.16.0.0/16` (prio 50)', 'LPM ALWAYS wins over BGP MED or Static Route Priority!'],
            ['3', 'AS-Path Length (within same Cloud Router region)', 'AS-Path `65001` beats `65001 65001 65001`', 'Cloud Router evaluates AS-Path length BEFORE applying MED when routes are learned in the same region from different ASNs or prepended'],
            ['4', 'Lowest Route Priority / BGP MED', '`172.16.1.0/24` (MED 50) beats `172.16.1.0/24` (MED 100)', 'In Global Dynamic Routing, GCP adds an inter-region cost (201 to 9999) to remote-region Cloud Router routes!']
          ]
        },
        examTraps: [
          'TRAP 1: "You want a backup static route to `10.50.0.0/16` via a Legacy VPN tunnel (`priority 1000`) and a primary BGP route via HA VPN (`MED 100`). Suddenly traffic prefers the backup static route because someone advertised `10.50.1.0/24` on the static route." LPM (`/24`) beats `/16` regardless of priority!',
          'TRAP 2: "You deploy a 2-vCPU (`n2-standard-2`) firewall appliance VM and attempt to attach 4 network interfaces (`nic0` to `nic3`) across 4 VPCs. Creation fails." Why? In GCP, the maximum number of vNICs equals `1 vNIC per vCPU` (minimum 2, maximum 8). For 4 vNICs, you MUST use at least a 4-vCPU machine type (e.g., `n2-standard-4`)!'
        ],
        cliCommands: [
          {
            description: 'Create a static route using an Internal Passthrough NLB (NVA Firewall cluster) as Next-Hop',
            command: 'gcloud compute routes create route-via-firewall-ilb \\\n  --network=spoke-vpc \\\n  --destination-range=0.0.0.0/0 \\\n  --next-hop-ilb=nva-firewall-ilb \\\n  --next-hop-ilb-region=us-central1 \\\n  --priority=800'
          },
          {
            description: 'Create a Network Connectivity Policy-Based Route to steer Interconnect ingress traffic to an NVA ILB',
            command: 'gcloud network-connectivity policy-based-routes create inspect-hybrid-traffic \\\n  --network=hub-vpc \\\n  --source-range=192.168.0.0/16 \\\n  --destination-range=10.0.0.0/8 \\\n  --ip-protocol=ALL \\\n  --next-hop-ilb-ip=10.10.0.99 \\\n  --interconnect-attachment-region=us-central1'
          }
        ]
      },
      {
        id: 'cloud-nat-deep-dive',
        title: 'Cloud NAT Architecture, Dynamic Port Allocation, EIM & Private NAT',
        subtitle: 'Eliminating OUT_OF_RESOURCES port exhaustion and understanding Public vs. Private NAT',
        tags: ['Cloud NAT', 'Port Exhaustion', 'Dynamic Port Allocation', 'Private NAT', 'Andromeda'],
        howItWorks: [
          'Cloud NAT is a distributed, software-defined managed NAT service built directly into Andromeda—there is NO central NAT gateway VM or choke point in the data path! Cloud Router acts only as the control plane to configure Cloud NAT for a specific region.',
          'Static Port Allocation: Assigns a fixed number of source ports (default `64` ports) to EVERY VM in the covered subnets, regardless of whether the VM is idle or making thousands of connections. Maximum connections per external NAT IP = `(65,536 - 1,024 well-known ports) = 64,512 ports`.',
          'Dynamic Port Allocation (Recommended for bursty workloads): Assigns a `min-ports-per-vm` (e.g., `64`) at startup and dynamically scales up to `max-ports-per-vm` (up to `65,536`) on demand as a VM opens more concurrent connections to the same `(Destination IP, Destination Port, Protocol)` 3-tuple!',
          'Endpoint-Independent Mapping (EIM): Maps a VM’s internal `(IP:Port)` to the same NAT external `(IP:Port)` regardless of destination, required for STUN/VoIP/WebRTC. IMPORTANT: Dynamic Port Allocation and Endpoint-Independent Mapping are MUTUALLY EXCLUSIVE—if you enable Dynamic Port Allocation, EIM is automatically disabled (and enabling EIM reduces port sharing efficiency!).',
          'Private NAT: Performs RFC 1918-to-RFC 1918 NAT for East-West traffic across Network Connectivity Center (NCC) spokes (e.g., overlapping IP ranges between two acquired companies or on-premises hybrid spokes) without going to the internet!'
        ],
        architectureNotes: [
          'Cloud NAT Port Math (Guaranteed on the Exam!):',
          'Each NAT External IP provides `64,512` usable ports (`65,536 - 1,024`).',
          'In Static mode, if `min-ports-per-vm = 1,024` and you have `200 VMs`, you need `200 * 1,024 = 204,800 ports`. Number of NAT IPs required = `ceil(204,800 / 64,512) = ceil(3.17) = 4 External IPs`!',
          'Wait—what if a VM opens 500 concurrent connections to the EXACT SAME destination `(203.0.113.10:443, TCP)`? Under Linux/RFC 6056 5-tuple NAT, if a VM only has `64` ports allocated and connects to a SINGLE destination IP:Port, it can only open `64` simultaneous connections (plus a 120-second TCP TIME_WAIT reuse delay (`tcp-time-wait-timeout`) before closed ports can be reused for that same destination!).',
          'Notice: Cloud NAT NEVER performs DNAT for unsolicited inbound traffic from the internet! Only return packets for outbound-initiated sessions are allowed.'
        ],
        comparisonTable: {
          title: 'Cloud NAT Troubleshooting & Metrics Reference',
          headers: ['Symptom / Log Metric', 'Root Cause', 'Best Practice Remediation'],
          rows: [
            ['`OUT_OF_RESOURCES` (Port Allocation Failed)', 'Not enough total NAT External IPs to satisfy `VMs * min-ports-per-vm` (or dynamic growth)', 'Switch NAT IP allocation to `AUTO_ONLY` or add more Manual Static NAT IPs; enable Dynamic Port Allocation'],
            ['`DROPPED_SENT_PACKET` (`ENDPOINT_INDEPENDENCE_CONFLICT`)', 'EIM is enabled and two VMs / connections collide on port reservation', 'Disable Endpoint-Independent Mapping (`--no-enable-endpoint-independent-mapping`) unless strictly required by VoIP/STUN'],
            ['GKE Nodes dropping outbound connections under bursty load to a single partner API IP:443', 'GKE Node has 80 Pods all hitting the same partner IP:443; default 64 ports per VM (Node!) is exhausted + 120s TCP TIME_WAIT', 'Enable Dynamic Port Allocation (`--enable-dynamic-port-allocation`) and increase `--max-ports-per-vm` (e.g., 4096 or 8192)'],
            ['External Partner requires allowlisting fixed egress IPs', '`AUTO_ONLY` NAT IP allocation adds/removes ephemeral Google IPs dynamically', 'Reserve Static Regional External IP addresses and configure `--nat-external-ip-pool` (Manual NAT IP allocation)']
          ]
        },
        examTraps: [
          'TRAP 1: "A GKE cluster runs 50 Pods per node that make bursty HTTPS calls to a single third-party payment gateway IP (`198.51.100.5:443`). Connections intermittently time out with `DROPPED_SENT_PACKET` in Cloud NAT logs, even though you have 10 NAT IPs." WHY? Adding more NAT IPs does NOT increase the number of ports allocated *per VM*! Cloud NAT allocates ports per GKE Node (VM). With the default 64 ports per VM, each node can only make 64 concurrent connections to a single destination IP:Port! You MUST increase `min-ports-per-vm` or enable Dynamic Port Allocation (`--enable-dynamic-port-allocation --max-ports-per-vm=4096`).',
          'TRAP 2: "VMs behind Cloud NAT download terabytes of objects from Cloud Storage (`storage.googleapis.com`), causing high Cloud NAT data processing charges." How do you eliminate Cloud NAT charges for Google APIs? Enable **Private Google Access (PGA)** on the subnet! When PGA is enabled on a subnet covered by Cloud NAT, Cloud NAT automatically bypasses NAT for Google API traffic and sends it free over PGA!'
        ],
        cliCommands: [
          {
            description: 'Configure Cloud NAT with Dynamic Port Allocation and Manual Static IPs for partner allowlisting',
            command: 'gcloud compute routers nats create prod-nat-gw \\\n  --router=prod-router \\\n  --region=us-central1 \\\n  --nat-all-subnet-ip-ranges \\\n  --nat-external-ip-pool=nat-ip-1,nat-ip-2,nat-ip-3 \\\n  --enable-dynamic-port-allocation \\\n  --min-ports-per-vm=128 \\\n  --max-ports-per-vm=4096'
          }
        ]
      }
    ]
  },
  {
    id: 'domain-3',
    number: 3,
    title: 'Configuring Managed Network Services',
    shortTitle: '3. Load Balancing, CDN, Cloud Armor & PSC',
    weight: '23%',
    description:
      'Master Google Cloud’s Load Balancer taxonomy (Global vs. Regional, Proxy vs. Passthrough, Maglev vs. Envoy), Backend NEGs, Cloud CDN caching modes, Cloud Armor WAF, and PSC Service Attachments.',
    color: 'purple',
    concepts: [
      {
        id: 'load-balancer-taxonomy-deep-dive',
        title: 'Complete Google Cloud Load Balancer Architecture & Decision Matrix',
        subtitle: 'Proxy (Envoy/GFE) vs. Passthrough (Maglev/Andromeda), Preserving Client IPs, and Choosing NEGs',
        tags: ['Application LB', 'Passthrough NLB', 'Proxy NLB', 'GFE', 'Envoy', 'Maglev', 'DSR'],
        howItWorks: [
          'Google Cloud Load Balancers are divided into two fundamental architectures:',
          '1. Proxy Load Balancers (Application Load Balancers for HTTP/HTTPS/HTTP2/gRPC & Proxy Network Load Balancers for TCP/SSL): Terminate the client TCP/TLS connection at the load balancer proxy (Google Front End [GFE] at Google’s global PoP edge, or Envoy proxy inside a dedicated Regional Proxy-Only Subnet) and open a BRAND NEW TCP connection to the backend VM/Pod! Because the TCP connection is terminated at the proxy, the backend sees the Proxy/GFE IP as the source packet IP. Client IP is preserved in `X-Forwarded-For` HTTP header (for ALB) or the `PROXY protocol v1/v2` header (for TCP/SSL Proxy NLB).',
          '2. Passthrough Network Load Balancers (External & Internal TCP/UDP NLB): Do NOT terminate TCP/UDP connections! There is NO proxy in the path. Packets are routed directly to backend VMs via Maglev (External) or Andromeda SDN (Internal) using Direct Server Return (DSR). The backend VM receives the packet with the ORIGINAL Client Source IP AND the Load Balancer’s VIP as the Destination IP! Google’s guest agent (`google-guest-agent`) automatically programs a local route/loopback on each backend VM for the Load Balancer VIP so the VM accepts the packet and replies directly.',
          'Regional Envoy-based Load Balancers (Internal ALB, Regional External ALB, Regional Internal/External Proxy NLB, Cross-Region Internal ALB): REQUIRE a dedicated **Proxy-Only Subnet** (`--purpose=REGIONAL_MANAGED_PROXY`, `--role=ACTIVE`, recommended `/23` or `/24`, minimum `/26` = 64 IPs) in each region where the Envoy proxies run!'
        ],
        architectureNotes: [
          'Network Endpoint Groups (NEGs) — Memorize All 6 Types for the Exam:',
          '• `GCE_VM_IP_PORT` (Zonal NEG): Points to specific VM alias IPs / container Pod IPs & ports. Used by GKE Container-Native Load Balancing (`HttpLoadBalancing` addon) so the LB routes directly to Pod IPs without an extra `kube-proxy` `iptables` hop!',
          '• `SERVERLESS` (Serverless NEG): Points to Cloud Run, App Engine, or Cloud Functions (or API Gateway). Allows putting Cloud Armor + Cloud CDN + Custom Domains in front of Cloud Run!',
          '• `INTERNET_IP_PORT` / `INTERNET_FQDN_PORT` (Internet NEG): Points to an external endpoint reachable over the internet (or Google edge). Used to route specific URL paths (e.g., `/legacy/*`) or serve Cloud CDN cache in front of an external origin.',
          '• `NON_GCP_PRIVATE_IP_PORT` (Hybrid Connectivity NEG): Points to an on-premises IP:Port reachable over Cloud VPN or Cloud Interconnect! Allows Global/Regional Application Load Balancers or Proxy NLBs to load balance and migrate traffic between GCP backends and On-Premises servers!',
          '• `PRIVATE_SERVICE_CONNECT` (PSC NEG): Points to a published PSC Service Attachment or regional Google API endpoint.'
        ],
        comparisonTable: {
          title: 'Master Load Balancer Comparison & Exam Selection Matrix',
          headers: ['Load Balancer Type', 'Layer / Protocols', 'Scope & VIP Tier', 'Preserves Client IP?', 'Cloud Armor / CDN Support', 'Primary Exam Use Case'],
          rows: [
            ['Global External Application LB (ALB)', 'L7 (HTTP/HTTPS, HTTP/2, HTTP/3, gRPC, WebSockets)', 'Global Anycast IP (Premium Tier)', 'Via `X-Forwarded-For` header', 'Cloud Armor (Edge & Backend) + Cloud CDN', 'Global web apps, multi-region failover, URL routing, Serverless/Hybrid NEGs'],
            ['Regional External Application LB', 'L7 (HTTP/HTTPS, gRPC)', 'Regional IP (Standard or Premium Tier)', 'Via `X-Forwarded-For` header (Requires Proxy-Only Subnet)', 'Cloud Armor + Cloud CDN (on Global mode)', 'Strict data residency/compliance requiring L7 TLS termination to stay within 1 region'],
            ['Internal Application LB (Regional / Cross-Region)', 'L7 (HTTP/HTTPS, gRPC)', 'Internal RFC 1918 IP (Requires Proxy-Only Subnet)', 'Via `X-Forwarded-For` header', 'No Cloud CDN', 'Internal microservices, gRPC routing, or Hybrid NEG failover to on-premises'],
            ['External Proxy Network LB (TCP/SSL Proxy)', 'L4 Proxied (TCP / SSL)', 'Global (Premium) or Regional', 'Via `PROXY Protocol v1/v2` header', 'Cloud Armor (DDoS & L4 rate limiting)', 'Non-HTTP TCP traffic (MQTT, custom TCP/TLS) needing global anycast IP & SSL offload'],
            ['External Passthrough Network LB', 'L4 Passthrough (TCP, UDP, ESP, GRE, ICMP)', 'Regional IP', 'YES! Native packet Source IP (Direct Server Return)', 'Cloud Armor Advanced Network DDoS Protection', 'UDP gaming/VoIP, IPsec/ESP termination on NVAs, preserving raw client TCP/TLS handshake'],
            ['Internal Passthrough Network LB', 'L4 Passthrough (TCP, UDP, `--ports=all`)', 'Regional Internal IP (Global Access optional)', 'YES! Native packet Source IP', 'N/A (Internal VPC)', 'Next-hop for NVA firewalls (`--next-hop-ilb`), database HA VIPs, Packet Mirroring collectors']
          ]
        },
        examTraps: [
          'TRAP 1: "A financial company requires end-to-end mutual TLS (mTLS) where the backend VM itself must terminate the original client’s TLS handshake AND see the raw client source IP in the IP header." NEVER pick Application Load Balancer or SSL Proxy LB (both terminate TLS at the proxy). Pick **External Passthrough Network Load Balancer**!',
          'TRAP 2: "You deploy an Internal Application Load Balancer in `us-central1`, and creation fails saying no proxy subnet is available." You forgot to create a **Proxy-Only Subnet** (`--purpose=REGIONAL_MANAGED_PROXY --role=ACTIVE`) in `us-central1` AND allow ingress firewall rules from the Proxy-Only Subnet CIDR to the backend VMs!',
          'TRAP 3: "Health Check Firewall Rules are missing, so all backends show UNHEALTHY." Memorize Google’s centralized Health Check prober IP ranges: `35.191.0.0/16` and `130.211.0.0/22`! (For Regional Envoy-based LBs, health checks come from `35.191.0.0/16` AND `130.211.0.0/22`, while the actual proxied client traffic comes from the **Proxy-Only Subnet** CIDR—so your ingress firewall rule must allow BOTH!).'
        ],
        cliCommands: [
          {
            description: 'Create the mandatory Proxy-Only Subnet for Regional Envoy-based Load Balancers',
            command: 'gcloud compute networks subnets create proxy-only-us-central1 \\\n  --purpose=REGIONAL_MANAGED_PROXY \\\n  --role=ACTIVE \\\n  --region=us-central1 \\\n  --network=prod-vpc \\\n  --range=10.129.0.0/23'
          },
          {
            description: 'Create a Firewall Rule allowing Google Health Check Probers (35.191.0.0/16, 130.211.0.0/22)',
            command: 'gcloud compute firewall-rules create allow-lb-health-checks \\\n  --network=prod-vpc \\\n  --action=ALLOW \\\n  --direction=INGRESS \\\n  --source-ranges=35.191.0.0/16,130.211.0.0/22 \\\n  --target-tags=lb-backends \\\n  --rules=tcp:80,tcp:443,tcp:8080'
          }
        ]
      },
      {
        id: 'cloud-cdn-cloud-armor-psc',
        title: 'Cloud CDN, Cloud Armor WAF, and Private Service Connect (PSC) Producer/Consumer',
        subtitle: 'Cache keys, Edge Security Policies, and publishing services with Service Attachments',
        tags: ['Cloud CDN', 'Cloud Armor', 'Cache Modes', 'PSC Service Attachment', 'WAF'],
        howItWorks: [
          'Cloud CDN Cache Modes: (1) `CACHE_ALL_STATIC` (Default — automatically caches static MIME types like CSS/JS/images if the origin doesn’t forbid it with `private`/`no-store`), (2) `USE_ORIGIN_HEADERS` (Strictly requires the origin response to include valid `Cache-Control: public, max-age=...` headers), (3) `FORCE_CACHE_ALL` (Caches ALL successful responses ignoring origin `private`/`no-store` headers—dangerous for personalized content!).',
          'Cloud CDN Cache Key Customization: By default, the cache key is `Full URL (Host + Path + Query String) + Protocol`. If tracking parameters like `?utm_source=ads&fbclid=123` cause a 0% cache hit ratio (cache busting), customize the Cache Key using `--cache-key-include-query-string` (allowlist only meaningful params like `page`) or `--cache-key-query-string-blacklist` (exclude tracking params)!',
          'Cloud Armor Security Policies:',
          '• **Backend Security Policy**: Evaluates traffic AFTER Cloud CDN cache miss (protects backend VMs/GKE/Cloud Run from SQLi, XSS, Log4j via preconfigured WAF rules `evaluatePreconfiguredWaf()`, rate limiting, Adaptive Protection, and Geo/IP blocks).',
          '• **Edge Security Policy**: Evaluates traffic AT THE EDGE BEFORE Cloud CDN serves cached objects or Cloud Storage buckets! Use an Edge Security Policy when you must block a country/IP from even downloading cached CDN assets or signed URLs.',
          'Private Service Connect (PSC) Service Producer Architecture: To publish an internal service to consumers across VPCs/Organizations: (1) Place your backend behind an Internal LB, (2) Create a dedicated **PSC NAT Subnet** (`--purpose=PRIVATE_SERVICE_CONNECT`) in the Producer VPC, (3) Create a **Service Attachment** pointing to the Internal LB forwarding rule and the PSC NAT subnet. Consumer packets arriving from a Consumer PSC Endpoint are SNATed into the Producer’s PSC NAT Subnet so the Producer never cares if the Consumer has overlapping IPs!'
        ],
        architectureNotes: [
          'Cloud CDN Invalidation Rate Limits: Cache invalidations are intended for emergency purging, not routine deployments! Best practice for deploying new static assets (`app.js`, `styles.css`) is **versioned URLs / content hashing** (e.g., `app.v2.8f91a.js`) so new files are fetched immediately without invalidation costs or delays.',
          'PSC Proxy Protocol: Because the Producer’s Service Attachment SNATs consumer traffic using the Producer’s PSC NAT subnet, the Producer backend normally sees the PSC NAT subnet IP instead of the Consumer’s IP. If the Producer needs to know which Consumer VPC (`pscConnectionId`) or Consumer IP connected, enable `--enable-proxy-protocol` on the Service Attachment (requires an Envoy-based Internal LB or Proxy Protocol-capable backend).'
        ],
        comparisonTable: {
          title: 'Cloud CDN & Cloud Armor Exam Scenarios',
          headers: ['Scenario Requirement', 'Wrong Choice (Distractor)', 'Correct PCNE Solution'],
          rows: [
            ['Block embargoed countries from accessing objects already cached in Cloud CDN', 'Backend Security Policy (Only runs on cache MISS!)', 'Cloud Armor **Edge Security Policy** attached to the backend service / bucket'],
            ['Marketing URLs with `?gclid=...&utm_campaign=...` cause high backend load & low CDN hit rate', 'Switch cache mode to `FORCE_CACHE_ALL`', 'Configure Custom **Cache Key** to exclude (`blacklist`) `gclid`/`utm_*` query parameters'],
            ['Protect private video streams served from Cloud Storage via Cloud CDN to authenticated users only', 'Enable IAM `allAuthenticatedUsers` on the bucket', 'Configure Cloud CDN **Signed URLs or Signed Cookies** (prefer Signed Cookies when streaming hundreds of HLS/DASH video segments!)'],
            ['Publish a SaaS database/API to 50 external enterprise customers who all use `10.0.0.0/8`', 'VPC Network Peering or Shared VPC', 'Publish a **Private Service Connect (PSC) Service Attachment** with a Producer PSC NAT subnet']
          ]
        },
        examTraps: [
          'TRAP 1: "A media streaming platform serves HLS video streams consisting of 500 small `.ts` segment files per video via Cloud CDN. Should you use Signed URLs or Signed Cookies?" Pick **Signed Cookies**! Signed URLs require signing every single URL separately (painful when a manifest references hundreds of segments), whereas a single Signed Cookie grants time-limited access to a URL prefix for all segments.',
          'TRAP 2: "Producer Service Attachment starts dropping new connections from Consumers." Check the size of the Producer’s `--purpose=PRIVATE_SERVICE_CONNECT` NAT subnet! Each connected PSC endpoint consumes NAT IPs/ports from that subnet; you can attach additional PSC NAT subnets to the Service Attachment without downtime.'
        ],
        cliCommands: [
          {
            description: 'Create a Producer PSC NAT Subnet and publish a Service Attachment',
            command: 'gcloud compute networks subnets create psc-nat-subnet \\\n  --network=producer-vpc \\\n  --region=us-central1 \\\n  --range=10.200.0.0/24 \\\n  --purpose=PRIVATE_SERVICE_CONNECT &&\ngcloud compute service-attachments create my-saas-attachment \\\n  --region=us-central1 \\\n  --producer-forwarding-rule=producer-ilb-rule \\\n  --connection-preference=ACCEPT_AUTOMATIC \\\n  --nat-subnets=psc-nat-subnet'
          }
        ]
      }
    ]
  },
  {
    id: 'domain-4',
    number: 4,
    title: 'Configuring and Implementing Hybrid and Multi-Cloud Interconnect',
    shortTitle: '4. Hybrid Interconnect, HA VPN & BGP',
    weight: '16%',
    description:
      'Master Dedicated & Partner Interconnect 99.9% vs. 99.99% SLA topologies, HA VPN active/active & active/passive BGP, Global Dynamic Routing MED penalties, BFD, and MACsec.',
    color: 'amber',
    concepts: [
      {
        id: 'interconnect-ha-vpn-sla-topologies',
        title: 'Dedicated Interconnect, Partner Interconnect & HA VPN: 99.9% vs. 99.99% SLA Rules',
        subtitle: 'The exact connection counts, metro placement, and Edge Availability Domains required for SLAs',
        tags: ['Dedicated Interconnect', 'Partner Interconnect', 'HA VPN', '99.99% SLA', 'Edge Availability Domains'],
        howItWorks: [
          'Dedicated Interconnect: Direct physical fiber cross-connect inside a shared Colocation facility between your router and Google’s peering edge. Port speeds: **10 Gbps** (up to 8 x 10G link bundle = 80 Gbps) or **100 Gbps** (up to 2 x 100G link bundle = 200 Gbps). Maximum bandwidth per single VLAN attachment = **50 Gbps** (recently expanded to 100 Gbps for specific high-capacity attachments, though 50 Gbps per attachment is standard exam baseline). Uses 802.1Q VLAN tagging + LACP.',
          'Partner Interconnect: Connects your on-premises network to Google Cloud through a supported Service Provider when you are NOT in a Google colocation facility OR need sub-10G bandwidth (**50 Mbps to 50 Gbps**). Layer 2 partners pass VLAN tags end-to-end (you configure BGP directly with Google’s Cloud Router); Layer 3 partners terminate BGP on the partner router.',
          'HA VPN (High Availability Cloud VPN): Regional IPsec VPN gateway with **two independent external IP interfaces (`Interface 0` and `Interface 1`)** drawn from completely separate physical Google network fabrics. Requires dynamic routing via Cloud Router (BGP). Maximum throughput per single IPsec tunnel is **3 Gbps** (or ~250,000 packets per second); scale horizontally by creating multiple ECMP tunnels across Cloud Router!',
          'HA VPN over Cloud Interconnect (Encrypted Interconnect): Deploys HA VPN tunnels directly on top of Dedicated or Partner Interconnect VLAN attachments (`--interconnect-attachment`) to provide FIPS 140-2 compliant IPsec encryption over Interconnect!'
        ],
        architectureNotes: [
          'MEMORIZE THE 99.99% vs. 99.9% SLA TOPOLOGY RULES (Tested on almost every PCNE exam!):',
          '1. **Dedicated Interconnect 99.99% SLA**: Requires at least **4 physical connections** across **2 DIFFERENT Metropolitan Areas (Metros)** (2 connections in Metro A in Edge Availability Domain 1 & Domain 2 + 2 connections in Metro B in Edge Availability Domain 1 & Domain 2), connected to **2 GCP Regions** (4 VLAN attachments total) with **Global Dynamic Routing** enabled on the VPC!',
          '2. **Dedicated Interconnect 99.9% SLA**: Requires **2 physical connections** in the **SAME Metro** placed in **different Edge Availability Domains (Domain 1 and Domain 2)** connected to a single GCP Region.',
          '3. **Partner Interconnect 99.99% SLA**: Requires **4 VLAN attachments** across **2 DIFFERENT Metros** (Domain 1 & Domain 2 in Metro A + Domain 1 & Domain 2 in Metro B) connected to **2 GCP Regions** with Global Dynamic Routing enabled.',
          '4. **Partner Interconnect 99.9% SLA**: Requires **2 VLAN attachments** in the **SAME Metro** in **different Edge Availability Domains (Domain 1 and Domain 2)**.',
          '5. **HA VPN 99.99% SLA**: Both `Interface 0` AND `Interface 1` of the GCP HA VPN Gateway MUST have active tunnels! Specifically: (A) **2 Tunnels** if connecting to TWO separate on-premises VPN devices (`Int 0 -> Peer Device A`, `Int 1 -> Peer Device B`), (B) **4 Tunnels** (Full Mesh) if connecting to a single on-premises VPN device with two interfaces (`Int 0 -> Peer 0, Int 0 -> Peer 1, Int 1 -> Peer 0, Int 1 -> Peer 1`), or (C) **2 Tunnels** when connecting GCP-to-GCP or GCP-to-AWS HA VPN (`Int 0 -> Peer 0, Int 1 -> Peer 1`). Note: If you connect only 1 tunnel or leave `Interface 1` unused, you get **ZERO SLA**!'
        ],
        comparisonTable: {
          title: 'Hybrid Connectivity SLA & Capacity Reference',
          headers: ['Service', 'Bandwidth Range', '99.9% SLA Topology', '99.99% SLA Topology', 'Encryption Option'],
          rows: [
            ['Dedicated Interconnect', '10 Gbps or 100 Gbps physical ports', '2 connections in 1 Metro (Domain 1 + Domain 2)', '4 connections across 2 Metros (2 per Metro in Domain 1 & 2) + 2 GCP Regions + Global Routing', 'MACsec (L2 link encryption) or HA VPN over Interconnect (L3 IPsec)'],
            ['Partner Interconnect', '50 Mbps to 50 Gbps per VLAN attachment', '2 VLAN attachments in 1 Metro (Domain 1 + Domain 2)', '4 VLAN attachments across 2 Metros (Domain 1 & 2) + 2 GCP Regions + Global Routing', 'HA VPN over Interconnect (MACsec is NOT directly user-managed on Partner links)'],
            ['HA VPN', 'Up to 3 Gbps per tunnel (scale with ECMP)', 'Not applicable (HA VPN offers 99.99% when both interfaces are used)', '2 tunnels (to 2 peer gateways) OR 4 tunnels (full mesh to 2-interface gateway) using BOTH Interface 0 & 1', 'Native IPsec (IKEv2 recommended; AES-GCM)'],
            ['Classic VPN (Deprecated)', '1.5 - 3 Gbps', '99.9% SLA (Single interface)', 'Cannot achieve 99.99% SLA', 'Native IPsec (Policy-based or Route-based)']
          ]
        },
        examTraps: [
          'TRAP 1: "A company orders 4 Dedicated Interconnect connections in the Chicago metro (2 in Edge Availability Domain 1, 2 in Edge Availability Domain 2) and connects them to `us-central1` and `us-east4`. Does this meet the 99.99% SLA?" NO! Even with 4 connections and 2 GCP regions, if all 4 physical connections are in the **SAME Metro (Chicago)**, a metro-wide disaster takes all 4 down—so it only achieves **99.9% SLA**! For 99.99%, the connections MUST span **2 distinct Metros** (e.g., 2 in Chicago + 2 in Ashburn/Dallas).',
          'TRAP 2: "A company wants Layer 2 hardware encryption on Dedicated Interconnect without the 3 Gbps per-tunnel bottleneck of IPsec VPN." Pick **MACsec for Cloud Interconnect** (802.1AE line-rate Layer 2 encryption on 10G/100G Dedicated Interconnect links)! If the scenario uses *Partner* Interconnect and requires IPsec encryption, pick **HA VPN over Cloud Interconnect**.'
        ],
        cliCommands: [
          {
            description: 'Create a VLAN attachment for Dedicated Interconnect paired with a Cloud Router',
            command: 'gcloud compute interconnects attachments dedicated create vlan-attach-metro1-dom1 \\\n  --region=us-central1 \\\n  --router=cr-us-central1 \\\n  --interconnect=my-dedicated-ic-1 \\\n  --bandwidth=BPS_10G'
          }
        ]
      },
      {
        id: 'bgp-cloud-router-asymmetric-routing',
        title: 'Cloud Router BGP Deep Dive: MED, AS-Path Prepending, Global Dynamic Routing & BFD',
        subtitle: 'Solving Asymmetric Routing across multi-region Interconnects and HA VPN failover',
        tags: ['BGP', 'MED', 'AS-Path Prepending', 'Global Dynamic Routing', 'BFD', 'Asymmetric Routing'],
        howItWorks: [
          'Cloud Router Dynamic Routing Mode (VPC-level setting):',
          '• **Regional Dynamic Routing**: Cloud Router ONLY advertises subnets in its OWN region to on-premises, and ONLY programs learned on-premises BGP routes for VMs in its OWN region.',
          '• **Global Dynamic Routing**: Cloud Router advertises ALL subnets across ALL regions of the VPC, and programs learned on-premises routes for VMs across ALL regions of the VPC!',
          'HOW GLOBAL DYNAMIC ROUTING CALCULATES EFFECTIVE PRIORITY (The Asymmetric Routing Trap!):',
          'When On-Premises advertises a prefix (e.g., `172.16.0.0/16`) to Cloud Router in `us-west1` with `MED 100` AND to Cloud Router in `us-east1` with `MED 500`:',
          '• A VM in `us-west1` sees the local `us-west1` route with priority `100` (local MED 100) and the remote `us-east1` route with priority `500 + Inter-Region Cost (e.g. 250) = 750`. It picks `us-west1`.',
          '• What about a VM in `us-east1`? Because `us-west1` is in a REMOTE region, GCP adds an automatic **Region-to-Region Penalty Cost (201 to 9999)** to routes learned from another region! However, if your MED difference is larger than the inter-region cost—OR if On-Premises sends traffic into `us-east1` (via AS-Path/LocalPref) while GCP returns traffic via `us-west1` (via lower MED)—you get **Asymmetric Routing**, causing stateful on-premises firewalls to DROP packets (TCP SYN-ACK dropped)!',
          'How to Guarantee Symmetric Active/Passive Routing between GCP and On-Premises:',
          '1. For **GCP -> On-Premises (Egress from GCP)**: Cloud Router sets the **Base Priority / Advertised MED** received from On-Premises (or you configure higher MED on the passive BGP session). Remember: Within a single region, a lower MED wins (`MED 50` beats `MED 100`). Across regions in Global Dynamic Routing, to force a remote region’s tunnel to win over a local region’s backup tunnel, the local backup tunnel’s MED must be set higher than `Primary MED + Inter-Region Cost` (e.g., set backup MED to `5000` or use **AS-Path Prepending** from on-prem!).',
          '2. For **On-Premises -> GCP (Ingress to GCP)**: Cloud Router advertises GCP subnets to On-Premises using **Advertised Route Priority (MED)** or **AS-Path Prepending**. Beware: Some on-premises routers ignore MED if the two Cloud Routers use different ASNs (though in a single VPC it is recommended to use the same ASN like `65001` or `16550` for Partner Interconnect). If on-prem ignores MED, configure **AS-Path Prepending** or `Local Preference` on the on-premises router!'
        ],
        architectureNotes: [
          'Bidirectional Forwarding Detection (BFD): Standard BGP keepalive/hold timers default to `20s keepalive / 60s hold time` on Cloud Router—meaning a link failure where optical light stays up (e.g., L2 provider blackhole) can take 60 seconds to fail over! Enabling **BFD** on the Cloud Router BGP peer (`--bfd-session-initialization-mode=ACTIVE`, min transmit/receive interval `1000ms`, multiplier `5`) reduces failover detection to **~5 seconds**!',
          'Cloud Router ASN Requirements:',
          '• Partner Interconnect Layer 3: You MUST configure your Cloud Router with Google’s public ASN **`16550`**.',
          '• Dedicated Interconnect / HA VPN / Partner Layer 2: Use any private ASN (`64512–65534` or 32-bit `4200000000–4294967294`) not already used by the peer.'
        ],
        comparisonTable: {
          title: 'BGP Attributes & Timers on Google Cloud Router',
          headers: ['Mechanism', 'Controls Traffic Direction', 'How It Works in GCP', 'Exam Best Practice'],
          rows: [
            ['Cloud Router Advertised Route Priority (Outbound MED)', 'On-Prem -> GCP (Ingress to GCP)', 'Cloud Router sets the BGP `MED` attribute on prefixes advertised to the on-prem peer (Lower value = preferred)', 'Set Primary tunnel advertised priority = `100`, Secondary = `200` (Ensure both Cloud Routers share the same ASN so on-prem compares MED!)'],
            ['On-Prem Advertised MED / Learned Route Priority', 'GCP -> On-Prem (Egress from GCP)', 'Cloud Router converts learned BGP MED into VPC route priority', 'In Global Dynamic Routing, remember GCP adds `201+` inter-region cost to remote-region routes; set passive tunnel MED very high (e.g., `2000`) if you want cross-region failover over local backup'],
            ['AS-Path Prepending', 'Both directions (Evaluated BEFORE MED!)', 'Artificially lengthens the BGP AS-Path (e.g. `65001 65001 65001`) on the passive link', 'Use when primary and backup links have different ASNs or when you want passive backup to lose regardless of MED / inter-region cost'],
            ['BFD (Bidirectional Forwarding Detection)', 'Sub-second / 5-second Failure Detection', 'Lightweight UDP echo/control packets independent of BGP keepalives (60s hold timer)', 'Enable BFD + BGP Graceful Restart whenever the exam asks to minimize failover downtime during maintenance or unplanned link cuts']
          ]
        },
        examTraps: [
          'TRAP 1: "A company has Dedicated Interconnect in `us-east1` (Primary) and HA VPN in `us-west1` (Backup) in a VPC with Global Dynamic Routing. On-prem advertises `10.0.0.0/8` with MED 100 on Interconnect (`us-east1`) and MED 200 on HA VPN (`us-west1`). Yet VMs in `us-west1` are still sending traffic over the Backup HA VPN!" WHY? Because for a VM in `us-west1`, the local HA VPN route has priority `200`, whereas the remote `us-east1` Interconnect route has priority `100 + Inter-Region Penalty (say 250) = 350`! Since `200 < 350`, `us-west1` VMs prefer their local backup HA VPN! Fix: Either increase the backup HA VPN MED to `1000+` (so `1000 > 350`), OR have On-Premises use **AS-Path Prepending** on the `us-west1` HA VPN BGP session!',
          'TRAP 2: "On-premises firewall drops return TCP packets from GCP VMs (`TCP state violation`)." Classic symptom of **Asymmetric Routing**—traffic enters GCP via Interconnect Tunnel A, and exits GCP via Tunnel B because BGP MED (outbound from GCP) does not match Local Preference/MED (inbound to GCP). Align BGP MEDs and AS-Paths symmetrically in both directions.'
        ],
        cliCommands: [
          {
            description: 'Enable BFD and Custom Advertised Priority (MED) on a Cloud Router BGP Peer',
            command: 'gcloud compute routers update-bgp-peer cr-us-central1 \\\n  --peer-name=onprem-peer-primary \\\n  --region=us-central1 \\\n  --advertised-route-priority=100 \\\n  --bfd-session-initialization-mode=ACTIVE \\\n  --bfd-min-receive-interval=1000 \\\n  --bfd-min-transmit-interval=1000 \\\n  --bfd-multiplier=5'
          }
        ]
      }
    ]
  },
  {
    id: 'domain-5',
    number: 5,
    title: 'Managing, Monitoring, and Optimizing Network Operations',
    shortTitle: '5. Security, Firewalls, GKE & Monitoring',
    weight: '14%',
    description:
      'Master Hierarchical & Network Firewall Policy evaluation (`goto_next`), IAM Secure Tags, Cloud IDS & Packet Mirroring, VPC Flow Logs, Network Intelligence Center, and GKE Dataplane V2.',
    color: 'rose',
    concepts: [
      {
        id: 'firewall-hierarchy-tags-deep-dive',
        title: 'Hierarchical Firewall Policies, Network Firewall Policies & IAM Secure Tags',
        subtitle: 'Understanding `goto_next` delegation, evaluation order, FQDN/Geo rules, and Tags vs. Service Accounts',
        tags: ['Hierarchical Firewalls', 'goto_next', 'Secure Tags', 'VPC Firewalls', 'FQDN Filtering'],
        howItWorks: [
          'Google Cloud evaluates firewall rules across three layers in a strict Default Evaluation Order:',
          '1. **Hierarchical Firewall Policies (Organization Level, then Folder Level top-down)**: Evaluated first across all VPCs under the Org/Folder.',
          '2. **Global / Regional Network Firewall Policies**: Attached to a specific VPC network. Supports advanced Layer 7 / Threat Intelligence features: **FQDN objects** (e.g., `api.stripe.com`), **Geolocation objects** (ISO country codes), **Google Threat Intelligence lists** (known malicious IPs, Tor exit nodes), and **IAM-governed Secure Tags**!',
          '3. **Classic VPC Firewall Rules**: Traditional rules scoped via Network Tags, Service Accounts, or IP ranges.',
          'HOW `goto_next` WORKS (Crucial Exam Concept!):',
          'At any policy layer (Org or Folder), a rule has 3 possible actions: `ALLOW` (immediately permits the packet and STOPS all lower-level evaluation!), `DENY` (immediately drops the packet and STOPS all lower-level evaluation!), or `goto_next` (explicitly delegates evaluation of matching traffic down to the next lower level in the hierarchy!). If no rule at the Org level matches a packet, it implicitly behaves as `goto_next` and moves to Folder -> VPC Network Policy -> Classic VPC Firewall Rules -> Implied Deny Ingress / Implied Allow Egress.'
        ],
        architectureNotes: [
          'Network Tags vs. Service Accounts vs. IAM Secure Tags:',
          '• **Classic Network Tags**: Any user with `compute.instances.setTags` (or Instance Admin) on a VM can arbitrarily add/remove Network Tags on their VM without Network Admin approval! Unsafe for strict security boundaries.',
          '• **Service Accounts**: Bound to a VM via IAM, but a VM can only have **ONE** Service Account, and changing a Service Account requires stopping the VM, plus Service Accounts cannot be used simultaneously with Network Tags in the same firewall rule.',
          '• **IAM Secure Tags (Resource Manager Tags)**: The modern gold standard! Governed by Organization IAM (`roles/resourcemanager.tagUser`). A VM can have multiple Secure Tags, they can be attached to VMs dynamically, they work across VPC Peering (in Network Firewall Policies), and a VM owner CANNOT spoof a tag without explicit IAM TagUser permission!',
          ' note: You can ALSO change a VPC’s `networkFirewallPolicyEnforcementOrder` to `BEFORE_CLASSIC_FIREWALL` (default) or `AFTER_CLASSIC_FIREWALL` if migrating legacy rules.'
        ],
        comparisonTable: {
          title: 'Firewall Target Mechanisms Comparison',
          headers: ['Feature', 'Classic Network Tags', 'Target Service Accounts', 'IAM Secure Tags (Network Firewall Policies)'],
          rows: [
            ['IAM Access Control to Attach Tag to VM?', 'No! Anyone who can edit the VM can add any Network Tag', 'Yes (`iam.serviceAccounts.actAs`)', 'Yes! Strictly governed by `resourcemanager.tagUser` IAM role'],
            ['Multiple Identifiers per VM?', 'Yes (Up to 64 tags per VM)', 'No! Only 1 Service Account per VM', 'Yes! Multiple key-value tags per VM'],
            ['Works Across VPC Network Peering?', 'No! Network tags are NOT propagated across VPC Peering', 'No! Service Accounts do NOT work across VPC Peering', 'Yes (Supported within Global Network Firewall Policies)'],
            ['Supports Hierarchical / Network Firewall Policies?', 'No! Classic VPC Firewall Rules only', 'Yes (Classic & Network Firewall Policies)', 'Yes! Designed specifically for Network Firewall Policies']
          ]
        },
        examTraps: [
          'TRAP 1: "The Organization Security Admin wants to block SSH (`tcp:22`) from the public internet (`0.0.0.0/0`) across ALL projects, EXCEPT allowing Google Identity-Aware Proxy (`35.235.240.0/20`) so project teams can decide which VMs accept IAP SSH." If the Org Admin creates an Org rule `ALLOW tcp:22 from 35.235.240.0/20`, that immediately ALLOWS SSH to EVERY VM in the entire organization, bypassing VPC firewall rules! Instead, the Org Admin MUST set the rule for `35.235.240.0/20` (priority `1000`) to action **`goto_next`**, and a second rule for `0.0.0.0/0` (priority `1001`) to action **`DENY`**! That blocks internet SSH while delegating IAP SSH (`35.235.240.0/20`) down to each VPC’s local firewall rules!',
          'TRAP 2: "Developers in a Shared VPC Service Project have `Compute Instance Admin` and keep adding the `prod-db-client` network tag to their test VMs to bypass firewall restrictions." Replace Classic Network Tags with **IAM-governed Secure Tags** in a Network Firewall Policy (or Target Service Accounts) so developers cannot self-assign the tag!'
        ],
        cliCommands: [
          {
            description: 'Create an Organization Hierarchical Firewall rule using goto_next for IAP (35.235.240.0/20) and denying all other public SSH',
            command: 'gcloud compute firewall-policies rules create 1000 \\\n  --firewall-policy=org-sec-policy \\\n  --organization=123456789 \\\n  --action=goto_next \\\n  --direction=INGRESS \\\n  --src-ip-ranges=35.235.240.0/20 \\\n  --layer4-configs=tcp:22 &&\ngcloud compute firewall-policies rules create 1001 \\\n  --firewall-policy=org-sec-policy \\\n  --organization=123456789 \\\n  --action=deny \\\n  --direction=INGRESS \\\n  --src-ip-ranges=0.0.0.0/0 \\\n  --layer4-configs=tcp:22'
          }
        ]
      },
      {
        id: 'observability-packet-mirroring-flow-logs-nic',
        title: 'VPC Flow Logs, Packet Mirroring, Cloud IDS, and Network Intelligence Center',
        subtitle: 'Where logs are captured relative to firewalls, out-of-band deep packet inspection, and diagnostics',
        tags: ['VPC Flow Logs', 'Packet Mirroring', 'Cloud IDS', 'Connectivity Tests', 'Firewall Insights'],
        howItWorks: [
          'VPC Flow Logs: Enabled at the **SUBNET** level (or for Interconnect VLAN attachments / VPN tunnels). Captures sampled 5-tuple network flow telemetry (NO packet payloads!) directly from Andromeda SDN at the VM vNIC.',
          'CRITICAL EXAM RULE — VPC Flow Logs vs. Firewall Rules Interaction:',
          '• For **INGRESS** traffic: Firewall rules are evaluated **BEFORE** VPC Flow Logs! Therefore, if an Ingress Firewall Rule **BLOCKS/DENIES** an incoming packet, that packet **NEVER** appears in VPC Flow Logs (you must enable **Firewall Rules Logging** to see blocked ingress packets!).',
          '• For **EGRESS** traffic: VPC Flow Logs capture the packet **BEFORE** Egress Firewall Rules are evaluated! (Still, always enable Firewall Rules Logging on deny rules to troubleshoot blocked connections).',
          'Packet Mirroring: Clones full packet headers AND payloads (Ingress, Egress, or Both) from specified **Mirrored Sources** (Subnets, Network Tags, or Individual VMs) and encapsulates/forwards them to a **Collector Destination**—which MUST be an **Internal Passthrough Network Load Balancer** created with `--is-mirroring-collector`! Because Packet Mirroring clones traffic on the VM’s host hypervisor, it consumes additional egress bandwidth from the monitored VM!',
          'Cloud IDS (Intrusion Detection System): Google-managed out-of-band threat detection powered by Palo Alto Networks Threat Prevention engine. Uses GCP Packet Mirroring and Private Services Access (`servicenetworking-googleapis-com`) under the hood so you don’t have to manage collector NVA VMs or ILBs manually!'
        ],
        architectureNotes: [
          'Cost Optimization for VPC Flow Logs (Frequently Tested!): If VPC Flow Logs generate excessive Cloud Logging ingestion costs:',
          '1. Reduce the `--logging-flow-sampling` rate (default `0.5` = 50% of flows; lower to `0.1`).',
          '2. Increase the `--logging-aggregation-interval` from `INTERVAL_5_SEC` (default) to `INTERVAL_30_SEC`, `INTERVAL_1_MIN`, or `INTERVAL_15_MIN`.',
          '3. Set `--logging-metadata=EXCLUDE_ALL_METADATA` (or `CUSTOM_METADATA`).',
          '4. Use `--logging-filter-expr` (CEL filter expression, e.g., only log external traffic or specific ports) or Cloud Logging exclusion filters.',
          'Network Intelligence Center Modules (5 Modules):',
          '• **Network Topology**: Visual graph of VPCs, regions, GKE clusters, Load Balancers, and ऑन-prem throughput/packet loss metrics.',
          '• **Connectivity Tests**: Proactive control-plane configuration analysis + live data-plane probing to trace exact hop-by-hop routing & firewall hits between source and destination (even when traffic is blocked!).',
          '• **Performance Dashboard**: Displays real-time packet loss and latency across GCP zones and between GCP and the internet.',
          '• **Firewall Insights**: Identifies **Shadowed firewall rules** (rules unreachable because a higher-priority rule already matches a superset), **Overly permissive rules** (unused ports/IPs in `0.0.0.0/0`), and rules with zero hits.',
          '• **Network Analyzer**: Automatically detects misconfigurations like GKE IP exhaustion, invalid next hops, PSA peering missing routes, or unhealthy load balancer backends.'
        ],
        comparisonTable: {
          title: 'Network Observability Tool Selection Guide',
          headers: ['Tool', 'Captures Payload (L7)?', 'Captures Blocked Ingress Packets?', 'Primary Exam Use Case'],
          rows: [
            ['VPC Flow Logs', 'No (Headers & 5-tuple metadata only)', 'No! Ingress drops happen BEFORE VPC Flow Logs', 'Capacity planning, auditing allowed flows, tracking inter-zone/egress bandwidth per VM'],
            ['Firewall Rules Logging', 'No (Connection metadata + matched rule ID)', 'YES! Logs both Allowed and Denied connections', 'Auditing security incidents, debugging why a VM connection is blocked by a firewall rule'],
            ['Packet Mirroring', 'YES! Full PCAP payload & headers', 'Same point as vNIC (post-ingress firewall)', 'Feeding custom IDS/IPS appliances (Suricata/Zeek) behind a `--is-mirroring-collector` Internal NLB'],
            ['Cloud IDS', 'YES! Managed L7 signature & anomaly inspection', 'Mirrors allowed traffic via Packet Mirroring', 'Detecting malware, command-and-control (C2), and lateral movement without managing IDS VMs'],
            ['Connectivity Tests', 'Synthetic configuration & data-plane trace', 'YES! Pinpoints the exact firewall rule or missing route blocking a path', 'Troubleshooting complex multi-hop hybrid/peered/Shared VPC connectivity failures']
          ]
        },
        examTraps: [
          'TRAP 1: "A security analyst enables VPC Flow Logs on a subnet to investigate brute-force SSH attempts that are being blocked by an Ingress Deny firewall rule, but sees zero entries in VPC Flow Logs." WHY? Ingress Firewall Rules are enforced **BEFORE** VPC Flow Logs! To see blocked packets, you MUST enable **Firewall Rules Logging** (`--enable-logging`) on the firewall rule!',
          'TRAP 2: "You want to deploy Packet Mirroring where monitored VMs are in Spoke VPC A and the Collector Internal Passthrough NLB is in Security Hub VPC B." Supported via VPC Peering ONLY if both VPCs are peered (or in the same Shared VPC) and reside in the **SAME region**!'
        ],
        cliCommands: [
          {
            description: 'Optimize VPC Flow Logs to reduce Cloud Logging volume and cost',
            command: 'gcloud compute networks subnets update prod-subnet \\\n  --region=us-central1 \\\n  --enable-flow-logs \\\n  --logging-aggregation-interval=INTERVAL_5_MIN \\\n  --logging-flow-sampling=0.1 \\\n  --logging-metadata=EXCLUDE_ALL_METADATA \\\n  --logging-filter-expr="dest_port == 443"'
          },
          {
            description: 'Create a Collector Forwarding Rule and Packet Mirroring Policy',
            command: 'gcloud compute forwarding-rules create ids-collector-ilb \\\n  --region=us-central1 \\\n  --load-balancing-scheme=INTERNAL \\\n  --network=sec-vpc \\\n  --subnet=sec-subnet \\\n  --backend-service=ids-backend-svc \\\n  --ip-protocol=TCP \\\n  --ports=all \\\n  --is-mirroring-collector &&\ngcloud compute packet-mirrorings create mirror-prod-web \\\n  --region=us-central1 \\\n  --network=sec-vpc \\\n  --collector-ilb=ids-collector-ilb \\\n  --mirrored-subnets=prod-web-subnet \\\n  --filter-protocols=tcp'
          }
        ]
      }
    ]
  }
];
