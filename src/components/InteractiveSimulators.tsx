import React, { useState } from 'react';
import {
  Network,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Calculator,
  Compass,
  ArrowRight,
  GitBranch,
  Layers
} from 'lucide-react';

export const InteractiveSimulators: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bgp' | 'sla' | 'gke-nat' | 'lb-wizard'>('bgp');

  // --- Simulator 1: BGP & Route Selection ---
  const [routingMode, setRoutingMode] = useState<'GLOBAL' | 'REGIONAL'>('GLOBAL');
  const [eastPrefix, setEastPrefix] = useState<'/16' | '/24'>('/16');
  const [westPrefix, setWestPrefix] = useState<'/16' | '/24'>('/16');
  const [eastMed, setEastMed] = useState<number>(100);
  const [westMed, setWestMed] = useState<number>(200);
  const [westAsPrepends, setWestAsPrepends] = useState<number>(0);
  const [hasPbr, setHasPbr] = useState<boolean>(false);

  const interRegionPenalty = 250; // Representative GCP inter-region cost (201-9999)

  // Compute winner for a VM in us-west1 (Remote to Primary us-east4, Local to Backup us-west1)
  const computeWestVmWinner = () => {
    if (hasPbr) {
      return {
        winner: 'Policy-Based Route -> NVA Internal Passthrough NLB',
        reason: 'Policy-Based Routes (Step 0) override ALL Longest Prefix Match, Subnet, and BGP routes!',
        isSymmetric: true
      };
    }
    if (routingMode === 'REGIONAL') {
      return {
        winner: 'us-west1 Backup Link (Local Only)',
        reason: 'In REGIONAL Dynamic Routing mode, Cloud Router in us-east4 NEVER shares its BGP routes with us-west1 VMs!',
        isSymmetric: false
      };
    }
    // Check LPM first
    if (eastPrefix === '/24' && westPrefix === '/16') {
      return {
        winner: 'us-east4 Primary Interconnect (via LPM /24)',
        reason: 'Longest Prefix Match (/24 vs /16) ALWAYS wins before BGP AS-Path, MED, or Inter-Region Penalty!',
        isSymmetric: true
      };
    }
    if (westPrefix === '/24' && eastPrefix === '/16') {
      return {
        winner: 'us-west1 Backup Link (via LPM /24)',
        reason: 'The backup link advertised a more specific /24 prefix! Longest Prefix Match (/24) beats /16 regardless of MED!',
        isSymmetric: false
      };
    }
    // Prefixes are equal; check AS-Path length if learned/compared or effective priority
    const eastEffectiveInWest = eastMed + interRegionPenalty;
    const westEffectiveInWest = westMed + westAsPrepends * 1000;

    if (westEffectiveInWest < eastEffectiveInWest) {
      return {
        winner: 'us-west1 Backup Link (ASYMMETRIC ROUTING TRAP!)',
        reason: `For a VM in us-west1, the remote us-east4 Primary route gets an Inter-Region Cost Penalty (${eastMed} + ${interRegionPenalty} = ${eastEffectiveInWest}). Since local us-west1 MED (${westMed}) < ${eastEffectiveInWest}, us-west1 VMs egress via the Backup link while On-Premises sends ingress via Primary us-east4!`,
        isSymmetric: false
      };
    }
    return {
      winner: 'us-east4 Primary Interconnect (Global Symmetric)',
      reason:
        westAsPrepends > 0
          ? `AS-Path Prepending (+${westAsPrepends} hops) on us-west1 demotes the backup link so all regions prefer us-east4 Primary!`
          : `Local us-west1 Backup MED (${westMed}) is higher than us-east4 Primary + Inter-Region Penalty (${eastEffectiveInWest}), so us-west1 VMs properly traverse the Google backbone to egress via us-east4 Primary!`,
      isSymmetric: true
    };
  };

  const bgpResult = computeWestVmWinner();

  // --- Simulator 2: Hybrid 99.9% vs 99.99% SLA Validator ---
  const [hybridType, setHybridType] = useState<'dedicated' | 'partner' | 'havpn'>('dedicated');
  const [metrosCount, setMetrosCount] = useState<1 | 2>(2);
  const [domainsPerMetro, setDomainsPerMetro] = useState<1 | 2>(2);
  const [gcpRegionsCount, setGcpRegionsCount] = useState<1 | 2>(2);
  const [slaGlobalRouting, setSlaGlobalRouting] = useState<boolean>(true);
  const [haVpnInterfacesUsed, setHaVpnInterfacesUsed] = useState<1 | 2>(2);
  const [haVpnPeerRedundancy, setHaVpnPeerRedundancy] = useState<'single-ip' | 'two-ips-mesh' | 'two-ips-partial'>('two-ips-mesh');

  const evaluateSla = () => {
    if (hybridType === 'havpn') {
      if (haVpnInterfacesUsed === 1) {
        return {
          sla: 'NO SLA (0%)',
          badge: 'red',
          explanation: 'Both Interface 0 and Interface 1 on the Google Cloud HA VPN gateway MUST have active tunnels to qualify for the 99.99% SLA.'
        };
      }
      if (haVpnPeerRedundancy === 'two-ips-partial') {
        return {
          sla: 'NO SLA / Partial Redundancy',
          badge: 'amber',
          explanation: 'When connecting to a TWO_IPS_REDUNDANCY peer VPN gateway (1 device with 2 interfaces), Google requires a 4-tunnel full mesh across both interfaces.'
        };
      }
      return {
        sla: '99.99% SLA Achieved',
        badge: 'emerald',
        explanation: 'Both HA VPN interfaces (Int 0 & Int 1) are actively terminated with full peer redundancy (2 tunnels for SINGLE_IP_INTERNALLY_REDUNDANT or 4 tunnels for TWO_IPS_REDUNDANCY).'
      };
    }

    // Dedicated or Partner Interconnect
    const totalConnections = metrosCount * domainsPerMetro;
    if (domainsPerMetro === 1) {
      return {
        sla: 'NO SLA (Single Edge Availability Domain Fault)',
        badge: 'red',
        explanation: 'Every metro MUST have redundant connections placed in TWO different Edge Availability Domains (Domain 1 and Domain 2). Using only 1 domain per metro fails during scheduled maintenance!'
      };
    }
    if (metrosCount === 2 && domainsPerMetro === 2 && gcpRegionsCount === 2 && slaGlobalRouting) {
      return {
        sla: '99.99% SLA Achieved',
        badge: 'emerald',
        explanation: `4 ${hybridType === 'dedicated' ? 'physical Interconnect connections' : 'VLAN attachments'} across 2 distinct Metros (Edge Domain 1 & Domain 2 in each Metro) connected to 2 GCP Regions with Global Dynamic Routing enabled.`
      };
    }
    return {
      sla: '99.9% SLA Achieved (Missing 99.99% Requirements)',
      badge: 'amber',
      explanation: `You have Domain 1 + Domain 2 redundancy in a Metro (${totalConnections} links), which earns 99.9% SLA. To reach 99.99% SLA, you must have 2 distinct Metros (4 links total), 2 GCP Regions, AND Global Dynamic Routing enabled.`
    };
  };

  const slaResult = evaluateSla();

  // --- Simulator 3: GKE Alias IP & Cloud NAT Calculator ---
  const [nodeSubnetMask, setNodeSubnetMask] = useState<number>(24);
  const [podSecondaryMask, setPodSecondaryMask] = useState<number>(21);
  const [maxPodsPerNode, setMaxPodsPerNode] = useState<number>(110);
  const [natVmCount, setNatVmCount] = useState<number>(150);
  const [natPortsPerVm, setNatPortsPerVm] = useState<number>(1024);

  const getPodSliceMask = (maxPods: number) => {
    if (maxPods <= 8) return 28;
    if (maxPods <= 16) return 27;
    if (maxPods <= 32) return 26;
    if (maxPods <= 64) return 25;
    if (maxPods <= 110) return 24;
    return 23;
  };

  const podSliceMask = getPodSliceMask(maxPodsPerNode);
  const usableNodeIps = Math.pow(2, 32 - nodeSubnetMask) - 4;
  const maxNodesByPodRange = podSecondaryMask <= podSliceMask ? Math.pow(2, podSliceMask - podSecondaryMask) : 0;
  const effectiveMaxNodes = Math.min(usableNodeIps, maxNodesByPodRange);
  const limitingFactor = maxNodesByPodRange < usableNodeIps ? 'Pod Secondary Range (Exam Trap!)' : 'Primary Node Subnet Range';

  const totalNatPortsNeeded = natVmCount * natPortsPerVm;
  const requiredNatIps = Math.ceil(totalNatPortsNeeded / 64512);

  // --- Simulator 4: Load Balancer Decision Wizard ---
  const [lbTrafficType, setLbTrafficType] = useState<'http' | 'tcp-proxy' | 'passthrough'>('http');
  const [lbExposure, setLbExposure] = useState<'external' | 'internal'>('external');
  const [lbScope, setLbScope] = useState<'global' | 'regional'>('global');

  const getLbRecommendation = () => {
    if (lbTrafficType === 'passthrough') {
      if (lbExposure === 'external') {
        return {
          name: 'External Passthrough Network Load Balancer (Maglev)',
          scopeNote: 'Strictly Regional',
          clientIp: 'Preserved natively in L3 IP Header (Direct Server Return)',
          proxySubnet: 'Not used (No proxy)',
          backends: 'Instance Groups or Zonal NEGs (GCE_VM_IP)',
          examTip: 'Use for UDP, ICMP, ESP/GRE, or when backend VMs must terminate raw client mTLS handshake & see native L3 client IP.'
        };
      }
      return {
        name: 'Internal Passthrough Network Load Balancer (Andromeda)',
        scopeNote: 'Regional (with optional Global Access for clients)',
        clientIp: 'Preserved natively in L3 IP Header (Direct Server Return)',
        proxySubnet: 'Not used (No proxy)',
        backends: 'Instance Groups or Zonal NEGs (GCE_VM_IP)',
        examTip: 'The ONLY load balancer that can be used as a VPC Route Next-Hop (--next-hop-ilb) for NVA Firewalls or as a Packet Mirroring Collector (--is-mirroring-collector)!'
      };
    }
    if (lbTrafficType === 'tcp-proxy') {
      if (lbExposure === 'external' && lbScope === 'global') {
        return {
          name: 'Global External Proxy Network Load Balancer (TCP / SSL Proxy)',
          scopeNote: 'Global Anycast VIP (Requires Premium Tier)',
          clientIp: 'Terminated at GFE; preserved via PROXY Protocol v1/v2 header',
          proxySubnet: 'Not required for Global classic/GFE mode',
          backends: 'MIGs, Zonal NEGs (GCE_VM_IP_PORT), Internet NEGs, Hybrid NEGs (NON_GCP_PRIVATE_IP_PORT)',
          examTip: 'Use for non-HTTP TCP/TLS workloads that need global anycast routing, SSL offload at Google Edge, and Cloud Armor DDoS protection.'
        };
      }
      return {
        name: 'Regional Proxy Network Load Balancer (Internal or External Envoy TCP Proxy)',
        scopeNote: 'Regional VIP',
        clientIp: 'Rewritten to Proxy-Only Subnet IP; use PROXY Protocol header',
        proxySubnet: 'REQUIRED (--purpose=REGIONAL_MANAGED_PROXY)',
        backends: 'MIGs, Zonal NEGs, Hybrid NEGs (On-Prem), PSC NEGs',
        examTip: 'Remember to allow BOTH Health Check ranges (35.191.0.0/16, 130.211.0.0/22) AND the Proxy-Only Subnet CIDR on backend ingress firewalls!'
      };
    }
    // HTTP / HTTPS
    if (lbExposure === 'external' && lbScope === 'global') {
      return {
        name: 'Global External Application Load Balancer (GFE / Envoy)',
        scopeNote: 'Global Anycast VIP (Requires Premium Tier)',
        clientIp: 'Passed via X-Forwarded-For HTTP header',
        proxySubnet: 'Not required',
        backends: 'MIGs, Zonal NEGs, Serverless NEGs (Cloud Run), Internet NEGs, Hybrid NEGs (On-Prem), Backend Buckets',
        examTip: 'Supports Cloud CDN + Cloud Armor (Edge & Backend Security Policies) + Cross-Region Backend Failover + URL Maps.'
      };
    }
    if (lbExposure === 'external' && lbScope === 'regional') {
      return {
        name: 'Regional External Application Load Balancer (Envoy)',
        scopeNote: 'Regional VIP (Works in Standard or Premium Tier)',
        clientIp: 'Passed via X-Forwarded-For HTTP header',
        proxySubnet: 'REQUIRED (--purpose=REGIONAL_MANAGED_PROXY)',
        backends: 'MIGs, Zonal NEGs, Serverless NEGs, Hybrid NEGs',
        examTip: 'Choose when compliance requires L7 TLS termination and HTTP routing to remain strictly inside a single region or when using Standard Network Tier.'
      };
    }
    return {
      name: 'Internal Application Load Balancer (Regional or Cross-Region Envoy)',
      scopeNote: 'Internal RFC 1918 VIP',
      clientIp: 'Passed via X-Forwarded-For HTTP header (L3 source is Proxy-Only Subnet)',
      proxySubnet: 'REQUIRED (--purpose=REGIONAL_MANAGED_PROXY)',
      backends: 'MIGs, Zonal NEGs (GKE Container-Native), Serverless NEGs, Hybrid NEGs (On-Prem), PSC NEGs',
      examTip: 'Requires a dedicated Proxy-Only Subnet (/23 or /24 recommended, /26 min) in each active region.'
    };
  };

  const lbRec = getLbRecommendation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 mb-2">
              <Cpu className="w-3.5 h-3.5" /> Interactive GCP Networking Labs
            </span>
            <h2 className="text-2xl font-bold text-white">
              Hands-On Google Cloud Architecture Simulators
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Test the exact algorithms Google Cloud Andromeda, Cloud Router, and GKE use on the PCNE exam.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('bgp')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'bgp'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <GitBranch className="w-4 h-4" /> 1. BGP & Route Selection
            </button>
            <button
              onClick={() => setActiveTab('sla')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'sla'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShieldAlert className="w-4 h-4" /> 2. 99.99% SLA Validator
            </button>
            <button
              onClick={() => setActiveTab('gke-nat')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'gke-nat'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Calculator className="w-4 h-4" /> 3. GKE IP & Cloud NAT Math
            </button>
            <button
              onClick={() => setActiveTab('lb-wizard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'lb-wizard'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Compass className="w-4 h-4" /> 4. Load Balancer Wizard
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: BGP & Route Selection Simulator */}
      {activeTab === 'bgp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-400" />
              Configure Hybrid BGP & VPC Routing Parameters
            </h3>
            <p className="text-xs text-slate-400">
              Scenario: On-Premises (`192.168.0.0/16`) connects to `us-east4` (Primary Interconnect) and `us-west1` (Backup HA VPN). On-Premises always sends ingress traffic into `us-east4`. Watch how a VM in **`us-west1`** chooses its egress path back to On-Premises!
            </p>

            {/* VPC Dynamic Routing Mode */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                VPC Dynamic Routing Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['GLOBAL', 'REGIONAL'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setRoutingMode(mode)}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                      routingMode === mode
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    {mode} Dynamic Routing
                  </button>
                ))}
              </div>
            </div>

            {/* Primary us-east4 settings */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-400">
                  Primary Link: us-east4 Dedicated Interconnect
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300">
                  Remote to us-west1 VM (+250 Penalty)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Advertised Prefix</label>
                  <select
                    value={eastPrefix}
                    onChange={(e) => setEastPrefix(e.target.value as '/16' | '/24')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                  >
                    <option value="/16">192.168.0.0/16</option>
                    <option value="/24">192.168.1.0/24 (More Specific)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Learned BGP MED: <strong className="text-white">{eastMed}</strong>
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={1000}
                    step={50}
                    value={eastMed}
                    onChange={(e) => setEastMed(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Backup us-west1 settings */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-amber-400">
                  Backup Link: us-west1 HA VPN
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                  Local to us-west1 VM (+0 Penalty)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Advertised Prefix</label>
                  <select
                    value={westPrefix}
                    onChange={(e) => setWestPrefix(e.target.value as '/16' | '/24')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="/16">192.168.0.0/16</option>
                    <option value="/24">192.168.1.0/24</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Backup MED: <strong className="text-white">{westMed}</strong>
                  </label>
                  <input
                    type="range"
                    min={100}
                    max={1000}
                    step={50}
                    value={westMed}
                    onChange={(e) => setWestMed(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    AS-Path Prepends: <strong className="text-white">+{westAsPrepends}</strong>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={3}
                    step={1}
                    value={westAsPrepends}
                    onChange={(e) => setWestAsPrepends(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Policy-Based Route Override */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPbr}
                onChange={(e) => setHasPbr(e.target.checked)}
                className="w-4 h-4 accent-blue-500 rounded"
              />
              <span className="text-xs text-slate-200">
                Enable <strong>Policy-Based Route (PBR)</strong> matching source VM to `--next-hop-ilb` (Step 0 Override)
              </span>
            </label>
          </div>

          {/* Right Panel: Live Evaluation Result */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Live Andromeda Route Evaluation (us-west1 VM)</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    bgpResult.isSymmetric
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {bgpResult.isSymmetric ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Symmetric Routing
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" /> Asymmetric Routing Alert!
                    </>
                  )}
                </span>
              </div>

              <div
                className={`p-5 rounded-xl border ${
                  bgpResult.isSymmetric
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-rose-950/30 border-rose-500/40'
                }`}
              >
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Selected Next-Hop for us-west1 VM Egress:
                </div>
                <div className="text-lg font-bold text-white mt-1">{bgpResult.winner}</div>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{bgpResult.reason}</p>
              </div>

              {/* Route Table Comparison inside us-west1 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase">
                  Effective VPC Route Table Seen by a VM in us-west1:
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-bold text-blue-400">us-east4 Primary Route</div>
                    <div className="text-slate-300 mt-1">Prefix: 192.168.x.0{eastPrefix}</div>
                    <div className="text-slate-300">
                      Effective Priority:{' '}
                      <strong className="text-white">
                        {routingMode === 'REGIONAL'
                          ? 'NOT VISIBLE (Regional Mode)'
                          : `${eastMed} (MED) + ${interRegionPenalty} (Inter-Region) = ${eastMed + interRegionPenalty}`}
                      </strong>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-bold text-amber-400">us-west1 Backup Route</div>
                    <div className="text-slate-300 mt-1">Prefix: 192.168.x.0{westPrefix}</div>
                    <div className="text-slate-300">
                      Effective Priority:{' '}
                      <strong className="text-white">
                        {westMed} (Local MED, +0 Penalty)
                      </strong>
                    </div>
                    <div className="text-purple-300 mt-0.5">
                      AS-Path: 65001 {Array(westAsPrepends).fill('65001').join(' ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200">
              <strong>Try the Classic Exam Scenario:</strong> Set Dynamic Routing = <code>GLOBAL</code>, both Prefixes = <code>/16</code>, Primary MED = <code>100</code>, Backup MED = <code>200</code>, Prepends = <code>0</code>. Notice how <code>us-west1</code> VMs pick the Backup link (<code>200 &lt; 350</code>)! Now drag Backup MED to <code>400</code> or AS-Path Prepends to <code>+1</code> to fix the asymmetric routing!
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Hybrid 99.9% vs 99.99% SLA Validator */}
      {activeTab === 'sla' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Hybrid Connectivity SLA Topology Builder
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Select Hybrid Connectivity Technology
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dedicated', label: 'Dedicated Interconnect' },
                  { id: 'partner', label: 'Partner Interconnect' },
                  { id: 'havpn', label: 'HA VPN (IPsec)' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setHybridType(t.id as any)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      hybridType === t.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {hybridType !== 'havpn' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">
                      Number of Distinct Metros (Colos)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2].map((m) => (
                        <button
                          key={m}
                          onClick={() => setMetrosCount(m as 1 | 2)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                            metrosCount === m
                              ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {m} {m === 1 ? 'Metro (e.g. Chicago)' : 'Metros (Chicago + Ashburn)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">
                      Edge Availability Domains per Metro
                    </label>
                    <div className="flex gap-2">
                      {[1, 2].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDomainsPerMetro(d as 1 | 2)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                            domainsPerMetro === d
                              ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {d === 1 ? 'Domain 1 Only' : 'Domain 1 + Domain 2'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">
                      Target GCP Regions
                    </label>
                    <div className="flex gap-2">
                      {[1, 2].map((r) => (
                        <button
                          key={r}
                          onClick={() => setGcpRegionsCount(r as 1 | 2)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                            gcpRegionsCount === r
                              ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {r} GCP {r === 1 ? 'Region' : 'Regions'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">
                      VPC Dynamic Routing Mode
                    </label>
                    <div className="flex gap-2">
                      {[true, false].map((g) => (
                        <button
                          key={String(g)}
                          onClick={() => setSlaGlobalRouting(g)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                            slaGlobalRouting === g
                              ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {g ? 'GLOBAL' : 'REGIONAL'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">
                    Active GCP HA VPN Gateway Interfaces Used
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setHaVpnInterfacesUsed(1)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border ${
                        haVpnInterfacesUsed === 1
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      Only Interface 0 Used
                    </button>
                    <button
                      onClick={() => setHaVpnInterfacesUsed(2)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border ${
                        haVpnInterfacesUsed === 2
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      Both Interface 0 & Interface 1 Used
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">
                    Peer On-Premises Gateway Configuration
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      {
                        id: 'two-ips-mesh',
                        label: 'TWO_IPS_REDUNDANCY with 4 Tunnels (Full Mesh: Int0->P0, Int0->P1, Int1->P0, Int1->P1)'
                      },
                      {
                        id: 'single-ip',
                        label: '2 Separate On-Prem Gateways / SINGLE_IP_INTERNALLY_REDUNDANT with 2 Tunnels (Int0->P0, Int1->P1)'
                      },
                      {
                        id: 'two-ips-partial',
                        label: 'TWO_IPS_REDUNDANCY (Single On-Prem Device) with only 2 Tunnels instead of 4'
                      }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setHaVpnPeerRedundancy(opt.id as any)}
                        className={`py-2.5 px-3 rounded-lg text-left text-xs font-semibold border ${
                          haVpnPeerRedundancy === opt.id
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Official Google Cloud SLA Qualification Result
              </div>
              <div
                className={`p-6 rounded-2xl border ${
                  slaResult.badge === 'emerald'
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : slaResult.badge === 'amber'
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="text-2xl font-extrabold">{slaResult.sla}</div>
                <p className="text-sm mt-2 text-slate-200 leading-relaxed">{slaResult.explanation}</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-1.5">
              <div className="font-bold text-white">Quick Exam Checklist for 99.99% Interconnect SLA:</div>
              <div>• Minimum <strong>4 physical connections / VLAN attachments</strong></div>
              <div>• Placed across <strong>2 distinct Metropolitan Areas</strong> (not 4 in 1 Metro!)</div>
              <div>• Placed in <strong>Edge Availability Domain 1 & Domain 2</strong> in each Metro</div>
              <div>• Terminated in <strong>2 separate GCP Regions</strong> with <strong>Global Dynamic Routing</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GKE Alias IP & Cloud NAT Sizing Calculator */}
      {activeTab === 'gke-nat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              GKE VPC-Native Alias IP & Node Ceiling Calculator
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Primary Subnet CIDR Mask (Nodes): <strong className="text-white">/{nodeSubnetMask}</strong> ({usableNodeIps.toLocaleString()} usable IPs)
                </label>
                <input
                  type="range"
                  min={16}
                  max={28}
                  value={nodeSubnetMask}
                  onChange={(e) => setNodeSubnetMask(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Secondary Subnet CIDR Mask (Pods): <strong className="text-white">/{podSecondaryMask}</strong> ({Math.pow(2, 32 - podSecondaryMask).toLocaleString()} Pod IPs)
                </label>
                <input
                  type="range"
                  min={14}
                  max={24}
                  value={podSecondaryMask}
                  onChange={(e) => setPodSecondaryMask(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  GKE <code>--max-pods-per-node</code>: <strong className="text-white">{maxPodsPerNode} pods</strong> (Reserves a <strong>/{podSliceMask}</strong> = {Math.pow(2, 32 - podSliceMask)} IPs per node!)
                </label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {[16, 32, 64, 110, 256].map((p) => (
                    <button
                      key={p}
                      onClick={() => setMaxPodsPerNode(p)}
                      className={`py-2 rounded-lg text-xs font-bold border ${
                        maxPodsPerNode === p
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {p} {p === 110 ? '(Default)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 uppercase font-semibold">Calculated Cluster Scaling Limit</div>
              <div className="text-2xl font-extrabold text-emerald-400">
                Max {effectiveMaxNodes.toLocaleString()} GKE Nodes
              </div>
              <div className="text-xs text-slate-300">
                • Limited by: <strong className="text-amber-300">{limitingFactor}</strong>
              </div>
              <div className="text-xs text-slate-400">
                • Primary /{nodeSubnetMask} supports {usableNodeIps.toLocaleString()} nodes, while Pod Secondary /{podSecondaryMask} divided into /{podSliceMask} node slices supports <strong>{maxNodesByPodRange.toLocaleString()} nodes</strong>.
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-400" />
              Cloud NAT External IP & Port Exhaustion Calculator
            </h3>
            <p className="text-xs text-slate-400">
              Each NAT External IP provides <strong>64,512 usable source ports</strong> (`65,536 - 1,024`). Calculate how many Manual NAT IPs are required for your fleet:
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Number of VMs / GKE Nodes behind Cloud NAT: <strong className="text-white">{natVmCount} VMs</strong>
                </label>
                <input
                  type="range"
                  min={10}
                  max={1000}
                  step={10}
                  value={natVmCount}
                  onChange={(e) => setNatVmCount(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Allocated Ports per VM (<code>min-ports-per-vm</code>): <strong className="text-white">{natPortsPerVm} ports</strong>
                </label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {[64, 256, 1024, 2048, 4096].map((ports) => (
                    <button
                      key={ports}
                      onClick={() => setNatPortsPerVm(ports)}
                      className={`py-2 rounded-lg text-xs font-bold border ${
                        natPortsPerVm === ports
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {ports}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 uppercase font-semibold">Required Cloud NAT External IP Addresses</div>
              <div className="text-2xl font-extrabold text-blue-400">
                {requiredNatIps} Static External NAT {requiredNatIps === 1 ? 'IP' : 'IPs'} Required
              </div>
              <div className="text-xs text-slate-300">
                Formula: <code>ceil(({natVmCount} VMs × {natPortsPerVm} ports) / 64,512) = ceil({totalNatPortsNeeded.toLocaleString()} / 64,512) = {requiredNatIps}</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Load Balancer Decision Wizard */}
      {activeTab === 'lb-wizard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-400" />
              Select Workload Requirements
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-2 font-semibold uppercase">
                1. Protocol & Termination Behavior
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'http',
                    label: 'HTTP / HTTPS / gRPC / WebSockets (L7 Proxy with URL Map)'
                  },
                  {
                    id: 'tcp-proxy',
                    label: 'TCP / SSL Offload Proxy (L4 Envoy/GFE Proxy)'
                  },
                  {
                    id: 'passthrough',
                    label: 'Raw TCP / UDP / ESP / End-to-End mTLS Passthrough (Preserve L3 Client IP)'
                  }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setLbTrafficType(opt.id as any)}
                    className={`w-full text-left p-3 rounded-xl text-xs font-bold border transition-all ${
                      lbTrafficType === opt.id
                        ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-semibold uppercase">
                  2. Client Exposure
                </label>
                <div className="space-y-2">
                  {(['external', 'internal'] as const).map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setLbExposure(ex)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold border capitalize ${
                        lbExposure === ex
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {ex} Clients
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-semibold uppercase">
                  3. Geographic Scope
                </label>
                <div className="space-y-2">
                  {(['global', 'regional'] as const).map((sc) => (
                    <button
                      key={sc}
                      onClick={() => setLbScope(sc)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold border capitalize ${
                        lbScope === sc
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {sc} Routing
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Recommended Google Cloud Load Balancer
            </div>
            <h3 className="text-2xl font-extrabold text-white">{lbRec.name}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 font-semibold">VIP Scope & Network Tier</div>
                <div className="text-white font-bold mt-1">{lbRec.scopeNote}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 font-semibold">Client Source IP Preservation</div>
                <div className="text-emerald-300 font-bold mt-1">{lbRec.clientIp}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 font-semibold">Proxy-Only Subnet Requirement</div>
                <div className="text-amber-300 font-bold mt-1">{lbRec.proxySubnet}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 font-semibold">Supported Backend Types</div>
                <div className="text-blue-300 font-bold mt-1">{lbRec.backends}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 leading-relaxed">
              <strong>PCNE Exam Takeaway:</strong> {lbRec.examTip}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
