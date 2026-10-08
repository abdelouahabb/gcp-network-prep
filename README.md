# GCP Professional Cloud Network Engineer (PCNE) — Deep Architecture & Exam Simulator

An interactive, single-page study platform, architecture simulator, and realistic exam engine designed specifically for the **Google Cloud Professional Cloud Network Engineer (PCNE)** certification exam.

---

## ✨ Key Features

### 1. Deep GCP Networking Knowledge Encyclopedia (All 5 Official Domains)
Covers not just surface-level definitions, but how **Google Cloud Andromeda SDN**, **Cloud Router**, **Google Front Ends (GFEs)**, and **Envoy** work under the hood:
- **Domain 1: Designing, Planning, and Prototyping a GCP Network (26%)**
  - Shared VPC (`roles/compute.xpnAdmin`, subnet-level `roles/compute.networkUser`, GKE `roles/container.hostServiceAgentUser`) vs. VPC Network Peering vs. Network Connectivity Center (NCC `STAR` vs. `MESH` topologies)
  - The Private Connectivity Spectrum: Private Google Access (`private.googleapis.com` `199.36.153.8/30` vs. VPC-SC `restricted.googleapis.com` `199.36.153.4/30`), Private Services Access (`servicenetworking-googleapis-com` transitive peering limits), Private Service Connect (PSC Endpoints, PSC Backends, Producer Service Attachments & PSC NAT Subnets), and Direct VPC Egress vs. Serverless VPC Access
  - Hybrid Cloud DNS (`35.199.192.0/19` source range, Inbound Server Policies, Outbound Forwarding Zones, DNS Peering Zones, Split-Horizon DNS, Cloud DNS for GKE)
  - IP Addressing & GKE VPC-Native Alias IP Sizing (`--max-pods-per-node` node slice math, discontinuous multi-Pod CIDR `--additional-pod-ipv4-ranges`, `ip-masq-agent`, Privately Used Public IPs)
- **Domain 2: Implementing Virtual Private Cloud (VPC) Instances (21%)**
  - Deterministic VPC Route Selection Algorithm (Policy-Based Routes $\rightarrow$ Subnet Routes $\rightarrow$ Longest Prefix Match $\rightarrow$ AS-Path Length $\rightarrow$ Priority / BGP MED + Inter-Region Penalty)
  - Multi-NIC Network Virtual Appliances (NVAs) with Internal Passthrough NLB (`--next-hop-ilb`) and Symmetric Hashing
  - Cloud NAT (Dynamic Port Allocation, Static Port Allocation, Endpoint-Independent Mapping conflicts, `DROPPED_SENT_PACKET` vs. `OUT_OF_RESOURCES`, and Private NAT for overlapping NCC spokes)
- **Domain 3: Configuring Managed Network Services (23%)**
  - Complete Google Cloud Load Balancer Decision Matrix (Global vs. Regional, Proxy [GFE/Envoy] vs. Passthrough [Maglev/Andromeda Direct Server Return], Proxy-Only Subnets, Client IP preservation)
  - All 6 Network Endpoint Group (NEG) Types (`GCE_VM_IP_PORT`, `SERVERLESS`, `INTERNET_IP_PORT`, Hybrid `NON_GCP_PRIVATE_IP_PORT`, `PRIVATE_SERVICE_CONNECT`)
  - Cloud CDN (`CACHE_ALL_STATIC`, `USE_ORIGIN_HEADERS`, `FORCE_CACHE_ALL`, Custom Cache Keys, Signed Cookies vs. Signed URLs) & Cloud Armor (Edge Security Policies vs. Backend Security Policies)
