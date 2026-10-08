import React from 'react';
import { MUST_KNOW_VIPS, KEY_IAM_ROLES } from '../data/cheatSheetData';
import { Shield, Server, Key, Layers } from 'lucide-react';

export const CheatSheetVault: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
          <Key className="w-3.5 h-3.5" /> Exam-Day Rapid Reference Vault
        </span>
        <h2 className="text-2xl font-bold text-white">
          Must-Memorize Google Cloud VIPs, ASNs, IAM Roles & Protocols
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          The Professional Cloud Network Engineer exam expects you to recognize these exact CIDR ranges and IAM roles without hesitation.
        </p>
      </div>

      {/* Must-Know VIPs & CIDRs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-400" />
          1. Mandatory Google Cloud IP Ranges & ASNs to Memorize
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                <th className="p-3.5 font-bold">IP Range / ASN</th>
                <th className="p-3.5 font-bold">Google Cloud Service</th>
                <th className="p-3.5 font-bold">Traffic Direction</th>
                <th className="p-3.5 font-bold">Critical PCNE Exam Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MUST_KNOW_VIPS.map((vip, idx) => (
                <tr key={idx} className="bg-slate-900/60 hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-blue-400 whitespace-nowrap">
                    {vip.range}
                  </td>
                  <td className="p-3.5 font-semibold text-white">{vip.service}</td>
                  <td className="p-3.5 text-slate-300">{vip.direction}</td>
                  <td className="p-3.5 text-amber-200 leading-relaxed">{vip.examNotes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IAM Roles */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          2. Least-Privilege Network & Shared VPC IAM Roles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {KEY_IAM_ROLES.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {item.role}
                </code>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Scope: {item.scope}
                </span>
              </div>
              <div className="text-sm font-bold text-white">{item.title}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.purpose}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MTU & Protocol Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          3. MTU Limits, Protocols & Quotas Quick Sheet
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-bold text-blue-400 text-sm">VPC & Hybrid MTU Sizes</div>
            <div className="text-slate-300">• Standard VPC MTU: <strong>1460 bytes</strong></div>
            <div className="text-slate-300">• Jumbo Frames VPC MTU: Up to <strong>8896 bytes</strong></div>
            <div className="text-slate-300">• Cloud VPN (Encrypted): <strong>1460 bytes max</strong> (1440 for some payload types)</div>
            <div className="text-slate-300">• Cloud Interconnect MTU: <strong>1440, 1460, 1500, or 8896 bytes</strong></div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-bold text-amber-400 text-sm">Essential Protocol & Port Numbers</div>
            <div className="text-slate-300">• BGP (Cloud Router): <strong>TCP Port 179</strong></div>
            <div className="text-slate-300">• IPsec IKE / NAT-T: <strong>UDP 500 & UDP 4500 + IP Protocol 50 (ESP)</strong></div>
            <div className="text-slate-300">• Packet Mirroring / Cloud IDS Encapsulation: <strong>Geneve UDP 6081</strong></div>
            <div className="text-slate-300">• BFD Control / Echo: <strong>UDP 3784 / 3785</strong></div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-bold text-emerald-400 text-sm">Hard Architectural Limits</div>
            <div className="text-slate-300">• Max VPC Peerings per VPC: <strong>25 peerings</strong></div>
            <div className="text-slate-300">• HA VPN Single Tunnel Max: <strong>3 Gbps (250k PPS)</strong></div>
            <div className="text-slate-300">• Dedicated Interconnect Ports: <strong>10 Gbps (x8) or 100 Gbps (x2)</strong></div>
            <div className="text-slate-300">• Partner Interconnect Attachments: <strong>50 Mbps – 50 Gbps</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
