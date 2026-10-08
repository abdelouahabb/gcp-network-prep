import { ExamQuestion } from '../types';

export const EXAM_QUESTIONS: ExamQuestion[] = [
  // ================= DOMAIN 1: DESIGNING, PLANNING, AND PROTOTYPING A GCP NETWORK =================
  {
    id: 'pcne-q1',
    domainId: 'domain-1',
    topic: 'VPC Service Controls & Private Google Access',
    difficulty: 'Hard',
    question:
      'Your security team has enforced a VPC Service Controls (VPC-SC) perimeter around your production project containing sensitive healthcare data in Cloud Storage and BigQuery. Compute Engine VMs in `prod-vpc` do not have external IP addresses. You have removed the default `0.0.0.0/0` internet route from `prod-vpc` to prevent unauthorized internet egress. You need to allow these VMs to privately access Cloud Storage and BigQuery while ensuring that any attempt to call Google APIs that are not supported by VPC Service Controls is blocked at the network layer. Which two actions should you take? (Choose two.)',
    isMultiSelect: true,
    selectCount: 2,
    options: [
      {
        id: 'A',
        text: 'Enable Private Google Access on the VM subnets, create a Cloud DNS private zone for `googleapis.com` with a CNAME to `restricted.googleapis.com`, and add an `A` record for `restricted.googleapis.com` pointing to `199.36.153.4, 199.36.153.5, 199.36.153.6, 199.36.153.7`.',
        whyRightOrWrong:
          'CORRECT. `restricted.googleapis.com` (`199.36.153.4/30`) only exposes Google APIs that comply with VPC Service Controls, blocking non-compliant APIs from being used as a data exfiltration vector.'
      },
      {
        id: 'B',
        text: 'Enable Private Google Access on the VM subnets, create a Cloud DNS private zone for `googleapis.com` with a CNAME to `private.googleapis.com`, and add an `A` record for `private.googleapis.com` pointing to `199.36.153.8, 199.36.153.9, 199.36.153.10, 199.36.153.11`.',
        whyRightOrWrong:
          'INCORRECT. `private.googleapis.com` (`199.36.153.8/30`) allows access to ALL Google APIs, including those that do not support VPC Service Controls.'
      },
      {
        id: 'C',
        text: 'Create a custom static route in `prod-vpc` with destination `199.36.153.4/30` and next hop set to `default-internet-gateway`, and ensure an egress firewall rule allows TCP port 443 to `199.36.153.4/30`.',
        whyRightOrWrong:
          'CORRECT. Because the default `0.0.0.0/0` route to `default-internet-gateway` was deleted, traffic to `199.36.153.4/30` will be dropped unless you add an explicit route for `199.36.153.4/30` whose next hop is `default-internet-gateway`.'
      },
      {
        id: 'D',
        text: 'Deploy a Cloud NAT gateway in `prod-vpc` and configure a static route for `199.36.153.4/30` with the Cloud Router as the next hop.',
        whyRightOrWrong:
          'INCORRECT. Private Google Access does not require Cloud NAT, and `199.36.153.4/30` within a VPC must use `default-internet-gateway` as its next hop (even though traffic stays entirely on Google’s internal backbone).'
      },
      {
        id: 'E',
        text: 'Enable Private Services Access by allocating an internal `/16` IP range and peering `prod-vpc` with `servicenetworking-googleapis-com`.',
        whyRightOrWrong:
          'INCORRECT. Private Services Access (`servicenetworking-googleapis-com`) is used for Google-managed tenant VPC services like Cloud SQL and Memorystore, not for Cloud Storage or BigQuery APIs.'
      }
    ],
    correctAnswers: ['A', 'C'],
    coreExplanation:
      'When using VPC Service Controls (VPC-SC), you must route Google API traffic to `restricted.googleapis.com` (`199.36.153.4/30`) or a Private Service Connect endpoint using the `vpc-sc` bundle. Furthermore, even though Private Google Access never traverses the public internet, Andromeda SDN requires a valid route whose next hop is `default-internet-gateway` to reach the `199.36.153.4/30` VIPs.',
    examTrapAlert:
      'Deleting the default `0.0.0.0/0` route breaks Private Google Access unless you explicitly add a `/30` route (`199.36.153.4/30` or `199.36.153.8/30`) pointing to `default-internet-gateway`!',
    keyTakeaway:
      '`restricted.googleapis.com` = `199.36.153.4/30` (VPC-SC enforced). `private.googleapis.com` = `199.36.153.8/30` (all Google APIs). Both require `next-hop-gateway=default-internet-gateway`.'
  },
  {
    id: 'pcne-q2',
    domainId: 'domain-1',
    topic: 'Cloud DNS Hybrid Forwarding & Source IPs',
    difficulty: 'Hard',
    question:
      'You have established an HA VPN connection between your `hub-vpc` in Google Cloud and your on-premises data center. You want Compute Engine VMs in `hub-vpc` to resolve hostnames in the `internal.corp.example.com` zone hosted on your on-premises DNS servers (`172.16.10.53` and `172.16.10.54`). You create a Cloud DNS private forwarding zone for `internal.corp.example.com` pointing to those two IP addresses. From a VM in `hub-vpc`, running `dig @172.16.10.53 db.internal.corp.example.com` succeeds immediately, but running `nslookup db.internal.corp.example.com` (using the default VM DNS resolver) times out. What is the most likely cause?',
    options: [
      {
        id: 'A',
        text: 'You have not enabled an Inbound DNS Server Policy on `hub-vpc`.',
        whyRightOrWrong:
          'INCORRECT. An Inbound Server Policy is only required when on-premises hosts need to resolve Cloud DNS private zones in GCP, not when GCP VMs forward queries to on-premises.'
      },
      {
        id: 'B',
        text: 'Cloud Router in `hub-vpc` is not advertising `35.199.192.0/19` to on-premises over BGP, or the on-premises firewall is blocking `35.199.192.0/19`.',
        whyRightOrWrong:
          'CORRECT. Direct `dig @172.16.10.53` originates from the VM’s subnet IP (which is already advertised by Cloud Router). Standard Cloud DNS outbound forwarding originates from Google’s `35.199.192.0/19` source range, which must be advertised via Cloud Router custom route advertisement and allowed on the on-premises firewall.'
      },
      {
        id: 'C',
        text: 'The VM subnet does not have Private Google Access enabled.',
        whyRightOrWrong:
          'INCORRECT. Cloud DNS resolution via `169.254.169.254` works regardless of whether Private Google Access is enabled.'
      },
      {
        id: 'D',
        text: 'You must create a DNS Peering zone instead of a DNS Forwarding zone for hybrid VPN connections.',
        whyRightOrWrong:
          'INCORRECT. DNS Peering delegates namespaces between two GCP VPC networks; DNS Forwarding sends DNS queries to specific IP addresses (such as on-premises DNS servers).'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'When a VM queries its local metadata server (`169.254.169.254`) and hits a Cloud DNS Forwarding Zone (using standard routing), Cloud DNS sends the forwarded packet into your VPC and across Cloud VPN/Interconnect using a source IP from `35.199.192.0/19`. For the on-premises DNS server to receive the query and route the reply back to GCP, `35.199.192.0/19` must be advertised on the Cloud Router BGP session and permitted by on-premises firewalls.',
    examTrapAlert:
      'Whenever `dig @<on-prem-dns-ip>` works from a VM, it proves VPN connectivity and VM subnet routing work—isolating the issue 100% to the Cloud DNS forwarder range `35.199.192.0/19`!',
    keyTakeaway:
      'Always advertise `35.199.192.0/19` as a Custom Advertised Route on Cloud Router when using Cloud DNS Outbound Forwarding over VPN/Interconnect.'
  },
  {
    id: 'pcne-q3',
    domainId: 'domain-1',
    topic: 'GKE VPC-Native Alias IP Exhaustion',
    difficulty: 'Expert',
    question:
      'You deployed a VPC-native Google Kubernetes Engine (GKE) cluster in `us-central1` using the default maximum pods per node setting (`110`). The subnet has a primary IP range of `10.10.0.0/20` (4,092 usable IPs) for nodes, a secondary range of `10.20.0.0/21` (2,048 IPs) for Pods, and a secondary range of `10.30.0.0/24` (256 IPs) for Services. Currently, the cluster runs 8 nodes with an average of 15 Pods per node. During a traffic spike, Cluster Autoscaler attempts to scale the node pool from 8 nodes to 12 nodes, but fails with `IP_SPACE_EXHAUSTED`. You need to allow the cluster to scale to at least 30 nodes without recreating the cluster or causing downtime. Which two solutions will resolve this issue? (Choose two.)',
    isMultiSelect: true,
    selectCount: 2,
    options: [
      {
        id: 'A',
        text: 'Use `gcloud compute networks subnets expand-ip-range` to expand the primary subnet range from `/20` to `/18`.',
        whyRightOrWrong:
          'INCORRECT. The primary `/20` range already has 4,084 free IPs! The bottleneck is the `/21` Pod secondary range, which only supports eight `/24` slices.'
      },
      {
        id: 'B',
        text: 'Add a new secondary IP range (e.g., `10.24.0.0/18`) to the subnet and attach it to the GKE cluster or a new node pool using `--additional-pod-ipv4-ranges`.',
        whyRightOrWrong:
          'CORRECT. GKE supports discontinuous multi-Pod CIDR ranges. Adding a new `/18` secondary range (16,384 IPs) provides 64 additional `/24` node slices without cluster downtime.'
      },
      {
        id: 'C',
        text: 'Create a new node pool with `--max-pods-per-node=32` and migrate workloads to the new node pool.',
        whyRightOrWrong:
          'CORRECT. Setting `--max-pods-per-node=32` reduces the Pod CIDR slice allocated per node from `/24` (256 IPs) to `/26` (64 IPs), allowing the existing `/21` (2,048 IPs) Pod secondary range to support up to `2048 / 64 = 32` nodes.'
      },
      {
        id: 'D',
        text: 'Expand the existing `10.20.0.0/21` Pod secondary range in-place to `10.20.0.0/19` using `gcloud compute networks subnets expand-ip-range`.',
        whyRightOrWrong:
          'INCORRECT. `expand-ip-range` only works on a subnet’s PRIMARY IP range. Secondary IP ranges cannot be expanded in-place.'
      },
      {
        id: 'E',
        text: 'Enable GKE `ip-masq-agent` on the existing node pool so Pods share the node’s primary IP address.',
        whyRightOrWrong:
          'INCORRECT. `ip-masq-agent` performs SNAT on outbound traffic leaving the cluster, but every Pod in a VPC-native cluster is still allocated an IP from the Pod secondary CIDR.'
      }
    ],
    correctAnswers: ['B', 'C'],
    coreExplanation:
      'With GKE’s default `--max-pods-per-node=110`, each node reserves a full `/24` (256 IPs) from the Pod secondary range regardless of how many Pods actually run on the node. A `/21` Pod secondary range contains `2^(24 - 21) = 8` slices of `/24`, so the cluster hits `IP_SPACE_EXHAUSTED` at 8 nodes. Because secondary ranges cannot be expanded in-place, you can either attach an additional Pod secondary range (`--additional-pod-ipv4-ranges`) or create a node pool with a smaller `--max-pods-per-node` (e.g. `32` uses a `/26` per node = 32 nodes in a `/21`).',
    examTrapAlert:
      '`gcloud compute networks subnets expand-ip-range` ONLY works on PRIMARY subnet ranges, NEVER on secondary ranges!',
    keyTakeaway:
      '110 max pods/node = `/24` per node. 32 max pods/node = `/26` per node. Use discontinuous multi-Pod CIDR (`--additional-pod-ipv4-ranges`) to add Pod IPs to an existing cluster.'
  },
  {
    id: 'pcne-q4',
    domainId: 'domain-1',
    topic: 'Shared VPC IAM & GKE Host Service Agent',
    difficulty: 'Hard',
    question:
      'Your organization uses a Shared VPC architecture with a host project (`net-host-prod`) and multiple service projects. The platform engineering team wants to deploy a VPC-native GKE cluster in service project `app-svc-prod` using the subnet `us-east1-gke` and its secondary IP ranges from `net-host-prod`. Follow the principle of least privilege. Which IAM roles must the Shared VPC Admin grant in `net-host-prod` to allow the GKE cluster to be created and manage its own firewall rules and internal load balancers? (Choose two.)',
    isMultiSelect: true,
    selectCount: 2,
    options: [
      {
        id: 'A',
        text: 'Grant `roles/compute.networkAdmin` at the `net-host-prod` project level to the `app-svc-prod` GKE service agent.',
        whyRightOrWrong:
          'INCORRECT. Granting `compute.networkAdmin` across the entire host project violates least privilege (it allows modifying or deleting any subnet in the host project).'
      },
      {
        id: 'B',
        text: 'Grant `roles/compute.networkUser` on the `us-east1-gke` subnet (including access to its secondary IP ranges) to the `app-svc-prod` Kubernetes Engine Service Agent (`service-SVC_PROJECT_NUMBER@container-engine-robot.iam.gserviceaccount.com`) and Google APIs Service Agent.',
        whyRightOrWrong:
          'CORRECT. Subnet-level `roles/compute.networkUser` scopes network consumption strictly to the designated subnet and its secondary ranges.'
      },
      {
        id: 'C',
        text: 'Grant `roles/container.hostServiceAgentUser` (Kubernetes Engine Host Service Agent User) at the `net-host-prod` project level to the `app-svc-prod` Kubernetes Engine Service Agent (`service-SVC_PROJECT_NUMBER@container-engine-robot.iam.gserviceaccount.com`).',
        whyRightOrWrong:
          'CORRECT. `roles/container.hostServiceAgentUser` allows the service project’s GKE service agent to use the host project’s GKE service agent to manage VPC-level resources (like Load Balancer firewall rules and routes) in the host project.'
      },
      {
        id: 'D',
        text: 'Grant `roles/compute.xpnAdmin` to the platform engineering team on the `app-svc-prod` service project.',
        whyRightOrWrong:
          'INCORRECT. `compute.xpnAdmin` is an organization/folder-level role for administering Shared VPC host projects, not needed by service project developers.'
      },
      {
        id: 'E',
        text: 'Grant `roles/compute.securityAdmin` on the `us-east1-gke` subnet to the `app-svc-prod` default Compute Engine service account.',
        whyRightOrWrong:
          'INCORRECT. Firewall rules are VPC-level resources (cannot be granted at the subnet level), and `container.hostServiceAgentUser` handles GKE firewall management cleanly.'
      }
    ],
    correctAnswers: ['B', 'C'],
    coreExplanation:
      'Deploying GKE in a Shared VPC Service Project requires: (1) Enabling the Kubernetes Engine API in BOTH Host and Service projects, (2) Granting `roles/compute.networkUser` at the **subnet level** to the Service Project’s GKE Service Agent (`service-PROJECT_NUMBER@container-engine-robot...`) and Google APIs Service Agent (`PROJECT_NUMBER@cloudservices.gserviceaccount.com`), and (3) Granting `roles/container.hostServiceAgentUser` on the **Host Project** to the Service Project’s GKE Service Agent.',
    examTrapAlert:
      'Always look for `roles/container.hostServiceAgentUser` on the Host Project + subnet-scoped `roles/compute.networkUser` whenever GKE + Shared VPC appears on the exam!',
    keyTakeaway:
      'GKE in Shared VPC = Subnet-level `compute.networkUser` + Host-project-level `container.hostServiceAgentUser` granted to the Service Project’s `container-engine-robot` service account.'
  },
  {
    id: 'pcne-q5',
    domainId: 'domain-1',
    topic: 'Overlapping IPs & Cross-Organization Acquisition (PSC vs Peering)',
    difficulty: 'Moderate',
    question:
      'Your company recently acquired a startup that runs its workloads on Google Cloud in a separate GCP Organization. Both your company’s production VPC and the startup’s production VPC use the `10.0.0.0/16` CIDR range. You need to allow microservices in your company’s VPC to privately invoke an internal gRPC API hosted in the startup’s VPC over Google’s internal network without re-numbering either VPC or exposing the service to the public internet. What should you configure?',
    options: [
      {
        id: 'A',
        text: 'Configure VPC Network Peering between the two VPCs and enable `--export-custom-routes`.',
        whyRightOrWrong:
          'INCORRECT. VPC Network Peering immediately fails to establish if any subnet CIDR range overlaps between the two VPCs.'
      },
      {
        id: 'B',
        text: 'Place the startup’s gRPC API behind an Internal Load Balancer, publish it via a Private Service Connect (PSC) Service Attachment with a PSC NAT subnet, and create a PSC Endpoint (or PSC Backend) in your company’s VPC.',
        whyRightOrWrong:
          'CORRECT. Private Service Connect works across different GCP Organizations AND completely isolates overlapping IP namespaces by translating consumer traffic into the producer’s PSC NAT subnet.'
      },
      {
        id: 'C',
        text: 'Attach both VPCs as VPC spokes to a single Network Connectivity Center (NCC) Hub.',
        whyRightOrWrong:
          'INCORRECT. NCC VPC spokes cannot have overlapping subnet CIDRs and must belong to the same GCP Organization (unless using Private NAT with Hybrid/NCC setup, which still requires same Org Hub).'
      },
      {
        id: 'D',
        text: 'Enable Shared VPC across the two Organizations.',
        whyRightOrWrong:
          'INCORRECT. Shared VPC cannot span across different GCP Organizations and uses a single VPC (no overlapping subnets).'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'Private Service Connect (PSC) is purpose-built for service-oriented connectivity across different VPCs, different GCP Organizations, and overlapping RFC 1918 IP spaces. The consumer connects to a local PSC Endpoint IP in their own VPC, and the producer’s Service Attachment translates the source IP using a dedicated PSC NAT subnet (`--purpose=PRIVATE_SERVICE_CONNECT`).',
    examTrapAlert:
      'Overlapping IP space + Different GCP Organizations = Private Service Connect (PSC) is almost always the right answer!',
    keyTakeaway:
      'PSC decouples consumer and producer IP spaces via NAT at the Service Attachment layer and supports cross-organization IAM allowlisting (`ACCEPT_MANUAL` or project/org allowlists).'
  },
  {
    id: 'pcne-q6',
    domainId: 'domain-1',
    topic: 'Transitive Peering Limitation with Private Services Access (Cloud SQL)',
    difficulty: 'Expert',
    question:
      'You have a Hub-and-Spoke architecture using VPC Network Peering. `spoke-a-vpc` is peered with `hub-vpc`. You provision a Cloud SQL for PostgreSQL instance with a Private IP using Private Services Access (PSA) attached to `hub-vpc`. VMs in `hub-vpc` can connect to the Cloud SQL instance without issues, but VMs in `spoke-a-vpc` cannot reach the Cloud SQL private IP even after you enable `--export-custom-routes` and `--import-custom-routes` on all VPC Peering connections. How can you enable VMs in `spoke-a-vpc` to connect privately to Cloud SQL with minimal operational overhead?',
    options: [
      {
        id: 'A',
        text: 'Configure a static route in `spoke-a-vpc` for the Cloud SQL PSA `/24` range with next-hop set to the `hub-vpc` peering connection.',
        whyRightOrWrong:
          'INCORRECT. You cannot specify a VPC Peering connection as the next hop of a static route, and VPC Peering is strictly non-transitive (`spoke-a-vpc` <-> `hub-vpc` <-> `servicenetworking-googleapis-com` is 2 peering hops).'
      },
      {
        id: 'B',
        text: 'Enable Private Service Connect (PSC) on the Cloud SQL instance and create a PSC Endpoint (forwarding rule) directly inside `spoke-a-vpc` (and `hub-vpc`).',
        whyRightOrWrong:
          'CORRECT. Cloud SQL supports Private Service Connect (PSC) endpoints, which allow any spoke VPC to connect directly via a local PSC endpoint IP without relying on transitive VPC Peering!'
      },
      {
        id: 'C',
        text: 'Change `hub-vpc` dynamic routing mode from Regional to Global.',
        whyRightOrWrong:
          'INCORRECT. Dynamic routing mode only affects Cloud Router BGP routes, not transitive VPC Peering.'
      },
      {
        id: 'D',
        text: 'Enable Private Google Access on all subnets in `spoke-a-vpc`.',
        whyRightOrWrong:
          'INCORRECT. Private Google Access reaches Google public APIs (`*.googleapis.com`), not private RFC 1918 Cloud SQL database IPs on port 5432.'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'Private Services Access (PSA) creates a VPC Network Peering between `hub-vpc` and Google’s `servicenetworking-googleapis-com` tenant VPC. Because `spoke-a-vpc` is also connected to `hub-vpc` via VPC Peering, traffic from `spoke-a-vpc` -> `hub-vpc` -> `servicenetworking-googleapis-com` requires **transitive peering**, which GCP blocks. Using a **Cloud SQL Private Service Connect (PSC)** endpoint directly in `spoke-a-vpc` (or running a Cloud SQL Auth Proxy / Regional TCP Proxy LB in `hub-vpc`) solves this cleanly.',
    examTrapAlert:
      'Remember that Private Services Access (PSA) IS a VPC Peering under the hood! Any spoke VPC peered with your hub VPC is 2 peering hops away from PSA Cloud SQL.',
    keyTakeaway:
      'To access Cloud SQL across multiple spoke VPCs without transitive peering issues, use Cloud SQL with Private Service Connect (PSC) or a proxy in the hub VPC.'
  },

  // ================= DOMAIN 2: IMPLEMENTING VIRTUAL PRIVATE CLOUD (VPC) INSTANCES =================
  {
    id: 'pcne-q7',
    domainId: 'domain-2',
    topic: 'Cloud NAT Port Exhaustion & Dynamic Port Allocation',
    difficulty: 'Hard',
    question:
      'Your GKE cluster runs in a private subnet in `us-central1` with 20 nodes. A Cloud NAT gateway is configured on the region’s Cloud Router using Manual NAT IP allocation with 4 static external IP addresses and the default static port allocation (`64` ports per VM). During peak hours, Pods on several nodes make hundreds of concurrent HTTPS requests to a single external partner API endpoint (`203.0.113.50:443`). Application logs show intermittent connection timeouts, and Cloud NAT logs show `DROPPED_SENT_PACKET` events, even though total port utilization across the 4 NAT IPs is below 5%. What should you do to resolve the dropped packets?',
    options: [
      {
        id: 'A',
        text: 'Add 4 more static external IP addresses to the Cloud NAT gateway.',
        whyRightOrWrong:
          'INCORRECT. 4 NAT IPs already provide `4 * 64,512 = 258,048` ports. The issue is that each GKE node (VM) is only allocated 64 ports by default, and adding more NAT IPs does NOT increase the per-VM port allocation!'
      },
      {
        id: 'B',
        text: 'Enable Endpoint-Independent Mapping (EIM) on the Cloud NAT gateway.',
        whyRightOrWrong:
          'INCORRECT. EIM reduces port sharing efficiency and is incompatible with Dynamic Port Allocation.'
      },
      {
        id: 'C',
        text: 'Enable Dynamic Port Allocation on the Cloud NAT gateway and increase `--max-ports-per-vm` (for example, to `4096` or `8192`).',
        whyRightOrWrong:
          'CORRECT. When Pods on a single GKE node open more than 64 simultaneous connections to the exact same destination `(IP, Port, Protocol)` 3-tuple (or within the 120s TCP TIME_WAIT window), the node exhausts its 64-port allocation. Enabling Dynamic Port Allocation (or increasing `min-ports-per-vm`) allows busy GKE nodes to scale up to thousands of ports on demand.'
      },
      {
        id: 'D',
        text: 'Increase the Cloud NAT `tcp-time-wait-timeout` from 120 seconds to 600 seconds.',
        whyRightOrWrong:
          'INCORRECT. Increasing `tcp-time-wait-timeout` keeps closed ports locked in `TIME_WAIT` longer, worsening port exhaustion!'
      }
    ],
    correctAnswers: ['C'],
    coreExplanation:
      'Cloud NAT allocates ports per Compute Engine VM (which in GKE means per **GKE Node**, not per Pod!). With the default 64 static ports per VM, all Pods on a node share just 64 ports when communicating with the same destination `(IP, Port, Protocol)` 3-tuple. Enabling Dynamic Port Allocation (`--enable-dynamic-port-allocation`) with a higher `--max-ports-per-vm` allows busy nodes to claim additional ports from the NAT pool automatically.',
    examTrapAlert:
      'Adding more external NAT IPs ONLY helps when the NAT gateway itself is out of total ports (`OUT_OF_RESOURCES`). When a few VMs/GKE nodes hit `DROPPED_SENT_PACKET` to a single destination IP:Port, you must increase `min-ports-per-vm` or enable Dynamic Port Allocation (`max-ports-per-vm`)!',
    keyTakeaway:
      'Cloud NAT allocates ports per VM (GKE Node). Default = 64 ports/VM. Use Dynamic Port Allocation (`min-ports-per-vm` / `max-ports-per-vm`) for GKE nodes and bursty egress.'
  },
  {
    id: 'pcne-q8',
    domainId: 'domain-2',
    topic: 'Multi-NIC Network Virtual Appliance (NVA) & Internal NLB Next Hop',
    difficulty: 'Hard',
    question:
      'You are designing a centralized traffic inspection architecture in `us-central1` using third-party stateful Next-Generation Firewall (NGFW) Network Virtual Appliances (NVAs). Traffic between `spoke-1-vpc`, `spoke-2-vpc`, and `egress-vpc` must pass through an active-active pair of NGFW VMs with automatic sub-second failover and without asymmetric flow state issues across the two NGFW VMs. How should you configure the NGFW VMs and VPC routing?',
    options: [
      {
        id: 'A',
        text: 'Create two NGFW VMs with 3 NICs each (`nic0` in `egress-vpc`, `nic1` in `spoke-1-vpc`, `nic2` in `spoke-2-vpc`) using at least a 4-vCPU machine type with `--can-ip-forward`. Place each NIC group behind an Internal Passthrough Network Load Balancer with symmetric hashing enabled, and configure VPC routes with `--next-hop-ilb`.',
        whyRightOrWrong:
          'CORRECT. Multi-NIC VMs require each NIC in a separate VPC and sufficient vCPUs (`>= 4 vCPUs` for 3–4 NICs) plus `--can-ip-forward`. Using an Internal Passthrough NLB (`--next-hop-ilb`) with symmetric hashing guarantees high availability and ensures forward and return packets of a flow land on the same stateful NGFW instance.'
      },
      {
        id: 'B',
        text: 'Create two NGFW VMs with 3 NICs inside the same VPC subnet, and configure two equal-priority static routes pointing to `--next-hop-instance` for ECMP.',
        whyRightOrWrong:
          'INCORRECT. In GCP, a single VM cannot have multiple NICs attached to the same VPC network, and `--next-hop-instance` does not perform health-checked symmetric failover like an Internal Passthrough NLB.'
      },
      {
        id: 'C',
        text: 'Place the NGFW VMs behind an Internal Application Load Balancer (Envoy) and configure VPC static routes pointing to the Internal ALB IP.',
        whyRightOrWrong:
          'INCORRECT. Only an **Internal Passthrough Network Load Balancer** can be used as a VPC route next hop (`--next-hop-ilb`). Proxy/Application Load Balancers only terminate HTTP/TCP on specific ports and cannot act as L3 route next hops.'
      },
      {
        id: 'D',
        text: 'Use Packet Mirroring to steer traffic from `spoke-1-vpc` to `spoke-2-vpc` through the NGFW VMs.',
        whyRightOrWrong:
          'INCORRECT. Packet Mirroring sends an out-of-band copy of packets for passive monitoring (IDS); it cannot inline-route or block traffic between VPCs (IPS/NGFW).'
      }
    ],
    correctAnswers: ['A'],
    coreExplanation:
      'For inline stateful NVA inspection across multiple VPCs: (1) Use multi-NIC VMs where each vNIC connects to a distinct VPC (requiring `--can-ip-forward` and a machine type with enough vCPUs: 1 vNIC per vCPU, min 2, max 8), (2) Front the NVA MIG in each VPC with an **Internal Passthrough Network Load Balancer** (`--ports=all`), (3) Enable **Symmetric Hashing** on the backend service so bidirectional flows hit the same stateful firewall VM, and (4) Point VPC routes (or Policy-Based Routes) to `--next-hop-ilb`.',
    examTrapAlert:
      'Only an **Internal Passthrough Network Load Balancer** supports `--ports=all` and `--next-hop-ilb`! Never pick an Internal Application LB or Proxy LB as a route next hop.',
    keyTakeaway:
      'Stateful NVA HA = Multi-NIC VMs (`--can-ip-forward`) + Internal Passthrough NLB (`--ports=all`) + Symmetric Hashing + `--next-hop-ilb`.'
  },
  {
    id: 'pcne-q9',
    domainId: 'domain-2',
    topic: 'VPC Route Selection Order & Longest Prefix Match vs. Priority',
    difficulty: 'Moderate',
    question:
      'A VPC has Global Dynamic Routing enabled and contains the following four routes in its routing table for traffic originating from a VM in `us-central1` destined to `172.16.45.10`:\n\n1. Dynamic BGP Route learned in `us-central1`: Destination `172.16.0.0/16`, Priority `50`\n2. Dynamic BGP Route learned in `us-east1`: Destination `172.16.45.0/24`, Priority `450` (including inter-region penalty)\n3. Static Route: Destination `172.16.40.0/21`, Priority `100`\n4. Static Route: Destination `172.16.45.0/24`, Priority `800`\n\nAssuming there are no Policy-Based Routes, which route will Google Cloud VPC select to forward the packet to `172.16.45.10`?',
    options: [
      {
        id: 'A',
        text: 'Route 1 (`172.16.0.0/16`, Priority `50`), because it has the lowest numerical priority value (`50`) and is in the local `us-central1` region.',
        whyRightOrWrong:
          'INCORRECT. Longest Prefix Match (LPM) is always evaluated BEFORE route priority or regional locality.'
      },
      {
        id: 'B',
        text: 'Route 2 (`172.16.45.0/24`, Priority `450`), because `/24` is the longest matching prefix and `450` is a higher precedence (lower number) than Route 4’s priority of `800`.',
        whyRightOrWrong:
          'CORRECT. First, GCP filters for the most specific matching prefix (`/24` beats `/21` and `/16`, eliminating Routes 1 and 3). Then, between the two `/24` routes (Route 2 with priority 450 and Route 4 with priority 800), GCP selects the route with the lowest priority number (`450`).'
      },
      {
        id: 'C',
        text: 'Route 3 (`172.16.40.0/21`, Priority `100`), because static routes always take precedence over dynamic BGP routes.',
        whyRightOrWrong:
          'INCORRECT. In GCP, static routes do NOT automatically beat dynamic BGP routes; both compete first on Longest Prefix Match, and then on numerical Priority.'
      },
      {
        id: 'D',
        text: 'Route 4 (`172.16.45.0/24`, Priority `800`), because static routes with the longest prefix always override dynamic routes from remote regions.',
        whyRightOrWrong:
          'INCORRECT. Route 2 already includes the inter-region penalty in its effective priority of `450`, which beats Route 4’s priority of `800`.'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'After Policy-Based Routes and Subnet Routes, Google Cloud VPC evaluates all static and dynamic routes by **Longest Prefix Match (LPM)** first. Here, `172.16.45.10` matches `/16`, `/21`, and `/24`. The `/24` routes (Route 2 and Route 4) win on prefix specificity. Next, GCP compares the effective priority of the tied `/24` routes: `450 < 800`, so Route 2 wins.',
    examTrapAlert:
      'Unlike traditional Cisco/Juniper administrative distance where static routes always beat eBGP regardless of metric, in GCP Static Routes and Dynamic BGP Routes share the SAME Priority scale (`0–65535`) AFTER Longest Prefix Match!',
    keyTakeaway:
      'Route Selection Order: Policy-Based Route -> Subnet Route -> Longest Prefix Match (`/24` > `/21` > `/16`) -> Lowest Numerical Priority (`450` < `800`).'
  },
  {
    id: 'pcne-q10',
    domainId: 'domain-2',
    topic: 'Network Connectivity Center (NCC) Star Topology & Private NAT',
    difficulty: 'Hard',
    question:
      'You are consolidating 40 VPC networks inside a single GCP Organization using Network Connectivity Center (NCC). Twenty of those VPCs are "Workload Spokes" that must be able to communicate with two central "Shared Services Spokes", but security policy strictly prohibits the 20 Workload Spokes from communicating directly with one another. How should you configure the NCC Hub?',
    options: [
      {
        id: 'A',
        text: 'Create an NCC Hub using the `STAR` preset topology, assign the 2 Shared Services VPCs to the `CENTER` group, and assign the 20 Workload VPCs to the `EDGE` group.',
        whyRightOrWrong:
          'CORRECT. NCC’s `STAR` topology separates spokes into a `CENTER` group (which can reach all spokes) and an `EDGE` group (which can ONLY communicate with `CENTER` spokes and never with other `EDGE` spokes).'
      },
      {
        id: 'B',
        text: 'Create an NCC Hub using the `MESH` preset topology and disable `--export-custom-routes` on the 20 Workload VPCs.',
        whyRightOrWrong:
          'INCORRECT. In an NCC `MESH` topology, all VPC spokes exchange subnet routes with all other VPC spokes.'
      },
      {
        id: 'C',
        text: 'Use VPC Network Peering in a hub-and-spoke layout instead of NCC, since NCC only supports full-mesh connectivity.',
        whyRightOrWrong:
          'INCORRECT. NCC natively supports both `MESH` and `STAR` topologies, and scales to 250+ spokes without hitting the 25-peering limit of VPC Network Peering.'
      },
      {
        id: 'D',
        text: 'Configure Cloud NAT with Private NAT enabled on all 20 Workload VPCs.',
        whyRightOrWrong:
          'INCORRECT. Private NAT translates overlapping IP ranges across NCC spokes or hybrid links; it does not isolate spoke-to-spoke routing in a mesh.'
      }
    ],
    correctAnswers: ['A'],
    coreExplanation:
      'Network Connectivity Center (NCC) supports two routing topologies for VPC spokes: **Mesh** (full-mesh connectivity across all spokes) and **Star** (spokes in the `EDGE` group can only exchange routes with spokes in the `CENTER` group, preventing direct East-West communication between Edge spokes).',
    examTrapAlert:
      'When an enterprise has >25 spoke VPCs (exceeding VPC Peering quota) and wants Hub-and-Spoke isolation where spokes cannot talk to each other, pick **NCC Hub with `STAR` topology (`CENTER` vs `EDGE` groups)**!',
    keyTakeaway:
      'NCC `STAR` topology = `CENTER` spoke group (Hubs) + `EDGE` spoke group (Isolated Spokes).'
  },

  // ================= DOMAIN 3: CONFIGURING MANAGED NETWORK SERVICES =================
  {
    id: 'pcne-q11',
    domainId: 'domain-3',
    topic: 'Load Balancing Selection: Preserving Client IP & Mutual TLS (mTLS)',
    difficulty: 'Hard',
    question:
      'Your security compliance team requires a load balancing solution in `europe-west1` for a banking application running on Compute Engine Managed Instance Groups (MIGs). The backend VMs must terminate the client’s original TLS session directly on the VM (end-to-end mTLS without TLS offloading at a proxy) AND must see the client’s true source IP address in the Layer 3 IP packet header (not via HTTP headers or PROXY protocol). Which Google Cloud Load Balancer should you deploy?',
    options: [
      {
        id: 'A',
        text: 'Global External Application Load Balancer with SSL Passthrough enabled.',
        whyRightOrWrong:
          'INCORRECT. Application Load Balancers are Envoy/GFE Layer 7 proxies and ALWAYS terminate the client TLS connection at the load balancer (they do not support SSL passthrough).'
      },
      {
        id: 'B',
        text: 'Global External Proxy Network Load Balancer (SSL Proxy) with PROXY Protocol v2 enabled.',
        whyRightOrWrong:
          'INCORRECT. An SSL Proxy Load Balancer terminates the TLS connection at Google’s edge proxy, and a TCP Proxy Load Balancer rewrites the Layer 3 source IP to the proxy IP (passing client IP only inside the PROXY protocol payload).'
      },
      {
        id: 'C',
        text: 'Regional External Passthrough Network Load Balancer (TCP/UDP) backed by the backend service.',
        whyRightOrWrong:
          'CORRECT. An External Passthrough Network Load Balancer uses Maglev and Direct Server Return (DSR) without terminating TCP or TLS. Packets arrive at the backend VM with the original client Source IP in the Layer 3 header and the untouched TLS handshake intact.'
      },
      {
        id: 'D',
        text: 'Regional External Application Load Balancer in Standard Network Tier.',
        whyRightOrWrong:
          'INCORRECT. Regional External ALB is an Envoy proxy that terminates TCP/TLS and rewrites the source IP to the Proxy-Only Subnet.'
      }
    ],
    correctAnswers: ['C'],
    coreExplanation:
      'Whenever a scenario requires BOTH (1) preserving the raw client IP in the L3 packet header (no `X-Forwarded-For` or `PROXY protocol`) AND/OR (2) terminating the original client TLS handshake directly on the backend VM (end-to-end TLS/mTLS passthrough) or supporting UDP/ESP/ICMP, you must choose a **Passthrough Network Load Balancer**.',
    examTrapAlert:
      'Proxy LBs (Application LB, SSL Proxy LB, TCP Proxy LB) ALWAYS terminate the TCP connection and rewrite the packet’s source IP! Only Passthrough NLBs preserve the original TCP stream and L3 client IP.',
    keyTakeaway:
      'End-to-end TLS passthrough + native L3 Client IP preservation = External/Internal Passthrough Network Load Balancer.'
  },
  {
    id: 'pcne-q12',
    domainId: 'domain-3',
    topic: 'Internal Application Load Balancer Proxy-Only Subnet & Firewalls',
    difficulty: 'Hard',
    question:
      'You have deployed an Internal Application Load Balancer in `us-west1` (subnet `10.10.1.0/24`) with a Proxy-Only Subnet configured as `10.10.200.0/23` (`purpose=REGIONAL_MANAGED_PROXY`). However, all backend VMs in your Managed Instance Group report as `UNHEALTHY`, and even when you test against a healthy mock backend, requests time out. Your VPC has an explicit `DENY ALL INGRESS` firewall rule at priority `65000`. Which ingress firewall source IP ranges must you allow to reach your backend VMs on the backend serving/health-check port? (Choose two.)',
    isMultiSelect: true,
    selectCount: 2,
    options: [
      {
        id: 'A',
        text: 'Allow `35.191.0.0/16` and `130.211.0.0/22` to reach the backend VMs.',
        whyRightOrWrong:
          'CORRECT. Google Cloud’s centralized Health Check probers always originate from `35.191.0.0/16` and `130.211.0.0/22`. Without allowing these ranges, backends remain `UNHEALTHY`.'
      },
      {
        id: 'B',
        text: 'Allow the Proxy-Only Subnet range `10.10.200.0/23` to reach the backend VMs.',
        whyRightOrWrong:
          'CORRECT. For Regional Envoy-based load balancers (Internal ALB, Regional External ALB, Regional Proxy NLB), Envoy proxies terminate client connections and open new connections to the backends using source IPs from the regional Proxy-Only Subnet (`10.10.200.0/23`).'
      },
      {
        id: 'C',
        text: 'Allow `35.235.240.0/20` to reach the backend VMs.',
        whyRightOrWrong:
          'INCORRECT. `35.235.240.0/20` is the range for Identity-Aware Proxy (IAP) TCP forwarding (SSH/RDP), not load balancer health checks or Envoy proxies.'
      },
      {
        id: 'D',
        text: 'Allow `35.199.192.0/19` to reach the backend VMs.',
        whyRightOrWrong:
          'INCORRECT. `35.199.192.0/19` is the Cloud DNS outbound forwarding range.'
      },
      {
        id: 'E',
        text: 'Allow the client VM source IPs directly to the backend VMs.',
        whyRightOrWrong:
          'INCORRECT. With an Internal Application Load Balancer (proxy), client VMs connect to the LB VIP (`10.10.1.x`), and the Envoy proxy in `10.10.200.0/23` connects to the backend VMs. Backends never see the client VM source IP at Layer 3.'
      }
    ],
    correctAnswers: ['A', 'B'],
    coreExplanation:
      'For any Regional Envoy-based Load Balancer (such as an Internal Application Load Balancer), two separate traffic sources connect to your backend VMs: (1) Google’s central health check systems (`35.191.0.0/16` and `130.211.0.0/22`) to verify backend health, and (2) The regional Envoy proxies running inside your `--purpose=REGIONAL_MANAGED_PROXY` subnet (`10.10.200.0/23`) to forward actual HTTP/HTTPS requests.',
    examTrapAlert:
      'Many candidates allow only `35.191.0.0/16` and `130.211.0.0/22` (so health checks pass!) but forget to allow the **Proxy-Only Subnet CIDR**, causing actual user requests to time out with `502 Bad Gateway` / `upstream connect error`!',
    keyTakeaway:
      'Internal ALB / Regional Envoy LB Backend Firewall Rule = Allow `35.191.0.0/16`, `130.211.0.0/22` (Health Checks) + `Proxy-Only Subnet CIDR` (Envoy Data Plane).'
  },
  {
    id: 'pcne-q13',
    domainId: 'domain-3',
    topic: 'Cloud Armor Edge Security Policy vs. Backend Security Policy',
    difficulty: 'Moderate',
    question:
      'Your e-commerce application uses a Global External Application Load Balancer with Cloud CDN enabled on both a backend service (Compute Engine MIG) and a Cloud Storage backend bucket. Due to new export compliance regulations, you must immediately block all users in two embargoed countries from accessing both dynamic API responses AND static product catalogs/pdfs that are already cached in Cloud CDN and stored in the Cloud Storage backend bucket. What should you configure?',
    options: [
      {
        id: 'A',
        text: 'Attach a Cloud Armor Backend Security Policy with a geolocation deny rule (`origin.region_code`) to the backend service.',
        whyRightOrWrong:
          'INCORRECT. A Backend Security Policy only evaluates requests AFTER a Cloud CDN cache miss and cannot be attached to a Cloud Storage backend bucket!'
      },
      {
        id: 'B',
        text: 'Create a Cloud Armor Edge Security Policy with a geolocation deny rule (`origin.region_code`) and attach it to both the CDN-enabled backend service and the Cloud Storage backend bucket.',
        whyRightOrWrong:
          'CORRECT. Cloud Armor Edge Security Policies are enforced at Google’s edge PoPs BEFORE Cloud CDN serves cached objects AND support Cloud Storage backend buckets.'
      },
      {
        id: 'C',
        text: 'Create a VPC Network Firewall Policy with a geolocation deny rule and attach it to the VPC.',
        whyRightOrWrong:
          'INCORRECT. VPC firewall policies do not stop Cloud CDN from serving cached objects at the Google edge or protect Cloud Storage backend buckets.'
      },
      {
        id: 'D',
        text: 'Enable Cloud CDN Signed URLs on the backend bucket.',
        whyRightOrWrong:
          'INCORRECT. Signed URLs authenticate specific URL requests via cryptographic signatures, not automatic country-code geolocation blocking.'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'Cloud Armor offers two policy enforcement points: **Backend Security Policies** (enforced on cache misses heading to backend services, supporting WAF rules and Adaptive Protection) and **Edge Security Policies** (enforced upstream at Google’s edge BEFORE Cloud CDN cache lookups and BEFORE Cloud Storage backend buckets). To block requests to cached CDN assets or backend buckets by Geo/IP, you must use an **Edge Security Policy**.',
    examTrapAlert:
      'Backend Security Policy = Evaluated AFTER CDN Cache Miss (No Backend Bucket support). Edge Security Policy = Evaluated BEFORE CDN Cache Hit & supports Backend Buckets!',
    keyTakeaway:
      'Use Cloud Armor **Edge Security Policy** whenever you need to filter traffic before Cloud CDN cache hits or protect a Cloud Storage backend bucket.'
  },
  {
    id: 'pcne-q14',
    domainId: 'domain-3',
    topic: 'Cloud CDN Cache Hit Ratio Optimization & Custom Cache Keys',
    difficulty: 'Moderate',
    question:
      'You manage a high-traffic news website behind a Global External Application Load Balancer with Cloud CDN enabled (`CACHE_ALL_STATIC`). Your marketing team recently launched social media campaigns that append unique tracking parameters to every link (e.g., `https://news.example.com/hero.jpg?utm_source=social&fbclid=IwAR3981273`). Since the campaign started, your Cloud CDN cache hit ratio dropped from 94% to 12%, overwhelming your origin servers. How should you restore the high cache hit ratio without breaking marketing analytics (which run via client-side JavaScript in the browser)?',
    options: [
      {
        id: 'A',
        text: 'Change the Cloud CDN cache mode from `CACHE_ALL_STATIC` to `FORCE_CACHE_ALL`.',
        whyRightOrWrong:
          'INCORRECT. The image is already cacheable; the problem is that every unique `?fbclid=...` creates a separate cache key entry (cache miss).'
      },
      {
        id: 'B',
        text: 'Configure a custom Cloud CDN Cache Key on the backend service to exclude query strings (or exclude `utm_*` and `fbclid` via `--cache-key-query-string-blacklist`).',
        whyRightOrWrong:
          'CORRECT. Excluding irrelevant tracking query parameters from the Cloud CDN Cache Key ensures all users share the same cached `hero.jpg` object at the edge while the full URL remains intact in the user’s browser for client-side JavaScript analytics.'
      },
      {
        id: 'C',
        text: 'Configure an HTTP redirect in the URL Map to strip all query strings before the request reaches the browser.',
        whyRightOrWrong:
          'INCORRECT. Stripping the query string via redirect before the page loads would break the client-side JavaScript marketing analytics.'
      },
      {
        id: 'D',
        text: 'Run a scheduled Cloud Run job every 5 minutes to invalidate `/*` in Cloud CDN.',
        whyRightOrWrong:
          'INCORRECT. Cache invalidation deletes cached objects, reducing the cache hit ratio to 0%.'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'By default, Cloud CDN includes the entire URL—including all query string parameters—in the Cache Key. Unique per-click identifiers like `fbclid` or `gclid` cause every visitor to generate a cache miss. Customizing the Cloud CDN Cache Key to exclude those parameters (`--cache-key-query-string-blacklist` or `--no-cache-key-include-query-string`) immediately restores a high cache hit ratio.',
    examTrapAlert:
      'Low Cloud CDN cache hit ratio caused by tracking parameters (`?utm_...`, `?fbclid=...`) or per-user headers = Customize the **Cloud CDN Cache Key**!',
    keyTakeaway:
      'Customize Cloud CDN Cache Keys to strip non-content-altering query parameters (`fbclid`, `gclid`, `utm_*`).'
  },
  {
    id: 'pcne-q15',
    domainId: 'domain-3',
    topic: 'Hybrid Connectivity NEG (`NON_GCP_PRIVATE_IP_PORT`)',
    difficulty: 'Hard',
    question:
      'You are migrating a monolithic web application from your on-premises data center (connected to GCP via Dedicated Interconnect) to Google Kubernetes Engine (GKE). During the 6-month migration, `https://api.example.com/v2/*` must be served by GKE in `us-east4`, while `https://api.example.com/v1/*` must continue to be served by legacy servers (`192.168.50.10:8080` and `192.168.50.11:8080`) in your on-premises data center. How should you configure the Global External Application Load Balancer?',
    options: [
      {
        id: 'A',
        text: 'Create an Internet NEG (`INTERNET_IP_PORT`) with endpoints `192.168.50.10:8080` and `192.168.50.11:8080` and route `/v1/*` to it in the URL Map.',
        whyRightOrWrong:
          'INCORRECT. Internet NEGs only support publicly routable internet IP addresses, not RFC 1918 private IPs reachable over Cloud Interconnect.'
      },
      {
        id: 'B',
        text: 'Create a Hybrid Connectivity NEG (`NON_GCP_PRIVATE_IP_PORT`) in `us-east4` with endpoints `192.168.50.10:8080` and `192.168.50.11:8080`, attach it to a backend service for `/v1/*`, and use a Zonal NEG (`GCE_VM_IP_PORT`) for the GKE `/v2/*` backend service.',
        whyRightOrWrong:
          'CORRECT. Hybrid Connectivity NEGs (`--network-endpoint-type=NON_GCP_PRIVATE_IP_PORT`) allow Envoy/GFE-based Load Balancers to route traffic over Cloud Interconnect or HA VPN to on-premises RFC 1918 IP:Port endpoints alongside GKE Zonal NEGs.'
      },
      {
        id: 'C',
        text: 'Add `192.168.50.10` and `192.168.50.11` directly to an Unmanaged Instance Group in `us-east4`.',
        whyRightOrWrong:
          'INCORRECT. Unmanaged Instance Groups can only contain Compute Engine VM instances running inside GCP.'
      },
      {
        id: 'D',
        text: 'Use an External Passthrough Network Load Balancer with a URL Map for `/v1/*` and `/v2/*`.',
        whyRightOrWrong:
          'INCORRECT. Passthrough Network Load Balancers operate at Layer 4 and do not have URL Maps or path-based routing.'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'Hybrid Connectivity NEGs (`NON_GCP_PRIVATE_IP_PORT`) let you register on-premises or multi-cloud private IP:Port endpoints reachable over Cloud Interconnect or HA VPN as backends behind Google Cloud Application Load Balancers (or Proxy NLBs). Combined with URL Map path rules (or weighted traffic splitting), you can seamlessly migrate traffic from on-premises to GKE (`GCE_VM_IP_PORT` Zonal NEGs).',
    examTrapAlert:
      'Remember to allow Google Health Check probers (`35.191.0.0/16` and `130.211.0.0/22`) across your Cloud Interconnect/VPN and on-premises firewall so the Hybrid NEG endpoints pass health checks!',
    keyTakeaway:
      'On-Premises RFC 1918 backends behind a GCP Load Balancer = **Hybrid Connectivity NEG (`NON_GCP_PRIVATE_IP_PORT`)**.'
  },

  // ================= DOMAIN 4: CONFIGURING AND IMPLEMENTING HYBRID AND MULTI-CLOUD INTERCONNECT =================
  {
    id: 'pcne-q16',
    domainId: 'domain-4',
    topic: 'Dedicated Interconnect 99.99% SLA Topology Requirements',
    difficulty: 'Hard',
    question:
      'Your enterprise is deploying Dedicated Interconnect to support mission-critical financial workloads that require a 99.99% availability SLA from Google Cloud. You have workloads running in `us-central1` and `us-east4`. Which physical and logical architecture meets the minimum requirements for the Dedicated Interconnect 99.99% SLA?',
    options: [
      {
        id: 'A',
        text: '2 physical 100 Gbps Dedicated Interconnect connections in the Chicago colocation facility (1 in Edge Availability Domain 1 and 1 in Edge Availability Domain 2), with 4 VLAN attachments split across `us-central1` and `us-east4`, and Global Dynamic Routing enabled.',
        whyRightOrWrong:
          'INCORRECT. Two physical connections in a SINGLE metropolitan area (Chicago) only qualify for the **99.9% SLA**, even if you create 4 VLAN attachments to 2 GCP regions! A metro-wide outage in Chicago would sever connectivity.'
      },
      {
        id: 'B',
        text: '4 physical 10 Gbps Dedicated Interconnect connections in the Chicago colocation facility (2 in Edge Availability Domain 1 and 2 in Edge Availability Domain 2), connected to `us-central1` and `us-east4`.',
        whyRightOrWrong:
          'INCORRECT. All 4 connections are still in a single metropolitan area (Chicago). The 99.99% SLA strictly requires connections across at least **2 different Metropolitan Areas**.'
      },
      {
        id: 'C',
        text: '4 physical Dedicated Interconnect connections split across 2 different Metropolitan Areas (2 in Chicago in Edge Availability Domains 1 & 2, and 2 in Ashburn in Edge Availability Domains 1 & 2), connected via VLAN attachments to Cloud Routers in `us-central1` and `us-east4`, with VPC Global Dynamic Routing enabled.',
        whyRightOrWrong:
          'CORRECT. The 99.99% SLA for Dedicated Interconnect requires: (1) At least 4 physical connections, (2) Spanning 2 distinct Metropolitan Areas (2 per Metro in different Edge Availability Domains: Domain 1 & Domain 2), (3) Connected to 2 GCP Regions, and (4) Global Dynamic Routing enabled.'
      },
      {
        id: 'D',
        text: '2 physical Dedicated Interconnect connections (1 in Chicago Domain 1 and 1 in Ashburn Domain 1) connected to `us-central1` and `us-east4`.',
        whyRightOrWrong:
          'INCORRECT. Having only 1 connection per metro means scheduled maintenance on a single edge domain drops that entire metro; 99.99% requires a redundant pair (Domain 1 + Domain 2) in EACH of the 2 metros (4 total).'
      }
    ],
    correctAnswers: ['C'],
    coreExplanation:
      'Google Cloud’s Dedicated Interconnect (and Partner Interconnect) SLA rules are strict: **99.9% SLA** requires 2 connections in 1 Metro across Edge Availability Domain 1 and Domain 2. **99.99% SLA** requires **4 connections across 2 DIFFERENT Metros** (Domain 1 + Domain 2 in Metro A, and Domain 1 + Domain 2 in Metro B) terminating in **2 GCP Regions** with **Global Dynamic Routing** enabled.',
    examTrapAlert:
      'Always check the number of **Metros**! 4 connections in 1 Metro = 99.9% SLA. 2 connections in 2 Metros (1 each) = NO SLA. 4 connections across 2 Metros (Domain 1 & 2 in each) + 2 Regions + Global Routing = **99.99% SLA**!',
    keyTakeaway:
      '99.99% Interconnect SLA = 4 Connections / VLAN Attachments across 2 Metros (Domain 1 & 2 in each) + 2 GCP Regions + Global Dynamic Routing.'
  },
  {
    id: 'pcne-q17',
    domainId: 'domain-4',
    topic: 'Global Dynamic Routing Inter-Region Penalty & Asymmetric Routing',
    difficulty: 'Expert',
    question:
      'Your VPC has Global Dynamic Routing enabled. You have a primary Dedicated Interconnect in `us-east4` and a backup HA VPN in `us-west1` connecting to the same on-premises data center (`192.168.0.0/16`). On your on-premises router, you advertise `192.168.0.0/16` with BGP `MED 100` over the `us-east4` Dedicated Interconnect and `MED 200` over the `us-west1` HA VPN. However, you notice that Compute Engine VMs in `us-west1` are sending egress traffic to `192.168.0.0/16` over the backup `us-west1` HA VPN instead of the primary `us-east4` Interconnect, causing asymmetric routing drops on your on-premises stateful firewall! Why is this happening, and how should you fix it?',
    options: [
      {
        id: 'A',
        text: 'HA VPN routes always take precedence over Dedicated Interconnect routes. Convert the HA VPN to Classic VPN with static routes.',
        whyRightOrWrong:
          'INCORRECT. Both HA VPN and Interconnect use Cloud Router BGP and are treated identically by the VPC routing table.'
      },
      {
        id: 'B',
        text: 'In Global Dynamic Routing mode, GCP adds an inter-region cost penalty (`201` to `9999`) to routes learned from a remote region. For VMs in `us-west1`, the `us-east4` Interconnect route has an effective priority of `100 + inter-region cost (>301)`, which loses to the local `us-west1` HA VPN priority of `200`. Fix this by prepending the AS-Path on the `us-west1` HA VPN advertisement (or setting the `us-west1` HA VPN MED to a much higher value like `5000`).',
        whyRightOrWrong:
          'CORRECT! When Global Dynamic Routing shares a BGP route across regions, it adds a region-to-region cost (`>= 201`) to the MED. Because `200 < (100 + ~250)`, VMs in `us-west1` prefer their local HA VPN! Prepending the AS-Path on the backup HA VPN (or raising its MED above the inter-region penalty, e.g., `5000`) forces all regions to prefer the primary `us-east4` Interconnect.'
      },
      {
        id: 'C',
        text: 'Change the VPC dynamic routing mode from Global to Regional so `us-west1` VMs use the `us-east4` Interconnect.',
        whyRightOrWrong:
          'INCORRECT. Switching to Regional dynamic routing would prevent `us-west1` VMs from seeing the `us-east4` Interconnect routes altogether!'
      },
      {
        id: 'D',
        text: 'Enable BFD (Bidirectional Forwarding Detection) on the `us-east4` Cloud Router.',
        whyRightOrWrong:
          'INCORRECT. BFD speeds up link failure detection; it does not alter BGP route priority or inter-region cost penalties.'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'When Global Dynamic Routing is enabled, a VM in Region A evaluating a BGP route learned by a Cloud Router in Region B sees an effective route priority of `Base MED + Region-to-Region Cost (201 to 9999)`. If a backup VPN exists locally in Region A with a slightly higher MED (like `200` vs `100`), the local backup VPN still wins inside Region A (`200 < 100 + 250`). To make a remote region’s Interconnect act as the global primary for ALL regions, either use **AS-Path Prepending** on the backup link or set the backup link’s MED high enough (e.g., `5000`) to exceed `Primary MED + Inter-Region Cost`.',
    examTrapAlert:
      'This `MED 100` (Remote Region Primary) vs. `MED 200` (Local Region Backup) trap is one of the classic "Expert" questions on the PCNE exam!',
    keyTakeaway:
      'In Global Dynamic Routing, Remote Region Effective Priority = `MED + Inter-Region Penalty (201–9999)`. Use high backup MED (`5000+`) or AS-Path Prepending for global active/passive.'
  },
  {
    id: 'pcne-q18',
    domainId: 'domain-4',
    topic: 'Encryption Over Dedicated & Partner Interconnect (MACsec vs HA VPN over Interconnect)',
    difficulty: 'Moderate',
    question:
      'Your security team mandates that all hybrid traffic traversing your two 100 Gbps Dedicated Interconnect links between your colocation facility and Google Cloud must be encrypted in transit. Your application requires at least 80 Gbps of encrypted throughput with sub-millisecond encryption overhead and minimal operational complexity. What should you implement?',
    options: [
      {
        id: 'A',
        text: 'Configure MACsec for Cloud Interconnect (IEEE 802.1AE) on the 100 Gbps Dedicated Interconnect connections.',
        whyRightOrWrong:
          'CORRECT. MACsec provides line-rate Layer 2 hardware encryption directly between your router and Google’s peering edge on 10G and 100G Dedicated Interconnect links without the 3 Gbps per-tunnel throughput ceiling of IPsec VPN.'
      },
      {
        id: 'B',
        text: 'Deploy a single HA VPN tunnel over the Dedicated Interconnect VLAN attachment.',
        whyRightOrWrong:
          'INCORRECT. A single HA VPN IPsec tunnel caps at ~3 Gbps (250k PPS); achieving 80 Gbps would require managing ~28+ ECMP IPsec tunnels.'
      },
      {
        id: 'C',
        text: 'Switch from Dedicated Interconnect to Partner Interconnect Layer 3, which encrypts traffic automatically.',
        whyRightOrWrong:
          'INCORRECT. Partner Interconnect does not encrypt traffic by default.'
      },
      {
        id: 'D',
        text: 'Enable Private Google Access on the Cloud Router.',
        whyRightOrWrong:
          'INCORRECT. Private Google Access is a routing mechanism for Google APIs, not a link-layer encryption protocol.'
      }
    ],
    correctAnswers: ['A'],
    coreExplanation:
      'To encrypt high-throughput Dedicated Interconnect links (10 Gbps or 100 Gbps) at line rate without managing dozens of 3 Gbps IPsec VPN tunnels, use **MACsec for Cloud Interconnect** (IEEE 802.1AE Layer 2 encryption). Note: If using **Partner Interconnect** (where your router does not physically terminate on Google’s optical port) or if FIPS 140-2 Layer 3 IPsec is required at moderate bandwidths, use **HA VPN over Cloud Interconnect**.',
    examTrapAlert:
      '10G/100G line-rate encryption on Dedicated Interconnect = **MACsec**. IPsec encryption on Partner Interconnect = **HA VPN over Cloud Interconnect**.',
    keyTakeaway:
      'MACsec = Layer 2 line-rate encryption for Dedicated Interconnect. HA VPN over Interconnect = Layer 3 IPsec (~3 Gbps per tunnel) for Dedicated or Partner Interconnect.'
  },
  {
    id: 'pcne-q19',
    domainId: 'domain-4',
    topic: 'HA VPN 99.99% SLA Topology with Single On-Premises Device (Dual Interface)',
    difficulty: 'Hard',
    question:
      'You are configuring HA VPN in Google Cloud to connect to an on-premises data center that has a SINGLE physical VPN gateway device equipped with two separate external IP interfaces (`Peer_IP_0` and `Peer_IP_1`). How many IPsec tunnels must you configure between the Google Cloud HA VPN gateway and the Peer VPN gateway to meet Google Cloud’s 99.99% HA VPN service level agreement (SLA) documentation requirements (assuming hardware redundancy on-prem or full interface mesh)?',
    options: [
      {
        id: 'A',
        text: '1 tunnel from GCP `Interface 0` to `Peer_IP_0`.',
        whyRightOrWrong:
          'INCORRECT. Leaving `Interface 1` on the GCP HA VPN gateway unused violates the 99.99% SLA.'
      },
      {
        id: 'B',
        text: '2 tunnels, both originating from GCP `Interface 0` (`Interface 0 -> Peer_IP_0` and `Interface 0 -> Peer_IP_1`).',
        whyRightOrWrong:
          'INCORRECT. Both `Interface 0` and `Interface 1` on the GCP HA VPN gateway must have active tunnels.'
      },
      {
        id: 'C',
        text: '4 tunnels in a full mesh (`Interface 0 -> Peer_IP_0`, `Interface 0 -> Peer_IP_1`, `Interface 1 -> Peer_IP_0`, `Interface 1 -> Peer_IP_1`).',
        whyRightOrWrong:
          'CORRECT. When connecting a GCP HA VPN gateway (2 interfaces) to a single Peer VPN gateway resource configured with 2 external interfaces (`--redundancy-type=TWO_IPS_REDUNDANCY`), Google Cloud requires a 4-tunnel full mesh so either GCP interface can reach either peer interface.'
      },
      {
        id: 'D',
        text: '8 tunnels across two Cloud Routers in the same region.',
        whyRightOrWrong:
          'INCORRECT. Only 1 Cloud Router and 4 tunnels (or 2 tunnels when using `SINGLE_IP_INTERNALLY_REDUNDANT` / two separate peer gateway resources) are required.'
      }
    ],
    correctAnswers: ['C'],
    coreExplanation:
      'When creating an External VPN Gateway (`peer-vpn-gateway`) in GCP, you specify `--redundancy-type`: (1) `TWO_IPS_REDUNDANCY` (1 on-prem gateway with 2 IPs -> requires **4 tunnels** in a full mesh from GCP `Int 0` and `Int 1`), (2) `SINGLE_IP_INTERNALLY_REDUNDANT` (e.g., AWS Virtual Private Gateway with 1 IP or two separate 1-IP peer devices -> requires **2 tunnels**, one from `Int 0` and one from `Int 1`), or (3) `FOUR_IPS_REDUNDANCY` (2 on-prem devices with 2 IPs each -> **4 tunnels**).',
    examTrapAlert:
      'Remember the three External VPN Gateway redundancy types: `SINGLE_IP_INTERNALLY_REDUNDANT` (2 tunnels), `TWO_IPS_REDUNDANCY` (4 tunnels full-mesh), `FOUR_IPS_REDUNDANCY` (4 tunnels).',
    keyTakeaway:
      'Both `Interface 0` and `Interface 1` of the GCP HA VPN Gateway must ALWAYS be connected to achieve the 99.99% SLA.'
  },

  // ================= DOMAIN 5: MANAGING, MONITORING, AND OPTIMIZING NETWORK OPERATIONS =================
  {
    id: 'pcne-q20',
    domainId: 'domain-5',
    topic: 'Hierarchical Firewall Policy `goto_next` Delegation with IAP',
    difficulty: 'Hard',
    question:
      'As the Organization Security Administrator, you must ensure that no Compute Engine VM across any project in your organization can accept SSH (`tcp:22`) or RDP (`tcp:3389`) connections directly from the public internet (`0.0.0.0/0`), EXCEPT when traffic originates from Google Identity-Aware Proxy’s TCP forwarding range (`35.235.240.0/20`). Furthermore, individual project owners must still be able to control which specific VMs in their VPCs allow or deny IAP SSH/RDP using their own VPC firewall rules. How should you configure the Organization Hierarchical Firewall Policy?',
    options: [
      {
        id: 'A',
        text: 'Rule Priority `1000`: Match `src: 35.235.240.0/20`, `tcp:22,3389`, Action = `ALLOW`. Rule Priority `1001`: Match `src: 0.0.0.0/0`, `tcp:22,3389`, Action = `DENY`.',
        whyRightOrWrong:
          'INCORRECT! If an Organization Hierarchical Firewall Policy has `Action = ALLOW`, it immediately permits the packet for EVERY VM in the entire organization and skips evaluating all lower-level VPC firewall rules!'
      },
      {
        id: 'B',
        text: 'Rule Priority `1000`: Match `src: 35.235.240.0/20`, `tcp:22,3389`, Action = `goto_next`. Rule Priority `1001`: Match `src: 0.0.0.0/0`, `tcp:22,3389`, Action = `DENY`.',
        whyRightOrWrong:
          'CORRECT! Setting Priority `1000` (`35.235.240.0/20`) to `goto_next` exempts IAP traffic from the Priority `1001` `0.0.0.0/0` `DENY` rule and delegates the final `ALLOW`/`DENY` decision down to each project’s local VPC firewall rules.'
      },
      {
        id: 'C',
        text: 'Rule Priority `1000`: Match `src: 0.0.0.0/0`, `tcp:22,3389`, Action = `DENY`. Rule Priority `1001`: Match `src: 35.235.240.0/20`, `tcp:22,3389`, Action = `goto_next`.',
        whyRightOrWrong:
          'INCORRECT. Priority `1000` is evaluated before `1001`. Because `0.0.0.0/0` matches everything (including `35.235.240.0/20`), Rule `1001` would be shadowed and never reached!'
      },
      {
        id: 'D',
        text: 'Rule Priority `1000`: Match `src: 0.0.0.0/0`, `tcp:22,3389`, Action = `goto_next`.',
        whyRightOrWrong:
          'INCORRECT. Delegating all `0.0.0.0/0` traffic allows project owners to open `0.0.0.0/0` SSH in their local VPC firewall rules, violating the security requirement.'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'In Hierarchical Firewall Policies (and Network Firewall Policies), an `ALLOW` rule short-circuits evaluation and immediately admits the packet to all matching VMs without checking lower-level policies. When you want to allow an exception (like IAP `35.235.240.0/20`) through an Org-wide `0.0.0.0/0` `DENY` rule while still letting lower-level VPC firewalls decide which VMs accept it, you MUST put the exception at a higher precedence (lower priority number, e.g., `1000`) with `Action = goto_next`, followed by the broad `DENY` rule at priority `1001`.',
    examTrapAlert:
      'Never use `Action = ALLOW` at the Organization/Folder level unless you want to force-open that port on EVERY VM in the Org/Folder! Use `goto_next` to delegate!',
    keyTakeaway:
      'Org Firewall Exemption Pattern: Priority `1000` (`35.235.240.0/20` -> `goto_next`) + Priority `1001` (`0.0.0.0/0` -> `DENY`).'
  },
  {
    id: 'pcne-q21',
    domainId: 'domain-5',
    topic: 'VPC Flow Logs vs. Firewall Rules Logging (Ingress Drops)',
    difficulty: 'Moderate',
    question:
      'A web application running on a Compute Engine VM in `subnet-prod-1` is unable to receive traffic on TCP port `8443` from an on-premises server (`10.100.5.20`). You enabled VPC Flow Logs on `subnet-prod-1` with a 100% sampling rate (`1.0`), waited 10 minutes while the on-premises server repeatedly sent TCP SYN packets to port `8443`, and queried Cloud Logging for VPC Flow Logs—but zero log entries appear for port `8443`. Why are the packets missing from VPC Flow Logs, and how can you verify what is dropping them?',
    options: [
      {
        id: 'A',
        text: 'VPC Flow Logs do not support hybrid traffic from Cloud VPN or Cloud Interconnect.',
        whyRightOrWrong:
          'INCORRECT. VPC Flow Logs capture all TCP/UDP/ICMP traffic entering or leaving a VM NIC, including hybrid traffic.'
      },
      {
        id: 'B',
        text: 'Ingress firewall rules are evaluated BEFORE VPC Flow Logs capture traffic at the VM vNIC. If an ingress firewall rule (or the implied deny ingress rule) drops the packet, it never reaches VPC Flow Logs. Enable Firewall Rules Logging on the ingress deny rules (or run a Network Intelligence Center Connectivity Test).',
        whyRightOrWrong:
          'CORRECT! For ingress traffic, Andromeda enforces firewall rules BEFORE the VPC Flow Logs tap point. Blocked ingress packets are only visible in **Firewall Rules Logging** (or diagnosed via **Connectivity Tests**).'
      },
      {
        id: 'C',
        text: 'VPC Flow Logs only capture TCP ports `80` and `443` by default.',
        whyRightOrWrong:
          'INCORRECT. VPC Flow Logs capture all TCP, UDP, ICMP, ESP, and GRE protocols and ports unless filtered.'
      },
      {
        id: 'D',
        text: 'You must enable Packet Mirroring to see packets blocked by ingress firewall rules.',
        whyRightOrWrong:
          'INCORRECT. Packet Mirroring also captures traffic at the VM vNIC (after ingress firewall rules), so packets dropped by ingress firewalls are not mirrored either.'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'On the ingress path into a Compute Engine VM, Google Cloud evaluates **Ingress Firewall Rules first**, and only allowed packets reach the VM’s vNIC where **VPC Flow Logs** and **Packet Mirroring** operate. Therefore, packets dropped by an ingress firewall rule never appear in VPC Flow Logs! To see dropped ingress packets in Cloud Logging, enable **Firewall Rules Logging** (`--enable-logging`) on the relevant firewall rules.',
    examTrapAlert:
      'Ingress Path Order: `Ingress Firewall Rules (Firewall Logs) -> VPC Flow Logs / Packet Mirroring -> VM vNIC`. Egress Path Order: `VM vNIC -> VPC Flow Logs / Packet Mirroring -> Egress Firewall Rules (Firewall Logs)`.',
    keyTakeaway:
      'Blocked ingress traffic NEVER shows up in VPC Flow Logs—use **Firewall Rules Logging** or **Connectivity Tests**!'
  },
  {
    id: 'pcne-q22',
    domainId: 'domain-5',
    topic: 'IAM Secure Tags vs. Classic Network Tags in Network Firewall Policies',
    difficulty: 'Moderate',
    question:
      'In your Shared VPC Service Project, application developers have the `Compute Instance Admin (v1)` (`roles/compute.instanceAdmin.v1`) role so they can create and manage their own VMs. You discovered that a developer attached the `pci-database-tier` network tag to an untrusted test VM, which automatically granted that VM access through classic VPC firewall rules intended only for PCI-DSS certified workloads. How should you redesign your firewall rules so developers with `Compute Instance Admin` cannot unauthorizedly grant their VMs firewall access, while still allowing multiple role tags per VM and changing tags without stopping VMs?',
    options: [
      {
        id: 'A',
        text: 'Replace Network Tags with Target Service Accounts on the classic VPC firewall rules.',
        whyRightOrWrong:
          'INCORRECT. While Service Accounts are IAM-controlled, a VM can only have ONE Service Account, and changing a VM’s Service Account requires stopping the VM—violating the requirements.'
      },
      {
        id: 'B',
        text: 'Migrate to a Network Firewall Policy using IAM-governed Secure Tags (Resource Manager Tags), and restrict `roles/resourcemanager.tagUser` on the `pci-database-tier` tag value to the Security team.',
        whyRightOrWrong:
          'CORRECT. Secure Tags in Network Firewall Policies are strictly controlled by IAM (`roles/resourcemanager.tagUser`). Even a `Compute Instance Admin` cannot bind a Secure Tag to a VM unless they also hold `tagUser` on that specific tag value. Moreover, a VM can have multiple Secure Tags and they can be bound dynamically.'
      },
      {
        id: 'C',
        text: 'Move the classic Network Tag firewall rules into an Organization Hierarchical Firewall Policy.',
        whyRightOrWrong:
          'INCORRECT. Hierarchical Firewall Policies do not support classic Network Tags at all.'
      },
      {
        id: 'D',
        text: 'Enable Firewall Insights in Network Intelligence Center to block developers from editing tags.',
        whyRightOrWrong:
          'INCORRECT. Firewall Insights is an auditing/analytics tool; it does not prevent tag modifications.'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'Classic VPC Network Tags have zero IAM access control—anyone who can modify a VM instance (`compute.instances.setTags`) can type any string tag onto their VM. **IAM Secure Tags** (used in Global and Regional Network Firewall Policies) solve both weaknesses of Network Tags and Service Accounts: they enforce strict IAM permission (`roles/resourcemanager.tagUser`), allow multiple tags per VM, and can be updated without stopping the VM.',
    examTrapAlert:
      'Whenever a question highlights the security risk of developers spoofing Network Tags OR needing multiple IAM-governed tags per VM without stopping the VM, pick **IAM Secure Tags with Network Firewall Policies**!',
    keyTakeaway:
      'IAM Secure Tags (`resourcemanager.tagUser`) = IAM-enforced + Multiple per VM + Dynamic attachment + Works in Network Firewall Policies.'
  },
  {
    id: 'pcne-q23',
    domainId: 'domain-5',
    topic: 'GKE Dataplane V2 (Cilium / eBPF) & Network Policies',
    difficulty: 'Moderate',
    question:
      'You are creating a new GKE cluster that will run multi-tenant microservices. You want to enforce Kubernetes `NetworkPolicy` objects to restrict Pod-to-Pod East-West traffic, log Kubernetes network policy verdicts (allow/deny), and eliminate `kube-proxy` `iptables` rule scaling bottlenecks when the cluster reaches thousands of Services. What should you configure when creating the GKE cluster?',
    options: [
      {
        id: 'A',
        text: 'Enable GKE Dataplane V2 (`--enable-dataplane-v2`).',
        whyRightOrWrong:
          'CORRECT. GKE Dataplane V2 is built on eBPF and Cilium. It provides built-in Kubernetes `NetworkPolicy` enforcement, native NetworkPolicy logging, and replaces `kube-proxy` `iptables` with high-performance eBPF programs in the Linux kernel.'
      },
      {
        id: 'B',
        text: 'Create a Legacy (non-VPC-native) routes-based GKE cluster and enable Calico (`--enable-network-policy`).',
        whyRightOrWrong:
          'INCORRECT. Calico still relies on `iptables` and `kube-proxy`, whereas GKE Dataplane V2 uses eBPF and is Google’s recommended architecture for new clusters.'
      },
      {
        id: 'C',
        text: 'Configure Classic VPC Firewall Rules using Kubernetes Pod labels.',
        whyRightOrWrong:
          'INCORRECT. VPC Firewall Rules do not understand Kubernetes Pod labels (`app=frontend`), and Pod-to-Pod traffic on the same node never hits VPC firewalls.'
      },
      {
        id: 'D',
        text: 'Deploy Cloud IDS in the GKE subnet.',
        whyRightOrWrong:
          'INCORRECT. Cloud IDS is an out-of-band intrusion detection service using Packet Mirroring; it cannot block Pod-to-Pod traffic or replace `kube-proxy`.'
      }
    ],
    correctAnswers: ['A'],
    coreExplanation:
      'GKE Dataplane V2 (`--enable-dataplane-v2`) uses **eBPF** and **Cilium** to provide integrated Kubernetes Network Policy enforcement, Pod-level network policy logging, and service load balancing without `kube-proxy` `iptables` overhead.',
    examTrapAlert:
      'GKE Dataplane V2 must be enabled at **cluster creation time** (`--enable-dataplane-v2`) and automatically includes Kubernetes Network Policy support without needing the legacy Calico addon!',
    keyTakeaway:
      'eBPF + Cilium + Built-in K8s NetworkPolicy + No `kube-proxy` `iptables` bottleneck = **GKE Dataplane V2**.'
  },
  {
    id: 'pcne-q24',
    domainId: 'domain-5',
    topic: 'Packet Mirroring Collector Requirements & Bandwidth Impact',
    difficulty: 'Hard',
    question:
      'Your security operations center (SOC) wants to inspect full packet payloads (PCAP) of all TCP traffic entering and leaving your production payment processing VMs in `us-central1` using an open-source Suricata IDS cluster running on Compute Engine VMs. Which two statements accurately describe how you must configure GCP Packet Mirroring for this setup? (Choose two.)',
    isMultiSelect: true,
    selectCount: 2,
    options: [
      {
        id: 'A',
        text: 'Place the Suricata IDS VMs behind an Internal Passthrough Network Load Balancer configured with `--is-mirroring-collector` in `us-central1`.',
        whyRightOrWrong:
          'CORRECT. Packet Mirroring requires the collector destination to be an Internal Passthrough Network Load Balancer in the same region with `--is-mirroring-collector` enabled on its forwarding rule.'
      },
      {
        id: 'B',
        text: 'Place the Suricata IDS VMs behind a Global Internal Application Load Balancer.',
        whyRightOrWrong:
          'INCORRECT. Application Load Balancers terminate HTTP at Layer 7 and cannot act as Packet Mirroring collectors.'
      },
      {
        id: 'C',
        text: 'Account for additional network egress bandwidth utilization on the monitored production VMs, and consider using `--filter-cidr-ranges` / `--filter-protocols=tcp` to minimize mirrored volume.',
        whyRightOrWrong:
          'CORRECT. Packet Mirroring duplicates traffic at the monitored VM’s virtual NIC, which counts toward the monitored VM’s network egress bandwidth cap. Filtering to only required protocols/CIDRs reduces cost and bandwidth consumption.'
      },
      {
        id: 'D',
        text: 'Disable all ingress firewall rules on the Suricata collector VMs, as Packet Mirroring bypasses VPC firewall rules on the collector.',
        whyRightOrWrong:
          'INCORRECT. Collector VMs DO evaluate ingress firewall rules! You must create an ingress firewall rule allowing mirrored traffic (and health checks `35.191.0.0/16`, `130.211.0.0/22`) to reach the collector VMs.'
      },
      {
        id: 'E',
        text: 'Deploy the Collector Load Balancer in `us-east1` to provide cross-region disaster recovery for mirrored packets.',
        whyRightOrWrong:
          'INCORRECT. Packet Mirroring is strictly regional; the mirrored sources and the collector ILB must reside in the **same GCP region** (`us-central1`).'
      }
    ],
    correctAnswers: ['A', 'C'],
    coreExplanation:
      'GCP Packet Mirroring clones traffic from specified Mirrored Sources (subnets, network tags, or instance names) and sends it to an **Internal Passthrough Network Load Balancer** with `--is-mirroring-collector` in the **same region**. Because mirroring happens on the monitored VM’s host, mirrored traffic counts against the monitored VM’s egress bandwidth limit, and collector VMs require ingress firewall rules allowing the mirrored source traffic and health checks.',
    examTrapAlert:
      'Packet Mirroring Collector = Regional Internal Passthrough NLB (`--is-mirroring-collector` + `--ports=all`) in the **SAME region** as the mirrored VMs!',
    keyTakeaway:
      'Use Packet Mirroring filters (`--filter-protocols`, `--filter-cidr-ranges`, `--direction`) to reduce VM egress bandwidth overhead and collector sizing.'
  }
];
