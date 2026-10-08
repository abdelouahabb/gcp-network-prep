export type DomainId = 'domain-1' | 'domain-2' | 'domain-3' | 'domain-4' | 'domain-5';

export interface ComparisonTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface DeepConcept {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  howItWorks: string[];
  architectureNotes: string[];
  asciiOrFlowDiagram?: {
    title: string;
    nodes: { label: string; detail: string; color: string }[];
    flowNote: string;
  };
  comparisonTable?: ComparisonTable;
  examTraps: string[];
  cliCommands: { description: string; command: string }[];
}

export interface StudyDomain {
  id: DomainId;
  number: number;
  title: string;
  weight: string;
  shortTitle: string;
  description: string;
  color: string;
  concepts: DeepConcept[];
}

export interface QuestionOption {
  id: string; // 'A' | 'B' | 'C' | 'D' | 'E'
  text: string;
  whyRightOrWrong: string;
}

export interface ExamQuestion {
  id: string;
  domainId: DomainId;
  topic: string;
  difficulty: 'Moderate' | 'Hard' | 'Expert';
  isMultiSelect?: boolean;
  selectCount?: number;
  question: string;
  options: QuestionOption[];
  correctAnswers: string[];
  coreExplanation: string;
  examTrapAlert: string;
  keyTakeaway: string;
}

export interface ExamAttempt {
  id: string;
  date: string;
  mode: 'timed' | 'tutor' | 'domain';
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  domainBreakdown: Record<DomainId, { correct: number; total: number }>;
}