- **Domain 4: Configuring and Implementing Hybrid and Multi-Cloud Interconnect (16%)**
  - Dedicated Interconnect, Partner Interconnect (`ASN 16550`), and HA VPN **99.9% vs. 99.99% SLA Topologies** (Metros, Edge Availability Domains 1 & 2, Dual HA VPN Interfaces)
  - Cloud Router BGP Deep Dive: Global Dynamic Routing Inter-Region Penalty (`201–9999`), eliminating Asymmetric Routing via MED & AS-Path Prepending, BFD (`~5s` failure detection), and MACsec vs. HA VPN over Cloud Interconnect
- **Domain 5: Managing, Monitoring, and Optimizing Network Operations (14%)**
  - Hierarchical Firewall Policies & Network Firewall Policies (`goto_next` delegation, IAM-governed Secure Tags vs. Classic Network Tags vs. Service Accounts)
  - VPC Flow Logs (Ingress Firewall evaluation order & log volume/cost optimization), Packet Mirroring (`--is-mirroring-collector`), Cloud IDS, Network Intelligence Center (Firewall Insights shadowed rules, Connectivity Tests), and GKE Dataplane V2 (eBPF/Cilium)

---

### 2. Hands-On Interactive Architecture Simulators
- **BGP & VPC Route Selection / Asymmetric Routing Simulator**: Test how `GLOBAL` vs. `REGIONAL` dynamic routing, prefix specificity (`/24` vs. `/16`), BGP MED, Inter-Region Cost Penalty (`+250`), AS-Path Prepending, and Policy-Based Routes affect packet forwarding and trigger stateful firewall asymmetric drops.
- **Hybrid 99.9% vs. 99.99% SLA Topology Validator**: Configure Metros, Edge Availability Domains, GCP Regions, and HA VPN tunnel meshes to verify official SLA eligibility.
- **GKE Alias IP & Cloud NAT Port Sizing Calculator**: Compute maximum GKE nodes before hitting `IP_SPACE_EXHAUSTED` and calculate required static external IPs for Cloud NAT (`64,512` usable ports per IP).
- **Load Balancer Decision Wizard**: Interactive troubleshooter to select the exact GCP Load Balancer, Proxy-Only Subnet requirement, and NEG type.

---

### 3. 40-Question Scenario Exam Simulator
- **Interactive Tutor Mode**: Instant answer checking with detailed explanations for **every single option** (both why the right answer works and why each distractor fails), plus **PCNE Exam Trap Alerts**.
- **Timed Exam Mode (120-Minute Timer)**: Simulates real test conditions with question flagging, a quick-jump question navigator grid, 70% passing benchmark evaluation, and a post-exam Domain Diagnostic Breakdown.
- **Persistent Progress**: Automatically saves your mastered concepts, bookmarked questions, and past exam attempt scores in `localStorage`.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `>= 18.x` and **npm**

### Installation & Local Development
```bash
# Install dependencies
npm install

# Start the development server (http://localhost:5173)
npm run dev
```

### Production Build
```bash
# Build static production bundle into ./dist
npm run build

# Preview the production build locally
npm run preview
```

---

## 📁 Project Structure

```text
gcp-network/
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx                           # Main navigation shell & study dashboard
    ├── index.css                         # Tailwind CSS & dark theme styling
    ├── types.ts                          # TypeScript interfaces
    ├── components/
    │   ├── KnowledgeExplorer.tsx         # Deep GCP architecture encyclopedia & search
    │   ├── InteractiveSimulators.tsx     # 4 interactive networking labs & calculators
    │   ├── ExamSimulator.tsx             # Tutor & Timed 120-min exam assessment engine
    │   └── CheatSheetVault.tsx           # VIPs, ASNs, IAM roles & CLI quick reference
    └── data/
        ├── studyData.ts                  # Comprehensive 5-domain GCP study guide
        ├── examQuestions.ts              # Core PCNE scenario questions (Q1–Q24)
        ├── moreExamQuestions.ts          # Extended PCNE scenario questions (Q25–Q40)
        ├── allQuestions.ts               # Combined 40-question bank export
        └── cheatSheetData.ts             # Mandatory GCP CIDR ranges, ASNs & IAM roles
```
