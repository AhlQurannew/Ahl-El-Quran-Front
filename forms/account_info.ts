// forms/account_info.ts
import { BaseModel } from '../types/model.types';

export type AccountType = 'Student' | 'Teacher' | 'Supervisor' | 'Admin' | 'Guardian';

export interface AccountInfo extends BaseModel {
  username?: string;
  passcode?: string;
  accountType?: AccountType | string;
}

export const AccountInfoMapper = {
  createEmpty(): AccountInfo {
    return {
      username: '',
      passcode: '',
      accountType: 'Student',
      isComplete: false,
    };
  },

  fromJson(json: Record<string, unknown>): AccountInfo {
    const username = typeof json.username === 'string' ? json.username : '';
    const passcode = typeof json.passcode === 'string' ? json.passcode : '';
    const accountType = typeof json.accountType === 'string' ? json.accountType : 'Student';

    return {
      username,
      passcode,
      accountType,
      isComplete: Boolean(username && passcode),
    };
  },

  toJson(info: AccountInfo): Record<string, unknown> {
    return {
      username: info.username || '',
      passcode: info.passcode || '',
      accountType: info.accountType || 'Student',
    };
  },
};
