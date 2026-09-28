'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Student } from '@/types/student';
import { User, Mail, Calendar, MapPin, Flag, IdCard, BookOpen } from 'lucide-react';

interface StudentDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const StudentDetailsDialog: React.FC<StudentDetailsDialogProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  if (!student) return null;

  const DetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | undefined }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
        <Icon size={18} className="text-teal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-words">
          {value || <span className="text-gray-400">—</span>}
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="معلومات الطالب"
      size="md"
      footer={
        <Button variant="ghost" size="sm" onClick={onClose}>
          إغلاق
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Student Photo and Name */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl border border-teal-200/50">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white flex items-center justify-center border-4 border-white shadow-md flex-shrink-0">
            {student.photo ? (
              <img
                src={student.photo}
                alt={`${student.firstName} ${student.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-teal-600">
                {student.firstName?.charAt(0) ?? '؟'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {student.firstName} {student.lastName}
            </h3>
            <p className="text-sm text-gray-600">
              {student.gender === 'male' ? 'ذكر' : 'أنثى'}
            </p>
          </div>
        </div>

        {/* Student Details */}
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
          <DetailRow 
            icon={Mail} 
            label="البريد الإلكتروني / اسم المستخدم" 
            value={student.username} 
          />
          <DetailRow 
            icon={BookOpen} 
            label="الحلقة" 
            value={student.halqa} 
          />
          <DetailRow 
            icon={Calendar} 
            label="تاريخ الميلاد" 
            value={student.dob} 
          />
          <DetailRow 
            icon={MapPin} 
            label="مكان الميلاد" 
            value={student.pob} 
          />
          <DetailRow 
            icon={Flag} 
            label="الجنسية" 
            value={student.nationality} 
          />
          <DetailRow 
            icon={IdCard} 
            label="نوع الهوية" 
            value={student.idType} 
          />
        </div>
      </div>
    </Modal>
  );
};
