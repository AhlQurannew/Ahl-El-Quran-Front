'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, NotebookPen, Pin, PinOff, Plus, Search, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import notesAPI, { TeacherNote, TeacherNoteChanges } from '@/app/API/notes';
import { useAuthStore } from '@/store/authStore';
import { getLocale, t } from '@/i18n';
import { cn } from '@/utils/cn';
import { describeError } from '@/utils/errorMessages';

const AUTOSAVE_DELAY_MS = 800;

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const sortNotes = (notes: TeacherNote[]) =>
  [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated_at.localeCompare(a.updated_at));

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(getLocale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function TeacherNotesPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const user = useAuthStore((state) => state.user);
  const [notes, setNotes] = useState<TeacherNote[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [toast, setToast] = useState({ visible: false, type: 'error' as 'success' | 'error' | 'info', message: '' });
  const pendingChanges = useRef<{ id: number; changes: TeacherNoteChanges } | null>(null);
  const saveTimer = useRef<number | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => setToast({ visible: true, type, message });

  useEffect(() => {
    if (user && user.role !== 'TEACHER') router.replace('/');
  }, [router, user]);

  useEffect(() => {
    notesAPI.listNotes()
      .then((data) => {
        setNotes(sortNotes(data));
        setSelectedId(data[0]?.id ?? null);
      })
      .catch((error) => showToast('error', describeError(error, t('تعذر تحميل الملاحظات'))))
      .finally(() => setIsLoading(false));
  }, []);

  /** Send whatever is queued for the note being edited. */
  const flush = useCallback(async () => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = null;
    const pending = pendingChanges.current;
    if (!pending) return;
    pendingChanges.current = null;
    setSaveState('saving');
    try {
      const saved = await notesAPI.updateNote(pending.id, pending.changes);
      setNotes((current) => current.map((note) => (note.id === saved.id ? { ...note, updated_at: saved.updated_at } : note)));
      setSaveState('saved');
    } catch (error) {
      setSaveState('error');
      showToast('error', describeError(error, t('تعذر حفظ الملاحظة')));
    }
  }, []);

  // Save before leaving the page or closing the tab.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!pendingChanges.current) return;
      void flush();
      event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      void flush();
    };
  }, [flush]);

  const editNote = (id: number, changes: TeacherNoteChanges) => {
    setNotes((current) => current.map((note) => (note.id === id ? { ...note, ...changes } : note)));
    if (pendingChanges.current && pendingChanges.current.id !== id) void flush();
    pendingChanges.current = { id, changes: { ...(pendingChanges.current?.changes ?? {}), ...changes } };
    setSaveState('saving');
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void flush(), AUTOSAVE_DELAY_MS);
  };

  const selectNote = async (id: number) => {
    await flush();
    setSelectedId(id);
    setSaveState('idle');
  };

  const createNote = async () => {
    await flush();
    try {
      const note = await notesAPI.createNote();
      setNotes((current) => sortNotes([note, ...current]));
      setSelectedId(note.id);
      setSaveState('idle');
    } catch (error) {
      showToast('error', describeError(error, t('تعذر إنشاء الملاحظة')));
    }
  };

  const togglePin = async (note: TeacherNote) => {
    await flush();
    try {
      const saved = await notesAPI.updateNote(note.id, { pinned: !note.pinned });
      setNotes((current) => sortNotes(current.map((item) => (item.id === saved.id ? saved : item))));
    } catch (error) {
      showToast('error', describeError(error, t('تعذر حفظ الملاحظة')));
    }
  };

  const removeNote = async (note: TeacherNote) => {
    const confirmed = await confirm({
      title: t('حذف الملاحظة'),
      message: t('هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.'),
      confirmText: t('نعم، احذف'),
      variant: 'danger',
    });
    if (!confirmed) return;
    if (pendingChanges.current?.id === note.id) {
      pendingChanges.current = null;
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    }
    try {
      await notesAPI.deleteNote(note.id);
      setNotes((current) => {
        const remaining = current.filter((item) => item.id !== note.id);
        if (selectedId === note.id) setSelectedId(remaining[0]?.id ?? null);
        return remaining;
      });
      setSaveState('idle');
      showToast('success', t('تم حذف الملاحظة'));
    } catch (error) {
      showToast('error', describeError(error, t('تعذر حذف الملاحظة')));
    }
  };

  const visibleNotes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return notes;
    return notes.filter((note) => `${note.title}\n${note.content}`.toLowerCase().includes(needle));
  }, [notes, query]);

  const selected = notes.find((note) => note.id === selectedId) ?? null;

  return (
    <AppLayout title="ملاحظاتي" breadcrumb="الشؤون التعليمية / ملاحظاتي">
      <Toast type={toast.type} message={toast.message} isVisible={toast.visible} onClose={() => setToast((p) => ({ ...p, visible: false }))} />
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 lg:flex-row">
        {/* Notes list */}
        <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm lg:w-80">
          <div className="space-y-3 border-b border-gray-100 p-4">
            <button
              type="button"
              onClick={createNote}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800"
            >
              <Plus size={17} /> {t('ملاحظة جديدة')}
            </button>
            <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm focus-within:border-sky-500">
              <Search size={16} className="text-gray-400" aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('ابحث في الملاحظات...')} className="w-full bg-transparent outline-none" aria-label={t('ابحث في الملاحظات...')} />
            </label>
          </div>
          <ul className="max-h-[60vh] flex-1 overflow-y-auto p-2 lg:max-h-none">
            {isLoading ? (
              <li className="flex justify-center py-8 text-gray-400"><Loader2 className="animate-spin" size={20} /></li>
            ) : visibleNotes.length === 0 ? (
              <li className="px-3 py-8 text-center text-sm text-gray-400">
                {notes.length === 0 ? t('لا توجد ملاحظات بعد') : t('لا توجد نتائج مطابقة للبحث')}
              </li>
            ) : (
              visibleNotes.map((note) => (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => selectNote(note.id)}
                    className={cn(
                      'w-full rounded-xl px-3 py-2.5 text-start transition-colors',
                      note.id === selectedId ? 'bg-sky-50 ring-1 ring-sky-200' : 'hover:bg-gray-50'
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {note.pinned && <Pin size={13} className="shrink-0 text-sky-600" aria-label={t('مثبتة')} />}
                      <span className="truncate text-sm font-semibold text-gray-800">{note.title || t('ملاحظة بدون عنوان')}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500">{note.content.split('\n')[0] || t('فارغة')}</span>
                    <span className="mt-1 block text-[11px] text-gray-400">{formatDate(note.updated_at)}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        {/* Editor */}
        <section className="flex min-h-[60vh] flex-1 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
          {selected ? (
            <>
              <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                <input
                  value={selected.title}
                  onChange={(event) => editNote(selected.id, { title: event.target.value })}
                  maxLength={200}
                  placeholder={t('عنوان الملاحظة')}
                  aria-label={t('عنوان الملاحظة')}
                  className="min-w-0 flex-1 bg-transparent text-lg font-bold text-gray-900 outline-none placeholder:text-gray-300"
                />
                <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400" role="status">
                  {saveState === 'saving' && <><Loader2 size={13} className="animate-spin" /> {t('جاري الحفظ...')}</>}
                  {saveState === 'saved' && <><Check size={13} className="text-emerald-600" /> {t('تم الحفظ')}</>}
                  {saveState === 'error' && <span className="text-red-600">{t('لم يتم الحفظ')}</span>}
                </span>
                <button type="button" onClick={() => togglePin(selected)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label={selected.pinned ? t('إلغاء التثبيت') : t('تثبيت')} title={selected.pinned ? t('إلغاء التثبيت') : t('تثبيت')}>
                  {selected.pinned ? <PinOff size={17} /> : <Pin size={17} />}
                </button>
                <button type="button" onClick={() => removeNote(selected)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={t('حذف الملاحظة')} title={t('حذف الملاحظة')}>
                  <Trash2 size={17} />
                </button>
              </div>
              <textarea
                value={selected.content}
                onChange={(event) => editNote(selected.id, { content: event.target.value })}
                maxLength={20000}
                placeholder={t('اكتب ما تريد هنا: خطة الحصة، ملاحظات عن الطلاب، أفكار...')}
                aria-label={t('نص الملاحظة')}
                className="min-h-[50vh] flex-1 resize-none bg-transparent px-5 py-4 text-sm leading-7 text-gray-800 outline-none placeholder:text-gray-300"
              />
              <p className="border-t border-gray-100 px-5 py-2 text-[11px] text-gray-400">
                {t('تُحفظ تلقائياً · ملاحظاتك خاصة ولا يراها غيرك')}
              </p>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
              <NotebookPen size={44} className="text-gray-300" />
              <p className="font-medium text-gray-700">{t('مسودتك الخاصة')}</p>
              <p className="max-w-sm text-sm text-gray-500">{t('دوّن خطط الحصص وملاحظاتك عن الطلاب وأفكارك. تُحفظ الملاحظات تلقائياً ولا يراها أحد غيرك.')}</p>
              <button type="button" onClick={createNote} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800">
                <Plus size={17} /> {t('ملاحظة جديدة')}
              </button>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
