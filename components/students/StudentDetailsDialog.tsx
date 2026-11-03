'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StudentPhoto } from '@/components/students/StudentPhoto';
import type { Student } from '@/types/student';
import { Mail, Calendar, MapPin, Flag, IdCard, BookOpen, type LucideIcon } from 'lucide-react';
import guardianAPI from '@/app/API/guardian';
import type { Guardian } from '@/types/guardian';
import { t } from '@/i18n';

interface StudentDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

type GuardianLoadResult = { guardianId: number; guardian?: Guardian; error?: true };

const DetailRow = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | undefined }) => (
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

export const StudentDetailsDialog: React.FC<StudentDetailsDialogProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const [guardianLoadResult, setGuardianLoadResult] = useState<GuardianLoadResult | null>(null);
  const guardianId = student?.guardianId;

  useEffect(() => {
    if (!isOpen || !guardianId) return;
    let active = true;
    guardianAPI.getGuardian(guardianId)
      .then((guardian) => {
        if (active) setGuardianLoadResult({ guardianId, guardian });
      })
      .catch(() => {
        if (active) setGuardianLoadResult({ guardianId, error: true });
      });
    return () => { active = false; };
  }, [isOpen, guardianId]);

  if (!student) return null;
  const guardianResult = guardianId && guardianLoadResult?.guardianId === guardianId
    ? guardianLoadResult
    : null;
  const linkedGuardian = guardianResult?.guardian;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("معلومات الطالب")}
      size="md"
      footer={
        <Button variant="ghost" size="sm" onClick={onClose}>
          {t("إغلاق")}
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Student Photo and Name */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl border border-teal-200/50">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white flex items-center justify-center border-4 border-white shadow-md flex-shrink-0">
            <StudentPhoto
              studentId={student.id}
              photo={student.photo}
              alt={`${student.firstName} ${student.lastName}`}
              className="w-full h-full object-cover"
              fallback={(
                <span className="text-2xl font-bold text-teal-600">
                  {student.firstName?.charAt(0) ?? t("؟")}
                </span>
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {student.firstName} {student.lastName}
            </h3>
            <p className="text-sm text-gray-600">
              {student.gender === 'male' ? t("ذكر") : t("أنثى")}
            </p>
          </div>
        </div>

        {/* Student Details */}
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
          <DetailRow 
            icon={Mail} 
            label={t("البريد الإلكتروني / اسم المستخدم")} 
            value={student.username} 
          />
          <DetailRow 
            icon={BookOpen} 
            label={t("الحلقة")} 
            value={student.halqa} 
          />
          <DetailRow 
            icon={Calendar} 
            label={t("تاريخ الميلاد")} 
            value={student.dob} 
          />
          <DetailRow 
            icon={MapPin} 
            label={t("مكان الميلاد")} 
            value={student.pob} 
          />
          <DetailRow 
            icon={Flag} 
            label={t("الجنسية")} 
            value={student.nationality} 
          />
          <DetailRow 
            icon={IdCard} 
            label={t("نوع الهوية")} 
            value={student.idType} 
          />
        </div>

        <section className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <h4 className="mb-3 text-sm font-bold text-gray-800">{t("ولي الأمر المرتبط")}</h4>
          {!guardianId ? (
            <p className="text-sm text-gray-500">{t("لا يوجد ولي أمر مرتبط بهذا الطالب.")}</p>
          ) : !guardianResult ? (
            <p className="text-sm text-gray-500">{t("جاري تحميل بيانات ولي الأمر...")}</p>
          ) : linkedGuardian ? (
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-800">{linkedGuardian.firstName} {linkedGuardian.lastName}</p>
              <p className="text-gray-600">{t("صلة القرابة:")}{' '}{linkedGuardian.relationship || '—'}</p>
              {linkedGuardian.phoneNumber && <p dir="ltr" className="text-right text-gray-600">{linkedGuardian.phoneNumber}</p>}
              {linkedGuardian.email && <p className="text-gray-600">{t("بريد التواصل:")}{' '}{linkedGuardian.email}</p>}
              {linkedGuardian.username && <p className="text-gray-600">{t("اسم المستخدم:")}{' '}{linkedGuardian.username}</p>}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-800">
                {student.guardianName || t("ولي أمر")}
              </p>
              {student.guardianEmail && <p className="text-gray-600">{t("بريد التواصل:")}{' '}{student.guardianEmail}</p>}
              <p className="text-xs text-gray-500">
                {student.guardianName || student.guardianEmail
                  ? t("تعذر تحميل بقية بيانات ولي الأمر.")
                  : t("تعذر تحميل بيانات ولي الأمر.")}
              </p>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
};
