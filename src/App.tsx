import React, { useState, useEffect } from 'react';
import { STUDY_DOMAINS } from './data/studyData';
import { ALL_EXAM_QUESTIONS } from './data/allQuestions';
import { DomainId, ExamAttempt } from './types';
import { KnowledgeExplorer } from './components/KnowledgeExplorer';
import { InteractiveSimulators } from './components/InteractiveSimulators';
import { ExamSimulator } from './components/ExamSimulator';
import { CheatSheetVault } from './components/CheatSheetVault';
import {
  Network,
  BookOpen,
  Cpu,
  Award,
  Key,
  LayoutDashboard,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Target
} from 'lucide-react';

type ActiveSection = 'dashboard' | 'knowledge' | 'labs' | 'exam' | 'cheatsheet';

export function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [examDomainPreset, setExamDomainPreset] = useState<DomainId | 'all'>('all');

  // Persistent state in localStorage
  const [completedConcepts, setCompletedConcepts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pcne_completed_concepts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pcne_bookmarked_questions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [attempts, setAttempts] = useState<ExamAttempt[]>(() => {
    try {
      const saved = localStorage.getItem('pcne_exam_attempts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pcne_completed_concepts', JSON.stringify(completedConcepts));
    } catch {}
  }, [completedConcepts]);

  useEffect(() => {
    try {
      localStorage.setItem('pcne_bookmarked_questions', JSON.stringify(bookmarkedIds));
    } catch {}
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('pcne_exam_attempts', JSON.stringify(attempts));
    } catch {}
  }, [attempts]);

  const toggleConcept = (conceptId: string) => {
    setCompletedConcepts((prev) =>
      prev.includes(conceptId) ? prev.filter((id) => id !== conceptId) : [...prev, conceptId]
    );
  };

  const toggleBookmark = (qId: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const saveAttempt = (attempt: ExamAttempt) => {
    setAttempts((prev) => [attempt, ...prev]);
  };

  const totalConceptsCount = STUDY_DOMAINS.reduce((acc, d) => acc + d.concepts.length, 0);
  const conceptProgressPct = Math.round((completedConcepts.length / totalConceptsCount) * 100);
  const bestScore =
    attempts.length > 0 ? Math.max(...attempts.map((a) => a.scorePercent)) : null;

  const handleLaunchDomainQuiz = (domainId: DomainId) => {
    setExamDomainPreset(domainId);
    setActiveSection('exam');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div
            onClick={() => setActiveSection('dashboard')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  GCP Network Engineer
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  PCNE Mastery
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Deep Architecture Encyclopedia • Interactive Labs • Exam Simulator
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
              { id: 'knowledge', label: 'Deep GCP Knowledge', icon: BookOpen },
              { id: 'labs', label: 'Interactive Labs', icon: Cpu },
              { id: 'exam', label: 'Exam Simulator (40 Qs)', icon: Award },
              { id: 'cheatsheet', label: 'VIPs & CLI Vault', icon: Key }
            ].map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'exam') setExamDomainPreset('all');
                    setActiveSection(item.id as ActiveSection);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeSection === 'dashboard' && (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800 p-6 md:p-10">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Built for Google Cloud’s Toughest Infrastructure Exam
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                  Master the Google Cloud <span className="text-blue-400">Professional Cloud Network Engineer</span> Exam
                </h1>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  The PCNE exam tests deep architectural reasoning across Andromeda SDN routing priorities, BGP MED inter-region penalties, Private Service Connect vs. Private Services Access, GKE Alias IP math, 99.99% SLA topologies, and Hierarchical Firewalls. First understand the internals, experiment in the live simulators, and then prove your readiness in the 40-question Exam Simulator.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setActiveSection('knowledge')}
                    className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    1. Study Deep GCP Architecture
                  </button>
                  <button
                    onClick={() => setActiveSection('labs')}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold border border-slate-700 transition-all flex items-center gap-2"
                  >
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    2. Launch Interactive Networking Simulators
                  </button>
                  <button
                    onClick={() => {
                      setExamDomainPreset('all');
                      setActiveSection('exam');
                    }}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    3. Take Exam Simulation (40 Scenarios)
                  </button>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="text-xs text-slate-400">Architecture Modules Mastered</div>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {completedConcepts.length} / {totalConceptsCount}{' '}
                    <span className="text-sm text-blue-400">({conceptProgressPct}%)</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="text-xs text-slate-400">Scenario Question Bank</div>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                    {ALL_EXAM_QUESTIONS.length} Deep Qs
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="text-xs text-slate-400">Best Simulation Score</div>
                  <div className="text-2xl font-extrabold text-amber-400 mt-1">
                    {bestScore !== null ? `${bestScore}%` : 'Not Taken Yet'}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="text-xs text-slate-400">Saved / Bookmarked Questions</div>
                  <div className="text-2xl font-extrabold text-purple-400 mt-1">
                    {bookmarkedIds.length} Saved
                  </div>
                </div>
              </div>
            </div>

            {/* Official 5 Exam Domains Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Official Google Cloud PCNE Exam Blueprint (5 Domains)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any domain to study its architecture internals or jump straight to its scenario questions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {STUDY_DOMAINS.map((domain) => {
                  const domainQsCount = ALL_EXAM_QUESTIONS.filter(
                    (q) => q.domainId === domain.id
                  ).length;
                  return (
                    <div
                      key={domain.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-blue-400 uppercase">
                            Domain {domain.number}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-white">
                            {domain.weight}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {domain.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {domain.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-slate-800">
                        <button
                          onClick={() => setActiveSection('knowledge')}
                          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-between"
                        >
                          <span>Study {domain.concepts.length} Deep Modules</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleLaunchDomainQuiz(domain.id)}
                          className="w-full py-2 px-3 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-xs font-bold text-blue-300 flex items-center justify-between"
                        >
                          <span>Practice {domainQsCount} Scenarios</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Why PCNE Is Hard — Top 6 Exam Strategy Rules */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                6 Golden Rules That Separate a Pass from a Fail on the PCNE Exam
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-blue-400 text-sm">
                    1. VPC Routes vs. Firewall Rules Precedence
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>VPC Routes</strong> evaluate Policy-Based Routes first, then <strong>Longest Prefix Match (`/24` beats `/16`)</strong>, then Priority. <strong>Firewall Rules</strong> NEVER use Longest Prefix Match—they evaluate strictly by Hierarchy (`Org → Folder → Network → VPC`) and Priority (`0–65535`).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-emerald-400 text-sm">
                    2. Global Dynamic Routing MED Penalty
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    In Global Dynamic Routing, GCP adds an automatic <strong>Inter-Region Penalty (`201–9999`)</strong> to routes learned from a remote region’s Cloud Router. A local backup VPN with `MED 200` will beat a remote primary Interconnect with `MED 100` unless you raise the backup MED (`5000+`) or prepend its AS-Path!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-purple-400 text-sm">
                    3. PSC vs. PSA vs. PGA
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>PGA</strong> (`199.36.153.4/30` for VPC-SC; `.8/30` for all APIs) is for Google APIs. <strong>PSA</strong> (`servicenetworking-googleapis-com`) is VPC Peering for Cloud SQL/Memorystore (non-transitive!). <strong>PSC</strong> uses Endpoints/Service Attachments to cross Organizations & overlapping IPs without peering.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-400 text-sm">
                    4. 99.99% Interconnect & HA VPN SLAs
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Interconnect <strong>99.99% SLA</strong> requires <strong>4 links across 2 distinct Metros</strong> (Edge Domain 1 & 2 in each) + 2 GCP Regions + Global Routing. HA VPN <strong>99.99% SLA</strong> requires active tunnels on <strong>BOTH Interface 0 and Interface 1</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-rose-400 text-sm">
                    5. GKE Alias IP & Cloud NAT Math
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Default 110 max pods/node reserves a <strong>`/24` (256 IPs) per node</strong> from the Pod secondary range! Cloud NAT allocates ports <strong>per VM (GKE Node)</strong>—use Dynamic Port Allocation when Pods hit `DROPPED_SENT_PACKET` to a single destination IP:Port.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-cyan-400 text-sm">
                    6. Ingress Firewalls vs. VPC Flow Logs
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Ingress Firewall Rules run <strong>BEFORE</strong> VPC Flow Logs and Packet Mirroring! If an ingress packet is denied by a firewall rule, it is <strong>invisible in VPC Flow Logs</strong>—you must enable <strong>Firewall Rules Logging</strong> or run a <strong>Connectivity Test</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'knowledge' && (
          <KnowledgeExplorer
            completedConcepts={completedConcepts}
            onToggleConcept={toggleConcept}
            onStartDomainQuiz={handleLaunchDomainQuiz}
          />
        )}

        {activeSection === 'labs' && <InteractiveSimulators />}

        {activeSection === 'exam' && (
          <ExamSimulator
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            onSaveAttempt={saveAttempt}
            attempts={attempts}
            initialDomainFilter={examDomainPreset}
          />
        )}

        {activeSection === 'cheatsheet' && <CheatSheetVault />}
      </main>
    </div>
  );
}

export default App;
