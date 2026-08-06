import type { Appreciation } from '../../appreciation.types';

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

export class ExamNotesScreen {
  static readonly title = 'Exam Notes Management';
  static readonly managementType = 'examNotes';

  static readonly columns: GridColumnConfig[] = [
    { columnName: 'id', label: 'ID' },
    { columnName: 'max_point', label: 'Max Point' },
    { columnName: 'min_point', label: 'Min Point' },
    { columnName: 'note', label: 'Note' },
    {
      columnName: 'button',
      label: 'Action',
      allowSorting: false,
      allowFiltering: false,
    },
  ];

  static buildRow(appreciation: Appreciation): GridRowCell[] {
    return [
      { columnName: 'id', value: appreciation.appreciationId?.toString() ?? '' },
      { columnName: 'min_point', value: appreciation.pointMin ?? null },
      { columnName: 'max_point', value: appreciation.pointMax ?? null },
      { columnName: 'note', value: appreciation.note ?? null },
      { columnName: 'button', value: null },
    ];
  }
}
