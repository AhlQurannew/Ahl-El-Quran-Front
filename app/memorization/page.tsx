// app/.../page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MemorizationStats } from '@/components/memorization/MemorizationStats';
import { MemorizationSearch } from '@/components/memorization/MemorizationSearch';
import { MemorizationTable } from '@/components/memorization/MemorizationTable';
import { MemorizationForm, type AchievementFormValues } from '@/components/memorization/MemorizationForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import type { MemorizationRecord } from '@/types/memorization';

// ─── Config ─────────────────────────────────────────────────────────────
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function authHeaders(json = true): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── API-side types ─────────────────────────────────────────────────────
export interface ApiAchievement {
  id: number;
  student_id: number;
  from_surah: number;
  to_surah: number;
  from_verse: number;
  to_verse: number;
  note: string;
  achievement_type: string;
  date: string; // "DD-MM-YYYY"
}

interface AchievementsResponse {
  achievements: ApiAchievement[];
  total: number;
}

// ⚠️ ADJUST field names to match your real /students/ response
export interface ApiStudent {
  id: number;
  full_name?: string;
  name?: string;
  [key: string]: unknown;
}

export function studentDisplayName(s: ApiStudent): string {
  return `${s.firstname} ${s.lastname}` ?? s.name ?? `طالب #${s.id}`;
}

type ToastState = { visible: boolean; type: 'success' | 'error' | 'info'; message: string };
type StatusFilter = 'all' | 'active' | 'inactive';

// ─── Date helpers ────────────────────────────────────────────────────────
/** "19-12-2024" -> "2024-12-19" (for <input type="date">) */
function apiDateToInput(date: string): string {
  const [d, m, y] = date.split('-');
  if (!d || !m || !y) return '';
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/** "2024-12-19" -> "19-12-2024" */
function inputDateToApi(date: string): string {
  const [y, m, d] = date.split('-');
  if (!d || !m || !y) return date;
  return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
}

// ─── Mapping: raw achievement -> UI display record (for Table/Search/Stats) ──
function achievementToRecord(a: ApiAchievement, studentName: string): MemorizationRecord {
  return {
    id: String(a.id),
    name: studentName,
    halqa: '', // achievements API has no halqa field
    joinDate: apiDateToInput(a.date),
    status: 'active', // achievements API has no status field
    surah: `${a.from_surah} → ${a.to_surah}`,
    ayah: `${a.from_verse} → ${a.to_verse}`,
    notes: a.note,
  };
}

// ─── API calls ───────────────────────────────────────────────────────────
async function fetchStudents(): Promise<ApiStudent[]> {
  const res = await fetch(`${API_BASE_URL}/students/`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`فشل تحميل قائمة الطلاب (${res.status})`);
  const json = await res.json();
  // Handle either { students: [...] } or a bare array
  return Array.isArray(json) ? json : json.students ?? [];
}

async function fetchAchievements(studentId: number): Promise<ApiAchievement[]> {
  const res = await fetch(`${API_BASE_URL}/students/${studentId}/achievements`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`فشل تحميل السجلات (${res.status})`);
  const json: AchievementsResponse = await res.json();
  return json.achievements ?? [];
}

async function createAchievement(
  studentId: number,
  payload: Omit<ApiAchievement, 'id'>
): Promise<ApiAchievement> {
  const res = await fetch(`${API_BASE_URL}/students/${studentId}/achievements`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.detail?.[0]?.msg ?? `فشل إضافة السجل (${res.status})`);
  }
  return res.json();
}

async function updateAchievement(
  studentId: number,
  achievementId: number,
  payload: Omit<ApiAchievement, 'id'>
): Promise<ApiAchievement> {
  const res = await fetch(
    `${API_BASE_URL}/students/${studentId}/achievements/${achievementId}`,
    { method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload) }
  );
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.detail?.[0]?.msg ?? `فشل تعديل السجل (${res.status})`);
  }
  return res.json();
}

