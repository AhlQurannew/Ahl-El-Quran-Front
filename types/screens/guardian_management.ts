import { Guardian } from './guardian.types';

export interface GuardianManagementScreenState {
  guardians: GuardianInfoDialog[];
  isLoading: boolean;
  error: string | null;
}

export interface GuardianInfoDialog {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  username: string;
  children: string[];
}

export interface GuardianGridRow {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  username: string;
  children: string;
  action?: string;
}

export interface GuardianGridColumn {
  columnName: string;
  label: string;
  allowSorting?: boolean;
  allowFiltering?: boolean;
  width?: number;
}

export const getGuardianGridColumns = (): GuardianGridColumn[] => {
  return [
    { columnName: 'id', label: 'ID' },
    { columnName: 'firstName', label: 'First Name' },
    { columnName: 'lastName', label: 'Last Name' },
    { columnName: 'dateOfBirth', label: 'Date of Birth' },
    { columnName: 'relationship', label: 'Relationship' },
    { columnName: 'phoneNumber', label: 'Phone' },
    { columnName: 'email', label: 'Email' },
    { columnName: 'username', label: 'Account' },
    { columnName: 'children', label: 'Children' },
    { columnName: 'action', label: 'Action', allowSorting: false, allowFiltering: false },
  ];
};

export const convertGuardianToGridRow = (guardian: GuardianInfoDialog): GuardianGridRow => {
  return {
    id: guardian.id.toString(),
    firstName: guardian.firstName,
    lastName: guardian.lastName,
    dateOfBirth: guardian.dateOfBirth,
    relationship: guardian.relationship,
    phoneNumber: guardian.phoneNumber,
    email: guardian.email,
    username: guardian.username,
    children: guardian.children.join(', '),
  };
};
