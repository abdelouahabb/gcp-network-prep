import React, { useState } from 'react';
import { STUDY_DOMAINS } from '../data/studyData';
import { DomainId } from '../types';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Copy,
  Check,
  Play,
  Layers,
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface KnowledgeExplorerProps {
  completedConcepts: string[];
  onToggleConcept: (conceptId: string) => void;
  onStartDomainQuiz: (domainId: DomainId) => void;
}

export const KnowledgeExplorer: React.FC<KnowledgeExplorerProps> = ({
  completedConcepts,
  onToggleConcept,
  onStartDomainQuiz
}) => {
  const [selectedDomainId, setSelectedDomainId] = useState<DomainId>('domain-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const selectedDomain =
    STUDY_DOMAINS.find((d) => d.id === selectedDomainId) || STUDY_DOMAINS[0];

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Filter concepts if searchQuery is active across ALL domains
  const displayedConcepts = searchQuery.trim()
    ? STUDY_DOMAINS.flatMap((d) =>
        d.concepts
          .filter(
            (c) =>
              c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
              c.howItWorks.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase())) ||
              c.examTraps.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((c) => ({ ...c, domainTitle: d.shortTitle, domainId: d.id }))
      )
    : selectedDomain.concepts.map((c) => ({
        ...c,
        domainTitle: selectedDomain.shortTitle,
        domainId: selectedDomain.id
      }));

  return (
    <div className="space-y-6">
      {/* Top Domain Selector & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 mb-2">
              <BookOpen className="w-3.5 h-3.5" /> Deep Google Cloud Networking Encyclopedia
            </span>
            <h2 className="text-2xl font-bold text-white">
              Master Every GCP Network Architecture & Exam Nuance
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Explore Andromeda internals, comparison matrices, production `gcloud` CLI patterns, and real exam traps.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PSC, BGP, MED, 35.199.192.0/19, GKE..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 5 Domain Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {STUDY_DOMAINS.map((dom) => {
            const isSelected = !searchQuery.trim() && dom.id === selectedDomainId;
            const masteredInDom = dom.concepts.filter((c) =>
              completedConcepts.includes(c.id)
            ).length;
            return (
              <button
                key={dom.id}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDomainId(dom.id);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/10'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-blue-400">Domain {dom.number}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {dom.weight}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1.5 line-clamp-2">
                    {dom.title}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {masteredInDom}/{dom.concepts.length} Mastered
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {Math.round((masteredInDom / dom.concepts.length) * 100)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Domain Banner */}
        {!searchQuery.trim() && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Domain {selectedDomain.number} ({selectedDomain.weight} of Exam)
              </div>
              <div className="text-lg font-extrabold text-white mt-0.5">
                {selectedDomain.title}
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedDomain.description}</p>
            </div>
            <button
              onClick={() => onStartDomainQuiz(selectedDomain.id)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Practice Domain {selectedDomain.number} Questions
            </button>
          </div>
        )}
      </div>

      {/* Deep Concept Modules */}
      <div className="space-y-8">
        {displayedConcepts.map((concept) => {
          const isMastered = completedConcepts.includes(concept.id);
          return (
            <div
              key={concept.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
            >
              {/* Module Header */}
              <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      {concept.domainTitle}
                    </span>
                    {concept.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-extrabold text-white">{concept.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{concept.subtitle}</p>
                </div>

                <button
                  onClick={() => onToggleConcept(concept.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shrink-0 ${
                    isMastered
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isMastered ? 'Mastered ✓' : 'Mark as Mastered'}
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* How It Works Under the Hood */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> How Google Cloud Works Under the Hood
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {concept.howItWorks.map((paragraph, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 text-sm text-slate-200 leading-relaxed"
                      >
                        {paragraph}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Flow Diagram if present */}
                {concept.asciiOrFlowDiagram && (
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      Architecture Flow: {concept.asciiOrFlowDiagram.title}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {concept.asciiOrFlowDiagram.nodes.map((node, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 relative flex flex-col justify-between"
                        >
                          <div className="text-xs font-extrabold text-white">{node.label}</div>
                          <div className="text-xs text-slate-400 mt-1">{node.detail}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-blue-300 bg-blue-950/30 border border-blue-500/20 rounded-lg p-3">
                      {concept.asciiOrFlowDiagram.flowNote}
                    </div>
                  </div>
                )}

                {/* Deep Architecture & IAM Notes */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Critical Architectural Rules & Nuances
                  </h4>
                  <ul className="space-y-2">
                    {concept.architectureNotes.map((note, i) => (
                      <li
                        key={i}
                        className="text-xs md:text-sm text-slate-300 bg-emerald-950/15 border border-emerald-500/20 rounded-xl p-3.5 leading-relaxed"
                      >
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Comparison Matrix Table */}
                {concept.comparisonTable && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {concept.comparisonTable.title}
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                            {concept.comparisonTable.headers.map((h, i) => (
                              <th key={i} className="p-3 font-bold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70">
                          {concept.comparisonTable.rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="bg-slate-900/60 hover:bg-slate-800/40 transition-colors"
                            >
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`p-3 leading-relaxed ${
                                    cIdx === 0
                                      ? 'font-bold text-white'
                                      : 'text-slate-300'
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Exam Traps Box */}
                <div className="p-5 rounded-xl bg-amber-950/25 border border-amber-500/35 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Real PCNE Exam Traps to Watch Out For
                  </h4>
                  <div className="space-y-2">
                    {concept.examTraps.map((trap, i) => (
                      <div
                        key={i}
                        className="text-xs md:text-sm text-amber-100/90 leading-relaxed pl-3 border-l-2 border-amber-500"
                      >
                        {trap}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Production gcloud CLI Commands */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-blue-400" /> Essential `gcloud` CLI Commands
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {concept.cliCommands.map((cmd, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden"
                      >
                        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-300">
                            {cmd.description}
                          </span>
                          <button
                            onClick={() => handleCopy(cmd.command)}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            {copiedCmd === cmd.command ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 text-xs text-blue-300 overflow-x-auto leading-relaxed">
                          <code>{cmd.command}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
