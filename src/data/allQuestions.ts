import { EXAM_QUESTIONS } from './examQuestions';
import { MORE_EXAM_QUESTIONS } from './moreExamQuestions';
import { ExamQuestion } from '../types';

export const ALL_EXAM_QUESTIONS: ExamQuestion[] = [
  ...EXAM_QUESTIONS,
  ...MORE_EXAM_QUESTIONS,
];