async function deleteAchievement(studentId: number, achievementId: number): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/students/${studentId}/achievements/${achievementId}`,
    { method: 'DELETE', headers: authHeaders(false) }
  );
  if (!res.ok) throw new Error(`فشل حذف السجل (${res.status})`);
}

// ─── Component ───────────────────────────────────────────────────────────
export default function MemorizationPage() {
  // students
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // achievements for the selected student
  const [achievements, setAchievements] = useState<ApiAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [halqaFilter, setHalqaFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<ApiAchievement | null>(null);
  const [deletingAchievement, setDeletingAchievement] = useState<ApiAchievement | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });
  const showToast = (type: ToastState['type'], message: string) =>
    setToast({ visible: true, type, message });

  // ── Load students once ──
  useEffect(() => {
    (async () => {
      setIsLoadingStudents(true);
      try {
        const list = await fetchStudents();
        setStudents(list);
        if (list.length > 0) setSelectedStudentId(list[0].id);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل الطلاب';
        showToast('error', message);
      } finally {
        setIsLoadingStudents(false);
      }
    })();
  }, []);

  // ── Load achievements for the selected student ──
  const loadAchievements = useCallback(async () => {
    if (selectedStudentId == null) {
      setAchievements([]);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAchievements(selectedStudentId);
      setAchievements(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء تحميل البيانات';
      setLoadError(message);
      showToast('error', message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [students, selectedStudentId]
  );

  // ── Display records (for Table/Search/Stats only) ──
  const records: MemorizationRecord[] = useMemo(
    () =>
      achievements.map((a) =>
        achievementToRecord(a, selectedStudent ? studentDisplayName(selectedStudent) : 'طالب')
      ),
    [achievements, selectedStudent]
  );

  const halqaOptions = useMemo(
    () => [...new Set(records.map((r) => r.halqa).filter(Boolean) as string[])].sort(),
    [records]
  );

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const q = query.toLowerCase();
      const matchesQuery =
        r.name.toLowerCase().includes(q) ||
        r.surah.toLowerCase().includes(q) ||
        r.ayah.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesHalqa = !halqaFilter || r.halqa === halqaFilter;
      return matchesQuery && matchesStatus && matchesHalqa;
    });
  }, [records, query, statusFilter, halqaFilter]);

  const stats = useMemo(
    () => ({
      total: records.length,
      active: records.filter((r) => r.status === 'active').length,
      inactive: records.filter((r) => r.status === 'inactive').length,
    }),
    [records]
  );

  // record shown in the delete confirm dialog
  const deletingRecord = useMemo(
    () => (deletingAchievement ? records.find((r) => r.id === String(deletingAchievement.id)) ?? null : null),
    [deletingAchievement, records]
  );

  // ── Handlers ──
  const openAddForm = () => {
    setEditingAchievement(null);
    setIsFormOpen(true);
  };

  const openEditForm = (record: MemorizationRecord) => {
    const achievement = achievements.find((a) => String(a.id) === record.id) ?? null;
    setEditingAchievement(achievement);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (record: MemorizationRecord) => {
    const achievement = achievements.find((a) => String(a.id) === record.id) ?? null;
    setDeletingAchievement(achievement);
  };

  const handleFormSubmit = async (data: AchievementFormValues) => {
    setIsSaving(true);
    try {
      const payload: Omit<ApiAchievement, 'id'> = {
        student_id: data.studentId,
        from_surah: data.fromSurah,
        to_surah: data.toSurah,
        from_verse: data.fromVerse,
        to_verse: data.toVerse,
        note: data.note,
        achievement_type: data.achievementType,
        date: inputDateToApi(data.date),
      };

      if (editingAchievement) {
        const updated = await updateAchievement(data.studentId, editingAchievement.id, payload);
        if (data.studentId === selectedStudentId) {
          setAchievements((prev) => prev.map((a) => (a.id === editingAchievement.id ? updated : a)));
        } else {
          // moved to another student — no longer belongs in the current list
          setAchievements((prev) => prev.filter((a) => a.id !== editingAchievement.id));
        }
        showToast('success', 'تم تعديل سجل الإنجاز بنجاح');
      } else {
        const created = await createAchievement(data.studentId, payload);
        if (data.studentId === selectedStudentId) {
          setAchievements((prev) => [created, ...prev]);
        }
        showToast('success', 'تمت إضافة سجل الإنجاز بنجاح');
      }
      setIsFormOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء الحفظ';
      showToast('error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAchievement) return;
    setIsDeleting(true);
    try {
      await deleteAchievement(deletingAchievement.student_id, deletingAchievement.id);
      setAchievements((prev) => prev.filter((a) => a.id !== deletingAchievement.id));
      showToast('success', 'تم حذف سجل الإنجاز بنجاح');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء الحذف';
      showToast('error', message);
    } finally {
      setIsDeleting(false);
      setDeletingAchievement(null);
    }
  };

  return (
    <AppLayout title="الحفظ والمراجعة" breadcrumb="الشؤون الإدارية / الحفظ والمراجعة">
      <div className="space-y-6">
        {/* Student selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">الطالب:</label>
          <select
            value={selectedStudentId ?? ''}
            onChange={(e) => setSelectedStudentId(Number(e.target.value))}
            disabled={isLoadingStudents || students.length === 0}
            className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500"
          >
            {students.length === 0 && <option value="">لا يوجد طلاب</option>}
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {studentDisplayName(s)}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <MemorizationStats total={stats.total} active={stats.active} inactive={stats.inactive} />

        {/* Search & Filters */}
        <MemorizationSearch
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          halqaFilter={halqaFilter}
          onHalqaFilterChange={setHalqaFilter}
          halqaOptions={halqaOptions}
          onAddRecord={openAddForm}
        />

        {/* Loading / error states */}
        {isLoading && <div className="py-10 text-center text-gray-500">جارٍ تحميل السجلات...</div>}
        {!isLoading && loadError && (
          <div className="py-10 text-center text-red-500">
            {loadError}
            <button onClick={loadAchievements} className="block mx-auto mt-2 text-sm text-blue-600 underline">
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Table */}
        {!isLoading && !loadError && (
          <MemorizationTable records={filtered} onEdit={openEditForm} onDelete={openDeleteConfirm} />
        )}
      </div>

      {/* Form Modal */}
      <MemorizationForm
        isOpen={isFormOpen}
        onClose={() => !isSaving && setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingAchievement={editingAchievement}
        students={students}
        isLoadingStudents={isLoadingStudents}
        defaultStudentId={selectedStudentId}
        isLoading={isSaving}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingAchievement}
        onClose={() => !isDeleting && setDeletingAchievement(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف سجل الإنجاز"
        message={`هل أنت متأكد من حذف سجل إنجاز "${deletingRecord?.name ?? ''}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        variant="danger"
      />

      {/* Toast */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </AppLayout>
  );
}