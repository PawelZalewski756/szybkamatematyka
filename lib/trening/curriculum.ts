import { CKE_EGZAMIN_8 } from "@/lib/trening/cke-egzamin-8";
import {
  CKE_MATURA_PODSTAWOWA,
  type CkeCategoryDef,
} from "@/lib/trening/cke-matura-podstawowa";
import type {
  ExamType,
  TopicStatus,
  TrainingCategory,
  TrainingExam,
  TrainingTopic,
} from "@/types/database";

export type TreningExamKey = "matura_podstawowa" | "8_klasa";

function ckeCategoriesToTraining(
  categories: CkeCategoryDef[],
): TrainingCategory[] {
  const available: TopicStatus = "available";
  return categories.map((cat) => ({
    id: cat.slug,
    name: cat.name,
    progressPercent: 0,
    topics: cat.topics.map(
      (topic): TrainingTopic => ({
        id: topic.slug,
        name: topic.name,
        status: available,
      }),
    ),
  }));
}

export const TRAINING_CURRICULUM: Record<TreningExamKey, TrainingExam> = {
  matura_podstawowa: {
    examType: CKE_MATURA_PODSTAWOWA.examType,
    label: CKE_MATURA_PODSTAWOWA.label,
    shortLabel: CKE_MATURA_PODSTAWOWA.shortLabel,
    categories: ckeCategoriesToTraining(CKE_MATURA_PODSTAWOWA.categories),
  },
  "8_klasa": {
    examType: CKE_EGZAMIN_8.examType,
    label: CKE_EGZAMIN_8.label,
    shortLabel: CKE_EGZAMIN_8.shortLabel,
    categories: ckeCategoriesToTraining(CKE_EGZAMIN_8.categories),
  },
};

export function examTypeForKey(key: TreningExamKey): ExamType {
  return TRAINING_CURRICULUM[key].examType;
}
