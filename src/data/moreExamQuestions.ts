import { ExamQuestion } from '../types';

export const MORE_EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 'pcne-q25',
    domainId: 'domain-1',
    topic: 'Hub-and-Spoke DNS Architecture (DNS Peering + Forwarding Zone)',
    difficulty: 'Hard',
    question:
      'Your enterprise uses a Hub-and-Spoke topology with a `hub-vpc` connected to your on-premises data center via Dedicated Interconnect, and 15 Spoke VPCs connected to `hub-vpc` via VPC Network Peering. You have already configured a Cloud DNS Private Forwarding Zone in `hub-vpc` for `onprem.corp.internal` pointing to your on-premises DNS servers, and VMs in `hub-vpc` resolve `onprem.corp.internal` successfully. How should you enable VMs across all 15 Spoke VPCs to resolve `onprem.corp.internal` with the least administrative overhead and without creating 15 separate forwarding zones?',
    options: [
      {
        id: 'A',
        text: 'Enable `--export-custom-routes` on `hub-vpc` VPC Peering connections; Cloud DNS forwarding zones are automatically shared over VPC Network Peering.',
        whyRightOrWrong:
          'INCORRECT. VPC Network Peering only exchanges Layer 3 network routes; it does NOT automatically share Cloud DNS zones across peered VPCs.'
      },
      {
        id: 'B',
        text: 'Create a Cloud DNS Peering Zone for `onprem.corp.internal` in each Spoke VPC targeting `hub-vpc` as the target network.',
        whyRightOrWrong:
          'CORRECT. A Cloud DNS Peering Zone in a Spoke VPC sends DNS queries for `onprem.corp.internal` to `hub-vpc`, which then uses `hub-vpc`’s Private Forwarding Zone and Interconnect to resolve the records from on-premises.'
      },
      {
        id: 'C',
        text: 'Enable an Inbound DNS Server Policy on all 15 Spoke VPCs.',
        whyRightOrWrong:
          'INCORRECT. Inbound Server Policies create listener IPs for inbound DNS queries from on-premises; they do not forward Spoke VM queries to `hub-vpc`.'
      },
      {
        id: 'D',
        text: 'Add all 15 Spoke VPCs to the `hub-vpc` Inbound Server Policy.',
        whyRightOrWrong:
          'INCORRECT. An Inbound Server Policy applies to a single VPC network and handles inbound queries from on-premises.'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'In a centralized Hub-and-Spoke DNS architecture, you configure the **Cloud DNS Private Forwarding Zone** (pointing to on-premises DNS) once in `hub-vpc`. Then, in each Spoke VPC, you create a **Cloud DNS Peering Zone** for `onprem.corp.internal` pointing to `hub-vpc` (or alternatively authorize the Spoke VPCs directly on a shared Private Forwarding Zone using Private Routing).',
    examTrapAlert:
      'VPC Network Peering != Cloud DNS Peering! They are configured independently. DNS Peering delegates DNS lookup context to the target VPC.',
    keyTakeaway:
      'Spoke VPCs -> Cloud DNS Peering Zone -> Hub VPC -> Cloud DNS Forwarding Zone -> On-Premises DNS.'
  },
  {
    id: 'pcne-q26',
    domainId: 'domain-1',
    topic: 'Cloud Run to Private VPC Resources (Direct VPC Egress vs Serverless VPC Access)',
    difficulty: 'Moderate',
    question:
      'You are deploying a high-throughput Cloud Run service in `us-central1` that needs to send requests to a Memorystore for Redis instance and internal Compute Engine VMs in `prod-vpc`. You want to minimize network latency, avoid paying for always-on proxy connector VM instances when Cloud Run scales to zero, and apply VPC Network Firewall Policies or IAM tags directly to the Cloud Run traffic. What should you configure?',
    options: [
      {
        id: 'A',
        text: 'Configure Direct VPC Egress on the Cloud Run service attached to a subnet in `prod-vpc`.',
        whyRightOrWrong:
          'CORRECT. Direct VPC Egress allows Cloud Run to send traffic directly into a VPC subnet without spinning up Serverless VPC Access connector VMs, reducing latency, eliminating idle connector VM charges, and supporting Network Firewall Policies / tags.'
      },
      {
        id: 'B',
        text: 'Deploy a Serverless VPC Access Connector on a dedicated `/28` subnet using `e2-standard-4` instances.',
        whyRightOrWrong:
          'INCORRECT. Serverless VPC Access Connectors run persistent proxy VMs that incur continuous charges even when Cloud Run has zero traffic, and add an extra hop of latency.'
      },
      {
        id: 'C',
        text: 'Enable Private Google Access on `prod-vpc` so Cloud Run can reach the VPC.',
        whyRightOrWrong:
          'INCORRECT. Private Google Access is for VPC VMs reaching Google APIs (inbound to Google APIs), not for Cloud Run reaching internal RFC 1918 resources inside your VPC.'
      },
      {
        id: 'D',
        text: 'Create a Serverless NEG for the Cloud Run service and attach it to an External Application Load Balancer.',
        whyRightOrWrong:
          'INCORRECT. A Serverless NEG handles ingress traffic TO Cloud Run, not egress traffic FROM Cloud Run to internal VPC resources.'
      }
    ],
    correctAnswers: ['A'],
    coreExplanation:
      '**Direct VPC Egress** is Google Cloud’s modern replacement for Serverless VPC Access Connectors for Cloud Run. It attaches Cloud Run revisions directly to your VPC subnet (requiring sufficient free IPs in the subnet, at least a `/26` recommended), eliminating proxy VM bottlenecks and idle costs.',
    examTrapAlert:
      'Ingress TO Cloud Run = **Serverless NEG**. Egress FROM Cloud Run to VPC = **Direct VPC Egress** (preferred for lower latency/cost) or **Serverless VPC Access Connector** (requires a dedicated `/28` subnet).',
    keyTakeaway:
      'Prefer **Direct VPC Egress** over Serverless VPC Access Connector when asked for lowest latency, zero idle VM cost, and direct VPC subnet attachment.'
  },
  {
    id: 'pcne-q27',
    domainId: 'domain-1',
    topic: 'GKE Private Cluster Control Plane Authorized Networks & On-Premises kubectl',
    difficulty: 'Hard',
    question:
      'You deployed a Private GKE cluster in `us-east1` with the control plane public endpoint disabled (`--enable-private-endpoint`). The control plane is assigned the `/28` range `172.16.0.32/28` via VPC Network Peering with your `prod-vpc`. DevOps engineers working from your on-premises network (`192.168.10.0/24`), which connects to `prod-vpc` via HA VPN, cannot run `kubectl` commands against the private control plane endpoint (`172.16.0.34`), even though they can SSH into GKE nodes in `prod-vpc`. Which two configurations are required to allow on-premises DevOps engineers to reach the GKE private control plane endpoint directly over HA VPN? (Choose two.)',
    isMultiSelect: true,
    selectCount: 2,
    options: [
      {
        id: 'A',
        text: 'Add the on-premises subnet `192.168.10.0/24` to the GKE cluster’s Control Plane Authorized Networks (`--enable-master-authorized-networks --master-authorized-networks=192.168.10.0/24`) or enable `--enable-master-global-access`.',
        whyRightOrWrong:
          'CORRECT. By default, a private GKE control plane only accepts connections from the cluster’s primary subnet unless Control Plane Authorized Networks includes the source CIDR (`192.168.10.0/24`) and master global access is enabled if accessing from another region.'
      },
      {
        id: 'B',
        text: 'Advertise the GKE control plane range `172.16.0.32/28` as a Custom Advertised Route on the `prod-vpc` Cloud Router to on-premises, and ensure `--export-custom-routes` is enabled on the GKE peering connection.',
        whyRightOrWrong:
          'CORRECT. Cloud Router’s default advertisement mode (`ALL_SUBNETS`) only advertises local VPC subnets—it does NOT advertise peered ranges like the GKE control plane `/28`! You must manually add `172.16.0.32/28` as a Custom Advertised Route on Cloud Router (and export custom routes to the GKE control plane peering so return traffic reaches `192.168.10.0/24`).'
      },
      {
        id: 'C',
        text: 'Advertise `199.36.153.8/30` on the Cloud Router to on-premises.',
        whyRightOrWrong:
          'INCORRECT. When `--enable-private-endpoint` is enabled, the GKE control plane is hosted on its private `/28` IP (`172.16.0.32/28`) or Connect Gateway / DNS endpoint, not on `199.36.153.8/30` unless using the DNS-based control plane endpoint.'
      },
      {
        id: 'D',
        text: 'Create an External Passthrough Network Load Balancer in front of `172.16.0.34`.',
        whyRightOrWrong:
          'INCORRECT. You cannot place a customer load balancer directly on Google’s managed GKE control plane tenant VPC.'
      },
      {
        id: 'E',
        text: 'Enable GKE `ip-masq-agent` on the cluster nodes.',
        whyRightOrWrong:
          'INCORRECT. `ip-masq-agent` affects Pod egress traffic, not `kubectl` traffic to the GKE API server.'
      }
    ],
    correctAnswers: ['A', 'B'],
    coreExplanation:
      'To reach a Private GKE cluster’s private `/28` control plane endpoint from on-premises over HA VPN/Interconnect: (1) Authorize the on-premises CIDR (`192.168.10.0/24`) in **Control Plane Authorized Networks** (and enable `--enable-master-global-access` if the VPN/Interconnect is in a different region than the GKE cluster), (2) Enable `--export-custom-routes` on the GKE VPC Peering connection so the GKE control plane learns the on-premises BGP route, and (3) Advertise the GKE control plane `/28` range (`172.16.0.32/28`) via **Cloud Router Custom Route Advertisement** to on-premises.',
    examTrapAlert:
      'Cloud Router NEVER automatically advertises peered VPC subnets (such as the GKE control plane `/28` or Cloud SQL PSA `/24`)! You MUST add them as **Custom Advertised Routes** on Cloud Router!',
    keyTakeaway:
      'On-Prem to Private GKE `/28` = Control Plane Authorized Networks + `--enable-master-global-access` + Export Custom Routes on Peering + Custom Advertised Route on Cloud Router.'
  },
  {
    id: 'pcne-q28',
    domainId: 'domain-2',
    topic: 'Policy-Based Routes vs. Subnet Routes (East-West Traffic Inspection)',
    difficulty: 'Expert',
    question:
      'You have two subnets (`subnet-app` `10.1.1.0/24` and `subnet-db` `10.1.2.0/24`) inside the SAME `prod-vpc` network in `us-central1`. A new regulatory mandate requires that all traffic from `subnet-app` (`10.1.1.0/24`) to `subnet-db` (`10.1.2.0/24`) must be inspected by a stateful Next-Generation Firewall (NGFW) appliance sitting behind an Internal Passthrough Network Load Balancer (`10.1.99.10`) before reaching `subnet-db`. You cannot move `subnet-app` and `subnet-db` into separate VPCs. How can you force traffic between these two subnets in the same VPC through the NGFW Internal Load Balancer?',
    options: [
      {
        id: 'A',
        text: 'Create a custom static route for `10.1.2.0/24` with priority `0` and `--next-hop-ilb=10.1.99.10`.',
        whyRightOrWrong:
          'INCORRECT. GCP does not allow creating a custom static route that matches or is broader than a local VPC subnet CIDR (`10.1.2.0/24`); local subnet routes always beat custom static routes.'
      },
      {
        id: 'B',
        text: 'Create two `/25` static routes (`10.1.2.0/25` and `10.1.2.128/25`) with `--next-hop-ilb=10.1.99.10` to beat the `/24` subnet route via Longest Prefix Match.',
        whyRightOrWrong:
          'INCORRECT. In GCP VPCs, you CANNOT create static routes whose destination is a sub-range (`/25`) of an existing local subnet route (`/24`)—GCP rejects the route creation with an invalid range overlap error!'
      },
      {
        id: 'C',
        text: 'Create a Network Connectivity Policy-Based Route (PBR) matching source range `10.1.1.0/24` and destination range `10.1.2.0/24` with `--next-hop-ilb-ip=10.1.99.10` (and exempt the NGFW tag/subnet to prevent routing loops).',
        whyRightOrWrong:
          'CORRECT! Policy-Based Routes (PBRs) are evaluated BEFORE local subnet routes! By matching `source=10.1.1.0/24` and `destination=10.1.2.0/24` (and applying to VM tags or excluding the NGFW NIC), a Policy-Based Route steers intra-VPC subnet-to-subnet traffic into an Internal Passthrough NLB.'
      },
      {
        id: 'D',
        text: 'Use a Cloud Armor Backend Security Policy between the two subnets.',
        whyRightOrWrong:
          'INCORRECT. Cloud Armor only attaches to External/Regional Application and Proxy Load Balancers, not East-West VM-to-VM subnet routing.'
      }
    ],
    correctAnswers: ['C'],
    coreExplanation:
      'In Google Cloud VPCs, local **Subnet Routes** cannot be overridden by Static Routes (even more-specific `/25` static routes are rejected if they fall inside a `/24` subnet). However, **Policy-Based Routes (PBRs)** have the highest precedence in the VPC routing order—even higher than local subnet routes! A PBR can match on both `source-range` and `destination-range` (and target tags) to redirect traffic to an Internal Passthrough NLB (`--next-hop-ilb-ip`).',
    examTrapAlert:
      'In AWS/Azure you might use more-specific `/25` static routes, or UDRs, to override a `/24` subnet route. In GCP, static routes CANNOT overlap a local subnet—you MUST use a **Policy-Based Route (PBR)**!',
    keyTakeaway:
      'Policy-Based Routes (PBR) = The ONLY way to override local VPC subnet routes to steer traffic into an `--next-hop-ilb`!'
  },
  {
    id: 'pcne-q29',
    domainId: 'domain-2',
    topic: 'Cloud NAT Cost Reduction for Cloud Storage / BigQuery Traffic',
    difficulty: 'Moderate',
    question:
      'Your data engineering team runs 100 Compute Engine VMs without external IP addresses in `subnet-analytics` (`us-central1`). You deployed a Cloud NAT gateway in `us-central1` so these VMs could download software updates from the internet. At the end of the month, your billing report shows thousands of dollars in unexpected Cloud NAT data processing and egress charges because the VMs are reading and writing 500 TB of data per month to Cloud Storage (`storage.googleapis.com`) and BigQuery. How should you eliminate the Cloud NAT charges for Cloud Storage and BigQuery traffic while keeping internet access for OS patches?',
    options: [
      {
        id: 'A',
        text: 'Enable Private Google Access (`--enable-private-ip-google-access`) on `subnet-analytics`.',
        whyRightOrWrong:
          'CORRECT! When Private Google Access is enabled on a subnet covered by Cloud NAT, Andromeda SDN automatically routes traffic destined to Google APIs (`*.googleapis.com`) directly over Private Google Access instead of translating it through Cloud NAT—eliminating Cloud NAT per-GB processing charges!'
      },
      {
        id: 'B',
        text: 'Switch Cloud NAT from Dynamic Port Allocation to Static Port Allocation.',
        whyRightOrWrong:
          'INCORRECT. Port allocation mode has zero effect on Cloud NAT per-GB data processing charges.'
      },
      {
        id: 'C',
        text: 'Assign ephemeral external IP addresses to all 100 VMs and delete the Cloud NAT gateway.',
        whyRightOrWrong:
          'INCORRECT. Assigning external IPs violates the private VM security posture and incurs external IP charges.'
      },
      {
        id: 'D',
        text: 'Switch the project’s Network Service Tier from Premium Tier to Standard Tier.',
        whyRightOrWrong:
          'INCORRECT. Network Tier does not stop private VMs from using Cloud NAT when Private Google Access is disabled.'
      }
    ],
    correctAnswers: ['A'],
    coreExplanation:
      'If a subnet has **Cloud NAT** enabled but **Private Google Access (PGA)** disabled, all traffic from private VMs to Google APIs (`storage.googleapis.com`, `bigquery.googleapis.com`) must pass through the Cloud NAT gateway, incurring per-GB Cloud NAT data processing fees. Simply enabling **Private Google Access** on the subnet causes GCP to bypass Cloud NAT for all Google API traffic automatically!',
    examTrapAlert:
      'High Cloud NAT bill caused by Cloud Storage / BigQuery / Artifact Registry traffic = Enable **Private Google Access** on the subnet!',
    keyTakeaway:
      'Always enable Private Google Access (`--enable-private-ip-google-access`) on subnets that use Cloud NAT to avoid paying NAT processing fees for Google API traffic.'
  },
  {
    id: 'pcne-q30',
    domainId: 'domain-2',
    topic: 'Private NAT for Overlapping IP Ranges Across NCC Spokes',
    difficulty: 'Hard',
    question:
      'Two business units in your organization (`bu1-vpc` and `bu2-vpc`) are connected as VPC spokes to a Network Connectivity Center (NCC) Hub. Both `bu1-vpc` and `bu2-vpc` have a subnet configured with the overlapping CIDR `10.100.0.0/20`, so neither VPC can export `10.100.0.0/20` to the NCC Hub. VMs in `bu1-vpc`’s `10.100.0.0/20` subnet need to initiate connections to VMs in a non-overlapping subnet (`10.200.0.0/24`) in `bu2-vpc`. What should you configure in `bu1-vpc` so its VMs in `10.100.0.0/20` can communicate with `10.200.0.0/24` in `bu2-vpc` over NCC?',
    options: [
      {
        id: 'A',
        text: 'Create a non-overlapping subnet with `--purpose=PRIVATE_NAT` in `bu1-vpc` and configure a Cloud NAT gateway of type `PRIVATE` on a Cloud Router in `bu1-vpc` covering `10.100.0.0/20` for NCC hub traffic.',
        whyRightOrWrong:
          'CORRECT. Cloud NAT’s **Private NAT** feature translates source IPs from an overlapping subnet (`10.100.0.0/20`) into a non-overlapping `--purpose=PRIVATE_NAT` subnet range when routing across Network Connectivity Center (NCC) spokes (or Hybrid spokes).'
      },
      {
        id: 'B',
        text: 'Configure Public Cloud NAT with `AUTO_ONLY` external IPs in `bu1-vpc`.',
        whyRightOrWrong:
          'INCORRECT. Public Cloud NAT only translates traffic exiting to the public internet (`default-internet-gateway`), not RFC 1918 traffic routed across NCC spokes.'
      },
      {
        id: 'C',
        text: 'Enable Endpoint-Independent Mapping on the NCC Hub.',
        whyRightOrWrong:
          'INCORRECT. EIM is a Public Cloud NAT setting, not an NCC overlapping-subnet translation feature.'
      },
      {
        id: 'D',
        text: 'Force export `10.100.0.0/20` from both `bu1-vpc` and `bu2-vpc` into the NCC Hub using `--allow-subnet-overlap`.',
        whyRightOrWrong:
          'INCORRECT. An NCC Hub rejects overlapping subnet prefixes; you must exclude the overlapping subnet from export and translate it via Private NAT.'
      }
    ],
    correctAnswers: ['A'],
    coreExplanation:
      '**Private NAT** allows VMs in an overlapping RFC 1918 subnet to initiate outbound connections to non-overlapping subnets across **Network Connectivity Center (NCC)** spokes (VPC spokes or Hybrid VPN/Interconnect spokes). You allocate a non-overlapping subnet with `--purpose=PRIVATE_NAT` and configure a Cloud NAT gateway with `--type=PRIVATE`.',
    examTrapAlert:
      'Private NAT vs. PSC: Use **Private NAT** when VMs in an overlapping subnet need broad outbound Layer 3 access to non-overlapping subnets across NCC spokes. Use **Private Service Connect (PSC)** when publishing/consuming a specific load-balanced service across overlapping VPCs.',
    keyTakeaway:
      'Private NAT requires a dedicated subnet (`--purpose=PRIVATE_NAT`) + Cloud NAT (`--type=PRIVATE`) + Network Connectivity Center.'
  },
  {
    id: 'pcne-q31',
    domainId: 'domain-3',
    topic: 'Cloud CDN Signed Cookies vs. Signed URLs for HLS Video Streaming',
    difficulty: 'Moderate',
    question:
      'Your media platform streams live and on-demand HTTP Live Streaming (HLS) video via a Global External Application Load Balancer with Cloud CDN enabled. Each video stream consists of a master `.m3u8` manifest file that dynamically references over 1,200 individual `.ts` video segment files under `https://cdn.media.example.com/streams/event-42/*`. Only paying subscribers should be able to fetch the manifest and `.ts` segments, and you must not modify the internal relative URLs inside the `.m3u8` manifest files. What should you configure?',
    options: [
      {
        id: 'A',
        text: 'Configure Cloud CDN Signed URLs for every `.ts` segment file.',
        whyRightOrWrong:
          'INCORRECT. Using Signed URLs for HLS streaming would require dynamically rewriting the `.m3u8` manifest file for every single viewer to append a unique cryptographic signature query parameter to all 1,200 `.ts` URLs—violating the requirement not to modify the manifest files.'
      },
      {
        id: 'B',
        text: 'Configure Cloud CDN Signed Cookies scoped to the URL prefix `https://cdn.media.example.com/streams/event-42/`.',
        whyRightOrWrong:
          'CORRECT! A single Cloud CDN **Signed Cookie** scoped to the URL prefix `https://cdn.media.example.com/streams/event-42/` authorizes the subscriber’s browser/player to request all 1,200+ `.ts` segments under that prefix without altering any URLs in the `.m3u8` manifest!'
      },
      {
        id: 'C',
        text: 'Enable Identity-Aware Proxy (IAP) on the Cloud Storage backend bucket.',
        whyRightOrWrong:
          'INCORRECT. IAP is designed for enterprise Google identity authentication on backend services, not high-scale consumer HLS media segment caching on Cloud CDN.'
      },
      {
        id: 'D',
        text: 'Set Cloud CDN cache mode to `FORCE_CACHE_ALL` and use HTTP Basic Auth.',
        whyRightOrWrong:
          'INCORRECT. `FORCE_CACHE_ALL` would bypass authentication on subsequent cache hits and serve protected video segments to unauthenticated users.'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'Cloud CDN supports both **Signed URLs** and **Signed Cookies** to authorize access to cached private content. Use **Signed URLs** for individual standalone file downloads (e.g., a PDF invoice). Use **Signed Cookies** when a user needs access to a collection of related files under a common URL prefix (such as HLS/DASH video streaming with hundreds of `.ts`/`.m4s` segments) without rewriting manifests.',
    examTrapAlert:
      'HLS/DASH video streaming with hundreds of segment files + Cloud CDN = Always choose **Signed Cookies** over Signed URLs!',
    keyTakeaway:
      '1 file = Signed URL. Many files / HLS video segments under a URL prefix = **Signed Cookies**.'
  },
  {
    id: 'pcne-q32',
    domainId: 'domain-3',
    topic: 'Internal Passthrough NLB Failover Policy & Drain Connections',
    difficulty: 'Hard',
    question:
      'You are configuring an Internal Passthrough Network Load Balancer in front of an active-passive pair of stateful database proxy VMs (`vm-primary` and `vm-standby`). All traffic must go exclusively to `vm-primary` as long as it is healthy. If `vm-primary` fails health checks, traffic must automatically shift to `vm-standby`. Later, when `vm-primary` recovers and passes health checks again, you must prevent existing active TCP connections on `vm-standby` from being abruptly reset during failback. Which two settings should you configure on the backend service? (Choose two.)',
    isMultiSelect: true,
    selectCount: 2,
    options: [
      {
        id: 'A',
        text: 'Add `vm-primary`’s instance group without `--failover`, and add `vm-standby`’s instance group with the `--failover` flag enabled and `--failover-ratio=1.0`.',
        whyRightOrWrong:
          'CORRECT. Marking `vm-standby` as a `--failover` backend ensures it receives traffic ONLY when the number of healthy primary backends drops below the failover ratio.'
      },
      {
        id: 'B',
        text: 'Ensure `--no-Drop-traffic-if-unhealthy` is replaced by `--connection-draining-timeout=300` and keep `--no-disable-connection-drain-on-failover` (connection draining on failover/failback enabled).',
        whyRightOrWrong:
          'CORRECT. Enabling connection draining on failover and failback (`--connection-draining-timeout`) allows existing TCP sessions on `vm-standby` to remain open and finish gracefully when `vm-primary` becomes healthy again, while only new connections route to `vm-primary`.'
      },
      {
        id: 'C',
        text: 'Disable connection draining on failback (`--disable-connection-drain-on-failover`) so all packets immediately switch back to `vm-primary`.',
        whyRightOrWrong:
          'INCORRECT. Disabling connection drain on failover/failback immediately routes packets of existing TCP sessions back to `vm-primary`, which has no state for those sessions and will send a TCP `RST`!'
      },
      {
        id: 'D',
        text: 'Configure a URL Map with weighted traffic splitting (`100%` to `vm-primary`, `0%` to `vm-standby`).',
        whyRightOrWrong:
          'INCORRECT. Internal Passthrough Network Load Balancers do not use URL Maps.'
      },
      {
        id: 'E',
        text: 'Enable Cloud CDN on the Internal Passthrough Network Load Balancer.',
        whyRightOrWrong:
          'INCORRECT. Cloud CDN is only supported on External Application Load Balancers.'
      }
    ],
    correctAnswers: ['A', 'B'],
    coreExplanation:
      'Internal Passthrough Network Load Balancers support native **Active-Passive Failover Policies** using Primary and Failover (`--failover`) backend groups. By default, connection draining on failover and failback is enabled so that when the primary backend recovers (failback), existing established TCP flows on the backup VM continue until closed (or until `--connection-draining-timeout` expires), while new TCP flows go to the recovered primary VM.',
    examTrapAlert:
      'For stateful TCP workloads (databases), keep connection draining enabled on failback so existing TCP connections aren’t mid-stream redirected to a freshly booted primary that lacks TCP state! (Conversely, for stateless UDP/IPsec routers where you want instant cutback, disable connection draining on failover).',
    keyTakeaway:
      'Internal Passthrough NLB Active/Passive = Primary group + `--failover` backup group + `--connection-draining-timeout`.'
  },
  {
    id: 'pcne-q33',
    domainId: 'domain-3',
    topic: 'GKE Container-Native Load Balancing (Zonal NEGs `GCE_VM_IP_PORT`)',
    difficulty: 'Moderate',
    question:
      'When exposing a GKE Deployment via a Kubernetes `Ingress` (or Gateway API) backed by a Google Cloud Application Load Balancer, why is Container-Native Load Balancing (`cloud.google.com/neg: \'{"ingress": true}\'` using `GCE_VM_IP_PORT` Zonal NEGs) recommended over traditional NodePort (`InstanceGroup`) load balancing?',
    options: [
      {
        id: 'A',
        text: 'It allows the Application Load Balancer to send traffic and health checks directly to the Pod IP addresses (`GCE_VM_IP_PORT`), eliminating the extra network hop through `kube-proxy` `iptables` on a random GKE node and preserving visibility of each Pod’s latency and health.',
        whyRightOrWrong:
          'CORRECT! With Zonal NEGs (`GCE_VM_IP_PORT`), the load balancer knows the exact Alias IP of every Pod in the Service. It routes directly to the node hosting that Pod and directly to the Pod IP—preventing double-hop routing, imbalanced load distribution, and blackhole traffic to nodes that don’t run the Pod.'
      },
      {
        id: 'B',
        text: 'It eliminates the need for a VPC-native (Alias IP) cluster and works only on Legacy routes-based clusters.',
        whyRightOrWrong:
          'INCORRECT. Container-Native Load Balancing (`GCE_VM_IP_PORT` NEGs) REQUIRES a VPC-native (Alias IP) cluster because the load balancer routes directly to VPC-routable Pod Alias IPs!'
      },
      {
        id: 'C',
        text: 'It bypasses Google Cloud Health Check probers (`35.191.0.0/16` and `130.211.0.0/22`) so no firewall rules are needed.',
        whyRightOrWrong:
          'INCORRECT. Health check probers still probe the Pod IPs directly on their container port, requiring ingress firewall rules from `35.191.0.0/16` and `130.211.0.0/22`.'
      },
      {
        id: 'D',
        text: 'It converts the Application Load Balancer into a Layer 4 Passthrough Load Balancer.',
        whyRightOrWrong:
          'INCORRECT. The Application Load Balancer remains an L7 proxy; it simply targets Pod IPs instead of NodePorts.'
      }
    ],
    correctAnswers: ['A'],
    coreExplanation:
      'In traditional `InstanceGroup` (NodePort) load balancing, the LB sends traffic to any node in the cluster on `NodePort 30000+`, and `kube-proxy` `iptables` SNATs and forwards the packet to whichever node actually runs the Pod (causing a "double hop" and hiding real client/latency metrics). **Container-Native Load Balancing** uses `GCE_VM_IP_PORT` Zonal NEGs to send traffic and health checks directly to Pod Alias IPs (single hop!).',
    examTrapAlert:
      'Container-Native Load Balancing (`GCE_VM_IP_PORT` Zonal NEGs) is enabled by default on modern VPC-native GKE clusters and requires VPC-native Alias IPs!',
    keyTakeaway:
      'GKE Container-Native LB = `GCE_VM_IP_PORT` Zonal NEG -> Direct L7 LB-to-Pod routing (No `NodePort` double hop).'
  },
  {
    id: 'pcne-q34',
    domainId: 'domain-4',
    topic: 'Partner Interconnect Layer 2 vs. Layer 3 & Google ASN 16550',
    difficulty: 'Hard',
    question:
      'You are ordering a 2 Gbps Partner Interconnect connection in a remote office where your company does not have a presence in a Google colocation facility. Your service provider informs you that they will provide a Layer 3 Partner Interconnect service (where the service provider’s edge router terminates the BGP session with Google Cloud). When you create the Cloud Router in your GCP project to attach the Partner Interconnect VLAN attachment, which Autonomous System Number (ASN) must you configure on your Cloud Router?',
    options: [
      {
        id: 'A',
        text: 'Any private 16-bit ASN (`64512` to `65534`) that does not match your on-premises ASN.',
        whyRightOrWrong:
          'INCORRECT. A private ASN is required for Dedicated Interconnect, HA VPN, and Layer 2 Partner Interconnect, but NOT for Partner Interconnect.'
      },
      {
        id: 'B',
        text: 'Google’s required public ASN `16550`.',
        whyRightOrWrong:
          'CORRECT! For ALL **Partner Interconnect** VLAN attachments (both Layer 2 and Layer 3), Google Cloud requires your Cloud Router to be configured with ASN **`16550`**!'
      },
      {
        id: 'C',
        text: 'Google’s main public backbone ASN `15169`.',
        whyRightOrWrong:
          'INCORRECT. `15169` is Google’s public internet peering ASN, not allowed on Cloud Router.'
      },
      {
        id: 'D',
        text: 'The service provider’s public ASN.',
        whyRightOrWrong:
          'INCORRECT. eBGP requires the Cloud Router ASN and the peer ASN to be different; your Cloud Router must use `16550`.'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'When creating a Cloud Router for **Partner Interconnect**, you MUST set the Cloud Router’s ASN to **`16550`** (`--asn=16550`). By contrast, for **Dedicated Interconnect** and **HA VPN**, you configure your Cloud Router with a private ASN (`64512–65534` or 32-bit `4200000000–4294967294`).',
    examTrapAlert:
      'Memorize `ASN 16550` = **Partner Interconnect** Cloud Router ASN! Private ASN (`64512–65534`) = **Dedicated Interconnect / HA VPN**.',
    keyTakeaway:
      'Partner Interconnect ALWAYS requires Cloud Router `--asn=16550`.'
  },
  {
    id: 'pcne-q35',
    domainId: 'domain-4',
    topic: 'Cloud Router BFD (Bidirectional Forwarding Detection) & Graceful Restart',
    difficulty: 'Moderate',
    question:
      'During an unplanned fiber cut inside your carrier’s Layer 2 metro network between your on-premises router and Google Cloud’s Dedicated Interconnect edge, the physical optical interface on your on-premises router stayed `UP` (link light remained green), so traffic continued blackholing for nearly 60 seconds until the BGP hold timer expired. How can you reduce the link failure detection and route failover time to approximately 5 seconds without risking unstable BGP flapping?',
    options: [
      {
        id: 'A',
        text: 'Enable Bidirectional Forwarding Detection (BFD) in `ACTIVE` mode on both the Cloud Router BGP peer and your on-premises router (e.g., 1000ms interval, multiplier 5), and enable BGP Graceful Restart.',
        whyRightOrWrong:
          'CORRECT. BFD sends lightweight control packets every 1000ms (`1s * 5 = 5 seconds` detection time) independent of L1 optical link state and the 60-second BGP hold timer, triggering rapid failover to the redundant Interconnect link.'
      },
      {
        id: 'B',
        text: 'Reduce the Cloud Router BGP Hold Timer to 1 second and Keepalive Timer to 0.3 seconds.',
        whyRightOrWrong:
          'INCORRECT. Cloud Router minimum BGP keepalive timer is 20 seconds (hold time 60 seconds); sub-second/5-second detection requires BFD.'
      },
      {
        id: 'C',
        text: 'Convert the Dedicated Interconnect from dynamic BGP routing to static routes.',
        whyRightOrWrong:
          'INCORRECT. Dedicated Interconnect requires Cloud Router (BGP) and does not support static routing without BGP.'
      },
      {
        id: 'D',
        text: 'Enable MACsec on the Dedicated Interconnect.',
        whyRightOrWrong:
          'INCORRECT. MACsec is Layer 2 link encryption, not a Layer 3 path-liveness failover protocol.'
      }
    ],
    correctAnswers: ['A'],
    coreExplanation:
      'Cloud Router’s default BGP timers are `20s keepalive / 60s hold time`. When an intermediate Layer 2 switch or carrier circuit fails without dropping the physical optical carrier light on the router port, BGP waits the full 60s hold time before tearing down the session. Enabling **BFD (Bidirectional Forwarding Detection)** on the BGP peer detects forwarding-plane failures in **~5 seconds** (`1000ms * 5`).',
    examTrapAlert:
      '60-second failover delay on Cloud Interconnect or HA VPN = Enable **BFD (Bidirectional Forwarding Detection)** on the BGP session!',
    keyTakeaway:
      'Default BGP Hold Timer = 60s. With BFD (`1000ms` x `5`) = ~5s failure detection.'
  },
  {
    id: 'pcne-q36',
    domainId: 'domain-4',
    topic: 'Scaling HA VPN Throughput Beyond 3 Gbps via ECMP Tunnels',
    difficulty: 'Moderate',
    question:
      'Your company connects to Google Cloud using HA VPN over the internet because Cloud Interconnect is not yet available at your facility. A single IPsec VPN tunnel is hitting its maximum throughput ceiling of ~3 Gbps (and ~250,000 packets per second), throttling nightly backup jobs that require 10 Gbps of aggregate throughput. How can you increase the aggregate VPN throughput to 12 Gbps before your Dedicated Interconnect is provisioned?',
    options: [
      {
        id: 'A',
        text: 'Increase the MTU of the existing HA VPN tunnel from 1460 bytes to 8896 bytes (Jumbo Frames).',
        whyRightOrWrong:
          'INCORRECT. Cloud VPN traverses the public internet and has a maximum payload MTU of 1460 bytes; jumbo frames (8896 MTU) are only supported inside VPCs or on Dedicated/Partner Interconnect.'
      },
      {
        id: 'B',
        text: 'Create additional HA VPN tunnels (e.g., 4 to 6 active tunnels) between your HA VPN gateway(s) and on-premises VPN gateways with equal BGP MED and AS-Path length so Cloud Router uses Equal-Cost Multi-Path (ECMP) routing across all tunnels.',
        whyRightOrWrong:
          'CORRECT! Each HA VPN tunnel supports up to 3 Gbps. By adding multiple active tunnels with identical BGP attributes (equal MED and AS-Path), Cloud Router automatically load-balances 5-tuple flows across all tunnels via ECMP (`4 tunnels * 3 Gbps = 12 Gbps`).'
      },
      {
        id: 'C',
        text: 'Upgrade the Cloud Router machine type from `e2-medium` to `c3-highcpu-88`.',
        whyRightOrWrong:
          'INCORRECT. Cloud Router is a purely control-plane BGP route speaker (it does not sit in the data path and has no machine type).'
      },
      {
        id: 'D',
        text: 'Switch from IKEv2 to IKEv1.',
        whyRightOrWrong:
          'INCORRECT. IKE version only handles key exchange negotiation and does not raise the 3 Gbps per-tunnel data-plane limit.'
      }
    ],
    correctAnswers: ['B'],
    coreExplanation:
      'Because Cloud Router is only in the BGP control plane and HA VPN gateways scale horizontally in Andromeda, you can scale IPsec throughput linearly beyond 3 Gbps by creating **multiple parallel HA VPN tunnels** with equal BGP route priorities (MED) and AS-Path lengths. GCP automatically performs **ECMP (Equal-Cost Multi-Path)** hashing across up to dozens of equal-cost VPN tunnels.',
    examTrapAlert:
      'Never fall for distractors that say "Upgrade Cloud Router CPU/size"—Cloud Router is NEVER in the data plane! Packets flow directly through Andromeda to the VPN/Interconnect gateway.',
    keyTakeaway:
      '1 HA VPN Tunnel = ~3 Gbps. Scale HA VPN bandwidth horizontally by adding parallel tunnels with ECMP (equal BGP MED & AS-Path).'
  },
  {
    id: 'pcne-q37',
    domainId: 'domain-5',
    topic: 'Network Intelligence Center: Firewall Insights Shadowed Rules',
    difficulty: 'Moderate',
    question:
      'During a security audit, you create a new VPC firewall rule named `deny-compromised-subnet` at Priority `1000` to `DENY` ingress traffic on `tcp:443` from `10.50.10.0/24`. However, VMs in `10.50.10.0/24` are STILL able to connect to your web servers on `tcp:443`! Which Network Intelligence Center module will automatically identify why `deny-compromised-subnet` is never being triggered, and what is the most likely root cause?',
    options: [
      {
        id: 'A',
        text: 'Firewall Insights; `deny-compromised-subnet` (Priority `1000`) is **shadowed** by an existing broader `ALLOW` rule (e.g., `allow-all-internal` from `10.0.0.0/8` on `tcp:443`) configured at a higher precedence such as Priority `500`.',
        whyRightOrWrong:
          'CORRECT! In GCP Firewall Rules, Longest Prefix Match does NOT apply—firewall rules are evaluated strictly by **Priority number (`0` to `65535`)**! A Priority `500` rule allowing `10.0.0.0/8` matches and permits `10.50.10.0/24` before Priority `1000` is ever evaluated. **Firewall Insights** flags this as a **Shadowed Rule**.'
      },
      {
        id: 'B',
        text: 'Performance Dashboard; the firewall rule takes 24 hours to propagate across regions.',
        whyRightOrWrong:
          'INCORRECT. Firewall rules propagate in seconds, and Performance Dashboard measures latency and packet loss.'
      },
      {
        id: 'C',
        text: 'Network Topology; VPC firewall rules evaluate `ALLOW` rules before `DENY` rules regardless of priority.',
        whyRightOrWrong:
          'INCORRECT. At equal priority, `DENY` beats `ALLOW`, and across different priorities, lower priority number (`500` vs `1000`) always wins.'
      },
      {
        id: 'D',
        text: 'VPC Flow Logs; `10.50.10.0/24` is using Longest Prefix Match to bypass Priority `1000`.',
        whyRightOrWrong:
          'INCORRECT. Longest Prefix Match applies to **VPC Routes**, NEVER to **VPC Firewall Rules**! Firewall rules only evaluate by Priority (`0–65535`).'
      }
    ],
    correctAnswers: ['A'],
    coreExplanation:
      'A critical distinction on the PCNE exam: **VPC Routes** use Longest Prefix Match first (`10.50.10.0/24` beats `10.0.0.0/8` regardless of priority), whereas **VPC Firewall Rules** ignore prefix length and evaluate strictly in **numerical Priority order (`0` to `65535`)**! If Rule A at Priority `500` allows `10.0.0.0/8` and Rule B at Priority `1000` denies `10.50.10.0/24`, Rule B is completely unreachable (**Shadowed**). **Firewall Insights** in Network Intelligence Center automatically detects shadowed rules.',
    examTrapAlert:
      'Routes = Longest Prefix Match first, then Priority. Firewall Rules = Priority (`0–65535`) ONLY (Never Longest Prefix Match)!',
    keyTakeaway:
      'Firewall Insights detects **Shadowed Rules**, **Overly Permissive Rules**, and **Zero-Hit Rules**.'
  },
  {
    id: 'pcne-q38',
    domainId: 'domain-5',
    topic: 'VPC Flow Logs Cost & Volume Optimization',
    difficulty: 'Moderate',
    question:
      'You have enabled VPC Flow Logs across 30 high-traffic subnets to monitor external connections made to TCP port `443`. Your Cloud Logging bill has increased significantly because VPC Flow Logs are capturing millions of internal East-West health check and microservice packets every 5 seconds with full VM metadata. Which combination of VPC Flow Log settings will drastically reduce Cloud Logging ingestion volume while retaining visibility into TCP port `443` flows?',
    options: [
      {
        id: 'A',
        text: 'Increase the aggregation interval (e.g., from `INTERVAL_5_SEC` to `INTERVAL_5_MIN`), lower the sampling rate (e.g., `0.1`), set metadata to `EXCLUDE_ALL_METADATA`, and configure a filter expression (`--logging-filter-expr="dest_port == 443"`).',
        whyRightOrWrong:
          'CORRECT! All four native VPC Flow Log controls directly reduce log record count and byte size before logs are ingested into Cloud Logging.'
      },
      {
        id: 'B',
        text: 'Decrease the aggregation interval to `INTERVAL_5_SEC`, set sampling rate to `1.0`, and enable Packet Mirroring instead.',
        whyRightOrWrong:
          'INCORRECT. `INTERVAL_5_SEC` and `1.0` (100%) maximize log volume and cost.'
      },
      {
        id: 'C',
        text: 'Disable VPC Flow Logs and enable Cloud CDN logging.',
        whyRightOrWrong:
          'INCORRECT. Cloud CDN logging only logs HTTP requests at the External ALB edge, not subnet-level VM flows.'
      },
      {
        id: 'D',
        text: 'Change the VPC routing mode from Global to Regional.',
        whyRightOrWrong:
          'INCORRECT. Dynamic routing mode has no effect on VPC Flow Log volume.'
      }
    ],
    correctAnswers: ['A'],
    coreExplanation:
      'To reduce VPC Flow Logs ingestion cost in Cloud Logging, use the 4 subnet-level tuning parameters: (1) **Aggregation Interval** (`INTERVAL_5_SEC` -> `INTERVAL_5_MIN` or `INTERVAL_15_MIN` aggregates packets of a flow into a single log entry), (2) **Sampling Rate** (`--logging-flow-sampling=0.1`), (3) **Metadata** (`--logging-metadata=EXCLUDE_ALL_METADATA` or `CUSTOM_METADATA`), and (4) **Log Filtering** (`--logging-filter-expr`).',
    examTrapAlert:
      'Increasing the aggregation interval (e.g., `5 sec` -> `5 min` or `15 min`) REDUCES log volume because more packets from the same 5-tuple flow are summarized into a single log entry!',
    keyTakeaway:
      'Lower VPC Flow Log Cost = Longer Aggregation Interval (`5_MIN` / `15_MIN`) + Lower Sampling Rate + Exclude Metadata + CEL Filter Expression.'
  },
  {
    id: 'pcne-q39',
    domainId: 'domain-3',
    topic: 'Google Cloud Network Service Tiers: Premium Tier vs. Standard Tier',
    difficulty: 'Moderate',
    question:
      'A gaming startup runs all its workloads in a single region (`us-central1`) serving users located exclusively inside the central United States. They want to reduce outbound internet egress costs by 25–30% and use a Regional External Application Load Balancer. Which Network Service Tier should they select, and how does traffic routing differ between the two tiers?',
    options: [
      {
        id: 'A',
        text: 'Select **Standard Tier**. Traffic enters and exits Google’s network at the peering point closest to the GCP region (`us-central1`) where the workload runs (transiting the public ISP internet for most of the journey), and only supports regional load balancing VIPs.',
        whyRightOrWrong:
          'CORRECT! **Standard Tier** uses cold-potato/ISP transit routing (entering/exiting Google’s fiber at the GCP region hosting the VM) at a lower egress price and uses Regional External IPs. **Premium Tier** (default) uses Google’s global private fiber backbone from the PoP closest to the end user and is required for Global Anycast Load Balancers and Cloud CDN global edge distribution.'
      },
      {
        id: 'B',
        text: 'Select **Standard Tier**, which provides a Global Anycast IP address and routes traffic over Google’s private backbone from 180+ global edge PoPs.',
        whyRightOrWrong:
          'INCORRECT. Global Anycast IPs and global edge PoP cold-potato routing over Google’s backbone are features of **Premium Tier**.'
      },
      {
        id: 'C',
        text: 'Select **Premium Tier**, because Regional External Application Load Balancers cannot use Standard Tier.',
        whyRightOrWrong:
          'INCORRECT. Regional External Application Load Balancers and Regional Passthrough NLBs support both Premium and Standard Tier.'
      },
      {
        id: 'D',
        text: 'Select **Standard Tier** and enable Cross-Region Failover on the Load Balancer.',
        whyRightOrWrong:
          'INCORRECT. Cross-region backend failover on an External Load Balancer requires a Global Anycast VIP, which is only available in **Premium Tier**.'
      }
    ],
    correctAnswers: ['A'],
    coreExplanation:
      '**Premium Tier** routes user traffic onto Google’s low-latency global fiber backbone at the Point of Presence (PoP) closest to the user and is required for Global External Load Balancers (Anycast VIPs) and multi-region backend failover. **Standard Tier** delivers cost savings for single-region workloads by routing traffic over the public internet (ISP networks) to/from the peering point nearest the GCP region where the resource resides, and uses Regional VIPs.',
    examTrapAlert:
      'Need Global Anycast IP or Multi-Region Backend Failover? Must use **Premium Tier**. Single-region workload optimizing egress cost? Use **Standard Tier**.',
    keyTakeaway:
      'Premium Tier = Global Anycast VIP + Google Global Fiber Backbone. Standard Tier = Regional VIP + Public Internet Transit + Lower Egress Cost.'
  },
  {
    id: 'pcne-q40',
    domainId: 'domain-5',
    topic: 'Cloud IDS vs. Cloud Armor vs. VPC Firewall Policies',
    difficulty: 'Moderate',
    question:
      'Your CISO requires an out-of-band intrusion detection solution inside your VPC to detect lateral movement (East-West SMB/RDP exploits, command-and-control callbacks, and malware signatures in packet payloads) between Compute Engine VMs without adding inline proxy latency or risking a single point of failure in the packet path. Which Google Cloud managed service meets this requirement?',
    options: [
      {
        id: 'A',
        text: 'Cloud IDS (Cloud Intrusion Detection System).',
        whyRightOrWrong:
          'CORRECT! Cloud IDS is a Google-managed service (powered by Palo Alto Networks Threat Prevention technologies) that uses GCP Packet Mirroring to inspect a copy of East-West and North-South Layer 7 packet payloads out-of-band with zero inline latency or failure risk.'
      },
      {
        id: 'B',
        text: 'Cloud Armor Adaptive Protection.',
        whyRightOrWrong:
          'INCORRECT. Cloud Armor only inspects North-South traffic entering External/Regional Load Balancers; it never sees East-West VM-to-VM traffic inside a VPC.'
      },
      {
        id: 'C',
        text: 'Global Network Firewall Policies with Threat Intelligence lists.',
        whyRightOrWrong:
          'INCORRECT. Network Firewall Policies inspect IP/Port/FQDN headers and known malicious public IPs inline, but do not perform deep packet payload (L7 signature) intrusion detection on East-West SMB/malware payloads.'
      },
      {
        id: 'D',
        text: 'VPC Flow Logs with 100% sampling.',
        whyRightOrWrong:
          'INCORRECT. VPC Flow Logs only capture 5-tuple header metadata and byte counts, never packet payloads or application exploit signatures.'
      }
    ],
    correctAnswers: ['A'],
    coreExplanation:
      '**Cloud IDS** provides managed, out-of-band deep packet inspection (Layer 7 payload threat detection for malware, spyware, command-and-control, and lateral movement exploits) for both East-West (VM-to-VM) and North-South traffic inside a VPC. Because it relies on **Packet Mirroring** under the hood, it adds zero inline latency to production traffic.',
    examTrapAlert:
      'Out-of-band L7 malware/exploit detection for East-West traffic = **Cloud IDS**. Inline L7 WAF/DDoS at the HTTP Load Balancer = **Cloud Armor**.',
    keyTakeaway:
      'Cloud IDS = Managed Packet Mirroring + Palo Alto Networks Threat Prevention engine (Out-of-band, zero inline latency).'
  }
];
