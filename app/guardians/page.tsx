'use client';

import { escapeHtml } from '@/utils/html';
import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { AppLayout } from '@/components/layout/AppLayout';
import { GuardianForm, type GuardianFormData } from '@/components/guardians/GuardianForm';
import { GuardianSearch } from '@/components/guardians/GuardianSearch';
import { GuardianStats } from '@/components/guardians/GuardianStats';
import { GuardianTable } from '@/components/guardians/GuardianTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import guardianAPI, { type GuardianProfilePayload } from '@/app/API/guardian';
import type { Guardian } from '@/types/guardian';
import { t, getDir, getLang } from '@/i18n';
import { useConfirm } from '@/components/ui/ConfirmProvider';

type ToastState = { visible: boolean; type: 'success' | 'error' | 'info'; message: string };

function errorMessage(error: unknown, fallback: string): string {
  const responseDetail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (typeof responseDetail === 'string') return responseDetail;
  if (responseDetail) return JSON.stringify(responseDetail);
  return error instanceof Error ? error.message : fallback;
}

function toProfilePayload(data: GuardianFormData): GuardianProfilePayload {
  return {
    guardian_info: {
      first_name: data.firstName,
      last_name: data.lastName,
      relationship: data.relationship,
      date_of_birth: data.dateOfBirth || null,
      phone_number: data.phoneNumber || null,
      email: data.email || null,
      job: data.job || null,
      address: data.address || null,
    },
    student_ids: data.studentIds,
  };
}

