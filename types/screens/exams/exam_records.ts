import type { Appreciation } from '../../appreciation.types';
import type { Exam } from '../../exam.types';
import type { ExamStudent } from '../../exam_student.types';
import type { PersonalInfo } from '../../personal_info.types';

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

export interface ExamRecordInfoDialog {
  exam: Exam;
  personalInfo: PersonalInfo;
  examStudent: ExamStudent;
  appreciation: Appreciation;
}

export class ExamRecordsScreen {
  static readonly title = 'Exam Records Management';
  static readonly managementType = 'students';

  static readonly columns: GridColumnConfig[] = [
    { columnName: 'id', label: 'ID' },
    { columnName: 'exam_name', label: 'Exam Name' },
    { columnName: 'student_name', label: 'Student Name' },
    { columnName: 'max_point', label: 'Max Point' },
    { columnName: 'min_point', label: 'Min Point' },
    { columnName: 'type', label: 'Type' },
    { columnName: 'exam_memo_point', label: 'Memorization Point' },
    { columnName: 'exam_tjwid_app_point', label: 'Tjwid Applicative Point' },
    { columnName: 'exam_tjwid_tho_point', label: 'Tjwid Theoric Point' },
    { columnName: 'exam_performance_point', label: 'Performance Point' },
    { columnName: 'appreciation', label: 'Appreciation' },
    {
      columnName: 'button',
      label: 'Action',
      allowSorting: false,
      allowFiltering: false,
    },
  ];

  static buildRow(record: ExamRecordInfoDialog): GridRowCell[] {
    return [
      { columnName: 'id', value: record.exam.examId?.toString() ?? '' },
      { columnName: 'exam_name', value: record.exam.examNameAr ?? null },
      {
        columnName: 'student_name',
        value: `${record.personalInfo.firstNameAr} ${record.personalInfo.lastNameAr}`.trim(),
      },
      { columnName: 'max_point', value: record.exam.examMaxPoint ?? null },
      { columnName: 'min_point', value: record.exam.examSucessMinPoint ?? null },
      { columnName: 'type', value: record.exam.examType ?? null },
      { columnName: 'exam_memo_point', value: record.examStudent.pointHifd ?? null },
      {
        columnName: 'exam_tjwid_app_point',
        value: record.examStudent.pointTajwidApplicative ?? null,
      },
      {
        columnName: 'exam_tjwid_tho_point',
        value: record.examStudent.pointTajwidTheoric ?? null,
      },
      {
        columnName: 'exam_performance_point',
        value: record.examStudent.pointPerformance ?? null,
      },
      { columnName: 'appreciation', value: record.appreciation.note ?? null },
      { columnName: 'button', value: null },
    ];
  }
}
