import React, { useState, useEffect, useMemo } from 'react';
import { ALL_EXAM_QUESTIONS } from '../data/allQuestions';
import { STUDY_DOMAINS } from '../data/studyData';
import { DomainId, ExamAttempt, ExamQuestion } from '../types';
import {
  Clock,
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  BookOpen,
  Award,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Filter,
  HelpCircle,
  Sparkles,
  CheckSquare
} from 'lucide-react';

interface ExamSimulatorProps {
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onSaveAttempt: (attempt: ExamAttempt) => void;
  attempts: ExamAttempt[];
  initialDomainFilter?: DomainId | 'all';
}

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({
  bookmarkedIds,
  onToggleBookmark,
  onSaveAttempt,
  attempts,
  initialDomainFilter = 'all'
}) => {
  // Configuration state
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mode, setMode] = useState<'tutor' | 'timed'>('tutor');
  const [domainFilter, setDomainFilter] = useState<DomainId | 'all'>(initialDomainFilter);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Moderate' | 'Hard' | 'Expert'>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(40);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);

  // Active exam state
  const [activeQuestions, setActiveQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});
  const [flaggedInSession, setFlaggedInSession] = useState<Record<string, boolean>>({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'flagged'>('all');

  useEffect(() => {
    if (initialDomainFilter) {
      setDomainFilter(initialDomainFilter);
    }
  }, [initialDomainFilter]);

  // Timer effect
  useEffect(() => {
    if (!isStarted || isSubmitted) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, isSubmitted]);

  // Filtered pool preview
  const matchingPool = useMemo(() => {
    return ALL_EXAM_QUESTIONS.filter((q) => {
      if (domainFilter !== 'all' && q.domainId !== domainFilter) return false;
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
      if (onlyBookmarked && !bookmarkedIds.includes(q.id)) return false;
      return true;
    });
  }, [domainFilter, difficultyFilter, onlyBookmarked, bookmarkedIds]);

  const startExam = () => {
    let list = [...matchingPool];
    if (list.length === 0) return;
    if (shuffleQuestions) {
      list.sort(() => Math.random() - 0.5);
    }
    list = list.slice(0, Math.min(questionCount, list.length));
    setActiveQuestions(list);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setRevealedQuestions({});
    setFlaggedInSession({});
    setSecondsElapsed(0);
    setIsSubmitted(false);
    setIsStarted(true);
  };

  const currentQuestion = activeQuestions[currentIndex];

  const handleSelectOption = (optionId: string) => {
    if (isSubmitted) return;
    if (mode === 'tutor' && revealedQuestions[currentQuestion.id]) return;

    const currentSelected = selectedAnswers[currentQuestion.id] || [];
    const maxSelect = currentQuestion.isMultiSelect ? (currentQuestion.selectCount || 2) : 1;

    if (maxSelect === 1) {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion.id]: [optionId]
      });
    } else {
      if (currentSelected.includes(optionId)) {
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQuestion.id]: currentSelected.filter((id) => id !== optionId)
        });
      } else if (currentSelected.length < maxSelect) {
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQuestion.id]: [...currentSelected, optionId]
        });
      }
    }
  };

  const isQuestionCorrect = (q: ExamQuestion) => {
    const userAns = selectedAnswers[q.id] || [];
    if (userAns.length !== q.correctAnswers.length) return false;
    return q.correctAnswers.every((ans) => userAns.includes(ans));
  };

  const handleSubmitExam = () => {
    const domainBreakdown: Record<DomainId, { correct: number; total: number }> = {
      'domain-1': { correct: 0, total: 0 },
      'domain-2': { correct: 0, total: 0 },
      'domain-3': { correct: 0, total: 0 },
      'domain-4': { correct: 0, total: 0 },
      'domain-5': { correct: 0, total: 0 }
    };

    let correctCount = 0;
    activeQuestions.forEach((q) => {
      domainBreakdown[q.domainId].total += 1;
      if (isQuestionCorrect(q)) {
        correctCount += 1;
        domainBreakdown[q.domainId].correct += 1;
      }
    });

    const scorePercent = Math.round((correctCount / activeQuestions.length) * 100);
    const attempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      date: new Date().toLocaleString(),
      mode: mode,
      scorePercent,
      correctCount,
      totalQuestions: activeQuestions.length,
      timeSpentSeconds: secondsElapsed,
      domainBreakdown
    };
    onSaveAttempt(attempt);
    setIsSubmitted(true);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const remainingTimedSeconds = Math.max(0, 120 * 60 - secondsElapsed);

  // --- VIEW 1: SETUP SCREEN ---
  if (!isStarted) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
                <Award className="w-3.5 h-3.5" /> Official PCNE Scenario Assessment Engine
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Professional Cloud Network Engineer Exam Simulator
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Configure a realistic timed simulation or interactive tutor session with deep per-option explanations and exam trap alerts.
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-right">
              <div className="text-xs text-slate-400">Available Scenario Pool</div>
              <div className="text-2xl font-extrabold text-blue-400">
                {matchingPool.length} <span className="text-sm font-normal text-slate-400">/ {ALL_EXAM_QUESTIONS.length} Questions</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Mode Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                1. Choose Assessment Mode
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setMode('tutor')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    mode === 'tutor'
                      ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-600/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      Interactive Tutor & Deep-Dive Mode (Recommended for Learning)
                    </span>
                    {mode === 'tutor' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-500 text-white font-bold">Selected</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Check your answer immediately after each question. Reveals detailed explanations for why every single option is right or wrong, plus PCNE Exam Trap Alerts.
                  </p>
                </button>

                <button
                  onClick={() => setMode('timed')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    mode === 'timed'
                      ? 'bg-amber-600/15 border-amber-500 text-white shadow-lg shadow-amber-600/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Realistic Timed Exam Simulation (120-Min Countdown)
                    </span>
                    {mode === 'timed' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">Selected</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Simulates actual Kryterion/Google Cloud testing conditions. No answers shown until you submit the exam. Generates a full domain-by-domain pass/fail diagnostic (70% passing mark).
                  </p>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  2. Filter by Exam Domain
                </label>
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All 5 Official PCNE Domains ({ALL_EXAM_QUESTIONS.length} Questions)</option>
                  {STUDY_DOMAINS.map((d) => (
                    <option key={d.id} value={d.id}>
                      Domain {d.number}: {d.title} ({d.weight})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    3. Difficulty Level
                  </label>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert (Multi-Hop Traps)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    4. Number of Questions
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white"
                  >
                    <option value={10}>10 Questions (Quick Drill)</option>
                    <option value={20}>20 Questions (Half Exam)</option>
                    <option value={40}>All Matching ({matchingPool.length} Questions)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 accent-blue-500 rounded"
                  />
                  Shuffle question order
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyBookmarked}
                    onChange={(e) => setOnlyBookmarked(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  Only Bookmarked Questions ({bookmarkedIds.length})
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Passing threshold: <strong className="text-emerald-400">70% (700/1000 scaled)</strong> across all 5 domains.
            </div>
            <button
              disabled={matchingPool.length === 0}
              onClick={startExam}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch {mode === 'tutor' ? 'Interactive Tutor Session' : 'Timed Exam Simulation'} ({Math.min(questionCount, matchingPool.length)} Qs)
            </button>
          </div>
        </div>

        {/* Past Exam Attempts History */}
        {attempts.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Your Recent Assessment History</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {attempts.slice(0, 6).map((att) => (
                <div
                  key={att.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs text-slate-400">{att.date}</div>
                    <div className="text-sm font-bold text-white mt-0.5 capitalize">
                      {att.mode} Mode ({att.correctCount}/{att.totalQuestions})
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Time: {formatTime(att.timeSpentSeconds)}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-lg ${
                      att.scorePercent >= 70
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {att.scorePercent}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 2: SUBMITTED EXAM RESULTS & DIAGNOSTIC REPORT ---
  if (isSubmitted) {
    const correctTotal = activeQuestions.filter((q) => isQuestionCorrect(q)).length;
    const scorePct = Math.round((correctTotal / activeQuestions.length) * 100);
    const passed = scorePct >= 70;

    const filteredReviewQuestions = activeQuestions.filter((q) => {
      if (reviewFilter === 'incorrect') return !isQuestionCorrect(q);
      if (reviewFilter === 'flagged') return flaggedInSession[q.id] || bookmarkedIds.includes(q.id);
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Score Banner */}
        <div
          className={`rounded-2xl p-6 md:p-8 border ${
            passed
              ? 'bg-emerald-950/25 border-emerald-500/40'
              : 'bg-rose-950/25 border-rose-500/40'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  passed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {passed ? 'PASS — PCNE Ready (≥ 70%)' : 'NEEDS REVIEW — Below 70% Benchmark'}
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-2">
                Final Score: {scorePct}% ({correctTotal} / {activeQuestions.length} Correct)
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                Time Elapsed: <strong>{formatTime(secondsElapsed)}</strong> • Review every explanation below to lock in the Google Cloud networking nuances.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsStarted(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> New Exam Configuration
              </button>
            </div>
          </div>

          {/* Domain Breakdown Bars */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
            {STUDY_DOMAINS.map((dom) => {
              const domQs = activeQuestions.filter((q) => q.domainId === dom.id);
              const domCorrect = domQs.filter((q) => isQuestionCorrect(q)).length;
              const domPct = domQs.length > 0 ? Math.round((domCorrect / domQs.length) * 100) : 0;
              return (
                <div key={dom.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs font-bold text-slate-300 truncate">{dom.shortTitle}</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-extrabold text-white">
                      {domQs.length > 0 ? `${domPct}%` : 'N/A'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {domCorrect}/{domQs.length}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        domPct >= 70 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${domPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-sm font-bold text-white">
            Detailed Question & Distractor Review ({filteredReviewQuestions.length} shown)
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all', label: `All Questions (${activeQuestions.length})` },
              {
                id: 'incorrect',
                label: `Incorrect Only (${activeQuestions.length - correctTotal})`
              },
              { id: 'flagged', label: 'Flagged / Bookmarked' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setReviewFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  reviewFilter === f.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Full Question Review List */}
        <div className="space-y-6">
          {filteredReviewQuestions.map((q, idx) => {
            const correct = isQuestionCorrect(q);
            const userSelected = selectedAnswers[q.id] || [];
            return (
              <div
                key={q.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        correct
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {correct ? 'Correct' : 'Incorrect'}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold">
                      {q.topic}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 font-semibold">
                      {q.difficulty}
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleBookmark(q.id)}
                    className={`text-xs px-3 py-1 rounded-lg border flex items-center gap-1 ${
                      bookmarkedIds.includes(q.id)
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {bookmarkedIds.includes(q.id) ? 'Bookmarked' : 'Bookmark'}
                  </button>
                </div>

                <p className="text-slate-100 text-sm md:text-base font-medium whitespace-pre-line leading-relaxed">
                  {idx + 1}. {q.question}
                </p>

                <div className="space-y-2.5">
                  {q.options.map((opt) => {
                    const isOptCorrect = q.correctAnswers.includes(opt.id);
                    const wasPicked = userSelected.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        className={`p-3.5 rounded-xl border text-xs md:text-sm space-y-1.5 ${
                          isOptCorrect
                            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-100'
                            : wasPicked
                            ? 'bg-rose-950/30 border-rose-500/50 text-rose-100'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-semibold">
                            <span className="inline-block w-6 font-extrabold">{opt.id}.</span>
                            {opt.text}
                          </div>
                          <div className="flex shrink-0 gap-1.5">
                            {wasPicked && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-white">
                                Your Choice
                              </span>
                            )}
                            {isOptCorrect && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500 text-slate-950">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-slate-300 pl-6 pt-1 border-t border-slate-800/60">
                          {opt.whyRightOrWrong}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl bg-amber-950/25 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <AlertTriangle className="w-4 h-4" /> Exam Trap Alert:
                  </div>
                  <div>{q.examTrapAlert}</div>
                  <div className="pt-1 text-emerald-300 font-semibold">
                    Key Takeaway: {q.keyTakeaway}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- VIEW 3: ACTIVE QUESTION RUNNER ---
  const userCurrentSelection = selectedAnswers[currentQuestion.id] || [];
  const isCurrentRevealed = mode === 'tutor' && !!revealedQuestions[currentQuestion.id];
  const isBookmarked = bookmarkedIds.includes(currentQuestion.id);
  const isFlagged = !!flaggedInSession[currentQuestion.id];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left / Main Question Column */}
      <div className="lg:col-span-9 space-y-5">
        {/* Top Status Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold">
              Question {currentIndex + 1} of {activeQuestions.length}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
              {currentQuestion.topic}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                currentQuestion.difficulty === 'Expert'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : currentQuestion.difficulty === 'Hard'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {currentQuestion.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              {mode === 'timed' ? (
                <span>Remaining: {formatTime(remainingTimedSeconds)}</span>
              ) : (
                <span>Elapsed: {formatTime(secondsElapsed)}</span>
              )}
            </div>

            <button
              onClick={() =>
                setFlaggedInSession({
                  ...flaggedInSession,
                  [currentQuestion.id]: !isFlagged
                })
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                isFlagged
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              {isFlagged ? 'Flagged' : 'Flag for Review'}
            </button>

            <button
              onClick={() => onToggleBookmark(currentQuestion.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                isBookmarked
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {isBookmarked ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          {currentQuestion.isMultiSelect && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
              <CheckSquare className="w-3.5 h-3.5" />
              Multiple-Select Question: Choose {currentQuestion.selectCount || 2} options
            </div>
          )}

          <p className="text-base md:text-lg text-slate-100 font-medium leading-relaxed whitespace-pre-line">
            {currentQuestion.question}
          </p>

          {/* Options List */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = userCurrentSelection.includes(opt.id);
              const isCorrectOption = currentQuestion.correctAnswers.includes(opt.id);

              let cardStyle =
                'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700';
              if (isCurrentRevealed) {
                if (isCorrectOption) {
                  cardStyle = 'bg-emerald-950/35 border-emerald-500 text-emerald-100';
                } else if (isSelected && !isCorrectOption) {
                  cardStyle = 'bg-rose-950/35 border-rose-500 text-rose-100';
                }
              } else if (isSelected) {
                cardStyle = 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10';
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${cardStyle}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${
                        isCurrentRevealed
                          ? isCorrectOption
                            ? 'bg-emerald-500 text-slate-950'
                            : isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                          : isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="text-sm leading-relaxed font-medium">{opt.text}</div>

                      {isCurrentRevealed && (
                        <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                          {opt.whyRightOrWrong}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tutor Mode Check Answer Button */}
          {mode === 'tutor' && !isCurrentRevealed && (
            <div className="pt-2 flex justify-end">
              <button
                disabled={userCurrentSelection.length === 0}
                onClick={() =>
                  setRevealedQuestions({
                    ...revealedQuestions,
                    [currentQuestion.id]: true
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Check Answer & Reveal Deep Explanation
              </button>
            </div>
          )}

          {/* Tutor Mode Revealed Deep Dive Box */}
          {isCurrentRevealed && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div
                className={`p-4 rounded-xl border ${
                  isQuestionCorrect(currentQuestion)
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="font-bold text-sm flex items-center gap-2">
                  {isQuestionCorrect(currentQuestion) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Spot On! Correct Answer: {currentQuestion.correctAnswers.join(', ')}
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      Not Quite — Correct Answer: {currentQuestion.correctAnswers.join(', ')}
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                  {currentQuestion.coreExplanation}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs space-y-2">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> PCNE Exam Trap Alert:
                </div>
                <p className="text-amber-100 leading-relaxed">{currentQuestion.examTrapAlert}</p>
                <div className="pt-2 border-t border-amber-500/20 text-emerald-300 font-bold">
                  Golden Rule: {currentQuestion.keyTakeaway}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-3">
              {currentIndex < activeQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((i) => Math.min(activeQuestions.length - 1, i + 1))}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  Next Question <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30"
                >
                  Finish & View Diagnostic Report
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Question Navigator Grid */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 sticky top-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Question Navigator</h3>
            <span className="text-xs text-slate-400">
              {Object.keys(selectedAnswers).length}/{activeQuestions.length} Answered
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {activeQuestions.map((q, idx) => {
              const hasAns = (selectedAnswers[q.id] || []).length > 0;
              const revealed = mode === 'tutor' && revealedQuestions[q.id];
              const flagged = flaggedInSession[q.id];

              let btnClass = 'bg-slate-950 border-slate-800 text-slate-400';
              if (idx === currentIndex) {
                btnClass = 'ring-2 ring-blue-500 bg-blue-600/20 border-blue-500 text-white';
              } else if (revealed) {
                btnClass = isQuestionCorrect(q)
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-300';
              } else if (hasAns) {
                btnClass = 'bg-blue-500/20 border-blue-500/40 text-blue-300';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg border text-xs font-bold relative flex items-center justify-center transition-all ${btnClass}`}
                >
                  {idx + 1}
                  {flagged && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={handleSubmitExam}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
            >
              Submit & Grade Exam
            </button>
            <button
              onClick={() => setIsStarted(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Exit to Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
