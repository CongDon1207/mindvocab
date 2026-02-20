export interface ExerciseItem {
  _id?: string;
  type: 'mcq' | 'fill';
  prompt: string;
  options?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
  };
  answer: string;
  explanation?: string;
}

export interface NotebookEntry {
  _id: string;
  title: string;
  content: string;
  exercises: ExerciseItem[];
  meta: {
    stage: number;
    nextReviewDate: string | Date;
    lastReviewedAt?: string | Date;
    lastScore?: number;
  };
  createdAt: string;
  updatedAt: string;
}
