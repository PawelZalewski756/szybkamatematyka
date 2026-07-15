/** Metadane arkusza CKE w archiwum kodowym (bez pełnej treści arkusza). */
export type ExamArchiveSheetMeta = {
  id: string;
  sessionId: string;
  title: string;
  year: number;
  month: number;
  taskIds: string[];
};