export default function GuardiansPage() {
  const confirm = useConfirm();
  const [guardians, setGuardians] = useState<Guardian[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [guardianToDelete, setGuardianToDelete] = useState<Guardian[]>([]);
  const [guardianDetails, setGuardianDetails] = useState<Guardian | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });

  const showToast = (type: ToastState['type'], message: string) => setToast({ visible: true, type, message });

  const loadGuardians = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const result = await guardianAPI.getAllGuardians();
      setGuardians(result);
      setSelectedIds((current) => current.filter((id) => result.some((guardian) => guardian.id === id)));
    } catch (error) {
      setLoadError(errorMessage(error, t("تعذر تحميل بيانات أولياء الأمور")));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    guardianAPI.getAllGuardians()
      .then((result) => { if (active) setGuardians(result); })
      .catch((error: unknown) => { if (active) setLoadError(errorMessage(error, t("تعذر تحميل بيانات أولياء الأمور"))); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return guardians;
    return guardians.filter((guardian) => [
      guardian.firstName,
      guardian.lastName,
      guardian.email ?? '',
      guardian.username,
      guardian.relationship,
      guardian.address ?? '',
      guardian.job ?? '',
      guardian.phoneNumber ?? '',
      ...guardian.students.map((student) => `${student.firstName} ${student.lastName}`),
    ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)));
  }, [guardians, query]);

  const toggleSelection = (id: number) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds((current) => filtered.length > 0 && filtered.every((guardian) => current.includes(guardian.id))
      ? current.filter((id) => !filtered.some((guardian) => guardian.id === id))
      : Array.from(new Set([...current, ...filtered.map((guardian) => guardian.id)])));
  };

  const openAddForm = () => {
    setEditingGuardian(null);
    setIsFormOpen(true);
  };

  const openEditForm = () => {
    if (selectedIds.length !== 1) return;
    const guardian = guardians.find((item) => item.id === selectedIds[0]);
    if (!guardian) return;
    setEditingGuardian(guardian);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: GuardianFormData) => {
    const confirmed = await confirm(editingGuardian
      ? { title: t('تأكيد الحفظ'), message: t('هل أنت متأكد من حفظ تعديلات ولي الأمر {name}؟', { name: `${data.firstName} ${data.lastName}` }), confirmText: t('نعم، احفظ') }
      : { title: t('تأكيد الإضافة'), message: t('هل أنت متأكد من إضافة ولي الأمر {name}؟', { name: `${data.firstName} ${data.lastName}` }), confirmText: t('نعم، أضف') });
    if (!confirmed) return;
    setIsSubmitting(true);
    try {
      const profilePayload = toProfilePayload(data);
      if (editingGuardian) {
        await guardianAPI.updateGuardian(editingGuardian.id, {
          ...profilePayload,
          account_info: {
            username: data.username.trim(),
            ...(data.password.trim() ? { password: data.password } : {}),
          },
        });
        showToast('success', t("تم تعديل بيانات ولي الأمر {firstName} {lastName}", { firstName: data.firstName, lastName: data.lastName }));
      } else {
        await guardianAPI.createGuardian({
          ...profilePayload,
          account_info: { username: data.username.trim(), password: data.password },
        });
        showToast('success', t("تمت إضافة ولي الأمر {firstName} {lastName} بنجاح", { firstName: data.firstName, lastName: data.lastName }));
      }
      setIsFormOpen(false);
      setSelectedIds([]);
      await loadGuardians();
    } catch (error) {
      showToast('error', errorMessage(error, t("تعذر حفظ بيانات ولي الأمر")));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const results = await Promise.allSettled(guardianToDelete.map(({ id }) => guardianAPI.deleteGuardian(id)));
      const deletedCount = results.filter((result) => result.status === 'fulfilled').length;
      const failedCount = results.length - deletedCount;
      setSelectedIds((current) => current.filter((id) => !guardianToDelete.some((guardian) => guardian.id === id)));
      setGuardianToDelete([]);
      await loadGuardians();
      showToast(failedCount ? 'error' : 'success', failedCount
        ? t("تم حذف {deletedCount} وتعذر حذف {failedCount} من أولياء الأمور", { deletedCount, failedCount })
        : t("تم حذف {deletedCount} من أولياء الأمور بنجاح", { deletedCount }));
    } catch (error) {
      showToast('error', errorMessage(error, t("تعذر حذف أولياء الأمور")));
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => {
    const rows = filtered.map((guardian, index) => `<tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(`${guardian.firstName} ${guardian.lastName}`)}</td>
      <td>${escapeHtml(guardian.relationship || '-')}</td>
      <td>${escapeHtml(guardian.phoneNumber || '-')}</td>
      <td>${escapeHtml(guardian.students.map((student) => `${student.firstName} ${student.lastName}`).join('، ') || '-')}</td>
    </tr>`).join('');
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.write(`<!doctype html><html dir="${getDir()}" lang="${getLang()}"><head><meta charset="UTF-8"><title>${t('قائمة أولياء الأمور')}</title><style>body{font-family:Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:10px;border:1px solid #ddd;text-align:${getDir() === 'rtl' ? 'right' : 'left'}}th{background:#115e59;color:#fff}</style></head><body><h1>${t('قائمة أولياء الأمور')}</h1><table><thead><tr><th>#</th><th>${t('الاسم')}</th><th>${t('صلة القرابة')}</th><th>${t('الهاتف')}</th><th>${t('الطلاب')}</th></tr></thead><tbody>${rows}</tbody></table><p>${t('المجموع: {count}', { count: filtered.length })}</p></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportExcel = () => {
    const rows = filtered.map((guardian) => ({
      [t("الاسم")]: `${guardian.firstName} ${guardian.lastName}`,
      [t("صلة القرابة")]: guardian.relationship,
      [t("الهاتف")]: guardian.phoneNumber || '-',
      [t("بريد التواصل")]: guardian.email || '-',
      [t("اسم مستخدم الحساب")]: guardian.username,
      [t("الطلاب")]: guardian.students.map((student) => `${student.firstName} ${student.lastName}`).join(t("، ")),
      [t("العنوان")]: guardian.address || '-',
      [t("المهنة")]: guardian.job || '-',
      [t("الحالة")]: guardian.isActive ? t("نشط") : t("غير نشط"),
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t("أولياء الأمور"));
    XLSX.writeFile(workbook, t("قائمة_أولياء_الأمور.xlsx"));
  };

  return (
    <AppLayout title={t("أولياء الأمور")} breadcrumb={t("الشؤون الإدارية / أولياء الأمور")}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-xl bg-amber-500/85 px-6 py-3.5 text-sm font-semibold text-white shadow-sm">
          {t("إدارة أولياء الأمور / الصفحة الرئيسية")}
        </div>
        <GuardianStats guardians={guardians} />
        <GuardianSearch
          query={query}
          onQueryChange={setQuery}
          selectedCount={selectedIds.length}
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={() => setGuardianToDelete(guardians.filter((guardian) => selectedIds.includes(guardian.id)))}
          onSelectAll={toggleSelectAll}
          onCancelSelection={() => setSelectedIds([])}
          onPrint={handlePrint}
          onExportExcel={handleExportExcel}
        />
        {loadError && !isLoading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{loadError}</span>
            <button onClick={() => void loadGuardians()} className="ms-3 font-bold underline">{t("إعادة المحاولة")}</button>
          </div>
        )}
        <GuardianTable
          guardians={filtered}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelection}
          onToggleSelectAll={toggleSelectAll}
          onPlusClick={setGuardianDetails}
          isLoading={isLoading}
        />
      </div>

      {isFormOpen && (
        <GuardianForm
          key={editingGuardian?.id ?? 'new-guardian'}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmit}
          editingGuardian={editingGuardian}
          isSubmitting={isSubmitting}
        />
      )}
      <ConfirmDialog
        isOpen={guardianToDelete.length > 0}
        onClose={() => setGuardianToDelete([])}
        onConfirm={() => void handleDelete()}
        title={t("تأكيد حذف أولياء الأمور")}
        message={t("هل أنت متأكد من حذف {length} ولي أمر؟ لا يمكن التراجع عن هذا الإجراء.", { length: guardianToDelete.length })}
        confirmText={isDeleting ? t("جارٍ الحذف...") : t("نعم، احذف")}
        cancelText={t("إلغاء")}
        variant="danger"
      />
      <Modal isOpen={Boolean(guardianDetails)} onClose={() => setGuardianDetails(null)} title={t("تفاصيل ولي الأمر")} size="md">
        {guardianDetails && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{guardianDetails.firstName} {guardianDetails.lastName}</h3>
              <p className="text-gray-500">{guardianDetails.relationship}</p>
            </div>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><dt className="text-gray-500">{t("الهاتف")}</dt><dd dir="ltr" className="text-right font-medium">{guardianDetails.phoneNumber || '—'}</dd></div>
              <div><dt className="text-gray-500">{t("بريد التواصل")}</dt><dd className="font-medium">{guardianDetails.email || '—'}</dd></div>
              <div><dt className="text-gray-500">{t("اسم مستخدم الحساب")}</dt><dd className="font-medium">{guardianDetails.username || '—'}</dd></div>
              <div><dt className="text-gray-500">{t("الحالة")}</dt><dd className="font-medium">{guardianDetails.isActive ? t("نشط") : t("غير نشط")}</dd></div>
            </dl>
            <div>
              <h4 className="mb-2 font-bold">{t("الطلاب المرتبطون")}</h4>
              {guardianDetails.students.length ? (
                <ul className="list-inside list-disc space-y-1 text-gray-700">
                  {guardianDetails.students.map((student) => <li key={student.id}>{student.firstName} {student.lastName}</li>)}
                </ul>
              ) : <p className="text-gray-500">{t("لا يوجد طلاب مرتبطون.")}</p>}
            </div>
          </div>
        )}
      </Modal>
      <Toast type={toast.type} message={toast.message} isVisible={toast.visible} onClose={() => setToast((current) => ({ ...current, visible: false }))} />
    </AppLayout>
  );
}
