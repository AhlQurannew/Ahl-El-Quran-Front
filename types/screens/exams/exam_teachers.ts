import type { Exam } from '../../exam.types';
import type { Teacher } from '../../teacher.types';

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

export interface ExamTeacherInfoDialog {
  techer: Teacher;
  exam: Exam[];
}

export class ExamTeachersScreen {
  static readonly title = 'Exam Teachers Management';
  static readonly managementType = 'examTeacher';

  static readonly columns: GridColumnConfig[] = [
    { columnName: 'id', label: 'ID' },
    { columnName: 'exam_name', label: 'Exam Name' },
    { columnName: 'teacher_name', label: 'Teacher Name' },
    {
      columnName: 'button',
      label: 'Action',
      allowSorting: false,
      allowFiltering: false,
    },
  ];

  static buildRow(entry: ExamTeacherInfoDialog): GridRowCell[] {
    return [
      { columnName: 'id', value: entry.techer.teacherAccountId?.toString() ?? '' },
      {
        columnName: 'exam_name',
        value: entry.exam.length
          ? entry.exam.map((examItem) => examItem.examNameAr ?? '').join(', ')
          : 'غير مسؤول عن اي اختبار',
      },
      {
        columnName: 'teacher_name',
        value: `${entry.techer.firstName ?? ''} ${entry.techer.lastName ?? ''}`.trim(),
      },
      { columnName: 'button', value: null },
    ];
  }
}
