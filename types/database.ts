export type ExamType =
  | "matura_podstawowa"
  | "matura_rozszerzona"
  | "8_klasa";

export type TopicStatus =
  | "locked"
  | "available"
  | "completed"
  | "coming_soon";

export interface Task {
  id: string;
  exam_type: ExamType;
  category: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  content: string;
  correct_answer: string;
  options: string[];
  xp_reward: number;
}

export interface Material {
  id: string;
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  content: string;
  video_url: string | null;
  created_at?: string;
}

export interface TrainingTopic {
  id: string;
  name: string;
  status: TopicStatus;
}

export interface TrainingCategory {
  id: string;
  name: string;
  progressPercent: number;
  topics: TrainingTopic[];
}

export interface TrainingExam {
  examType: ExamType;
  label: string;
  shortLabel: string;
  categories: TrainingCategory[];
}
