import type { Exam } from '../../exam.types';

export interface GridColumnConfig {
  columnName: string;
  label: string;
  allowSorting?: boolean;
  allowFiltering?: boolean;
}

export interface GridRowCell {
  columnName: string;
  value: string | number | null;
}

export class ExamTypesScreen {
  static readonly title = 'Exam types Management';
  static readonly managementType = 'students';

  static readonly columns: GridColumnConfig[] = [
    { columnName: 'id', label: 'ID' },
    { columnName: 'exam_name', label: 'Exam Name' },
    { columnName: 'max_point', label: 'Max Point' },
    { columnName: 'min_point', label: 'Min Point' },
    { columnName: 'type', label: 'Type' },
    { columnName: 'exam_memo_point', label: 'Memorization Point' },
    { columnName: 'exam_tjwid_app_point', label: 'Tjwid Applicative Point' },
    { columnName: 'exam_tjwid_tho_point', label: 'Tjwid Theoric Point' },
    { columnName: 'exam_performance_point', label: 'Performance Point' },
    {
      columnName: 'button',
      label: 'Action',
      allowSorting: false,
      allowFiltering: false,
    },
  ];

  static buildRow(exam: Exam): GridRowCell[] {
    return [
      { columnName: 'id', value: exam.examId?.toString() ?? '' },
      { columnName: 'exam_name', value: exam.examNameAr ?? null },
      { columnName: 'max_point', value: exam.examMaxPoint ?? null },
      { columnName: 'min_point', value: exam.examSucessMinPoint ?? null },
      { columnName: 'type', value: exam.examType ?? null },
      { columnName: 'exam_memo_point', value: exam.examMemoPoint ?? null },
      { columnName: 'exam_tjwid_app_point', value: exam.examTjwidAppPoint ?? null },
      { columnName: 'exam_tjwid_tho_point', value: exam.examTjwidThoPoint ?? null },
      {
        columnName: 'exam_performance_point',
        value: exam.examPerformancePoint ?? null,
      },
      { columnName: 'button', value: null },
    ];
  }
}
