'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LectureTable } from '@/components/lectures/LectureTable';
import AddLectureModal from '@/components/lectures/AddLectureModal';
import { DeleteConfirmModal } from '@/components/lectures/DeleteConfirmModal';
import { Toast } from '@/components/ui/Toast';
import lecturesAPI, { type Lecture } from '@/api/lectures';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  CheckSquare, 
  XSquare, 
  Printer,
  ChevronDown,
  FileSpreadsheet
} from 'lucide-react';

export default function LecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const INITIAL_COUNT = 5;
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_COUNT);

  
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  
  const [toastConfig, setToastConfig] = useState<{
    isVisible: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({
    isVisible: false,
    type: 'success',
    message: '',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastConfig({
      isVisible: true,
      type,
      message,
    });
  };

  const hideToast = () => {
    setToastConfig((prev) => ({ ...prev, isVisible: false }));
  };

  
  const fetchLectures = async () => {
    setIsLoading(true);
    try {
      const data = await lecturesAPI.getAllLectures();
      setLectures(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des halaqat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const filteredLectures = lectures.filter((lecture) =>
    lecture.lecture_name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lecture.lecture_name_en?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  const displayedLectures = filteredLectures.slice(0, visibleCount);

  
  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const handleOpenAddModal = () => {
    setEditingLecture(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (selectedIds.length !== 1) return;

    const targetId = selectedIds[0];
    const selectedLecture = lectures.find(
      (item) => Number(item.lecture_id) === Number(targetId)
    );

    if (selectedLecture) {
      setEditingLecture(selectedLecture);
      setIsAddModalOpen(true);
    }
  };
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredLectures.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLectures.map((l) => l.lecture_id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };


  const handleConfirmDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);

    try {
      for (const id of selectedIds) {
        await lecturesAPI.deleteLecture(id);
      }
      setSelectedIds([]);
      setIsDeleteModalOpen(false);
      fetchLectures();

      showToast('تم حذف الحلقة بنجاح', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showToast('حدث خطأ أثناء عملية الحذف', 'error');
    } finally {
      setIsDeleting(false);
    }
  };


  const handleSuccess = () => {
    const isEdit = Boolean(editingLecture);
    setIsAddModalOpen(false);
    setEditingLecture(null);
    setSelectedIds([]);
    fetchLectures();

    showToast(isEdit ? 'تم تحديث الحلقة بنجاح' : 'تمت إضافة الحلقة بنجاح', 'success');
  };

  
  const handleExportExcel = async () => {
    try {
      
      const XLSX = await import('xlsx');

      const listToExport = selectedIds.length > 0
        ? filteredLectures.filter(l => selectedIds.includes(l.lecture_id))
        : filteredLectures;

      if (listToExport.length === 0) {
        showToast('لا توجد بيانات للتصدير', 'info');
        return;
      }

      
      const excelData = listToExport.map((lecture) => {
        
        const teachersStr = (lecture.teachers || [])
          .map((t) => {
            const name = `${t.firstname || t.first_name || ''} ${t.lastname || t.last_name || ''}`.trim();
            return name || null;
          })
          .filter(Boolean)
          .join(' - ');

        
        const schedulesStr = (lecture.schedules || [])
          .map((s) => `${s.day_of_week} (${s.start_time} - ${s.end_time})`)
          .join(' / ');

        
        const catMap: Record<string, string> = {
          male: 'ذكور',
          female: 'إناث',
          both: 'ذكور وإناث',
        };
        const categoryAr = catMap[lecture.category?.toLowerCase()] || lecture.category || '—';

        return {
          'اسم الحلقة (بالعربية)': lecture.lecture_name_ar || '',
          'اسم الحلقة (بالإنجليزية)': lecture.lecture_name_en || '',
          'نوع الحلقة': lecture.circle_type || '',
          'الفئة': categoryAr,
          'عدد الطلاب': lecture.student_count ?? 0,
          'المعلمون': teachersStr || '—',
          'التوقيت والأيام': schedulesStr || '—',
          'الظهور في الموقع': lecture.shown_on_website ? 'نعم' : 'لا',
        };
      });

      
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'الحلقات');

      
      worksheet['!cols'] = [
        { wch: 25 }, // اسم الحلقة (بالعربية)
        { wch: 25 }, // اسم الحلقة (بالإنجليزية)
        { wch: 18 }, // نوع الحلقة
        { wch: 15 }, // الفئة
        { wch: 12 }, // عدد الطلاب
        { wch: 30 }, // المعلمون
        { wch: 35 }, // التوقيت والأيام
        { wch: 15 }, // الظهور في الموقع
      ];
      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `قائمة_الحلقات_${dateStr}.xlsx`);

      showToast('تم تصدير ملف Excel بنجاح', 'success');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      showToast('حدث خطأ أثناء تصدير ملف Excel', 'error');
    }
  };

  return (
    <AppLayout title="الحلقات" breadcrumb="الشؤون الإدارية/الحلقات">
      <Toast
        type={toastConfig.type}
        message={toastConfig.message}
        isVisible={toastConfig.isVisible}
        onClose={hideToast}
      />

      <div className="space-y-6">
        
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm">
          <h2>إدارة الحلقات / الصفحة الرئيسية</h2>
        </div>


        <div className="relative">
          <input
            type="text"
            placeholder="البحث..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(INITIAL_COUNT); 
            }}
            className="w-full bg-white border border-gray-200 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-right text-gray-700 placeholder-gray-400 shadow-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>

        
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} />
              إضافة
            </button>

            <button
              onClick={handleOpenEditModal}
              disabled={selectedIds.length !== 1}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 ${
                selectedIds.length === 1
                  ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Edit size={14} />
              تعديل
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={selectedIds.length === 0}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 ${
                selectedIds.length > 0
                  ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Trash2 size={14} />
              حذف
            </button>

            <button
              onClick={handleToggleSelectAll}
              className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <CheckSquare size={14} />
              تحديد الكل
            </button>

            <button
              onClick={handleDeselectAll}
              disabled={selectedIds.length === 0}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 ${
                selectedIds.length > 0
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <XSquare size={14} />
              إلغاء
            </button>
          </div>

          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-5 py-2 text-xs font-bold rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/70 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet size={14} />
              تصدير Excel
            </button>

            <button
              onClick={() => window.print()}
              className="px-5 py-2 text-xs font-bold rounded-xl border border-amber-500 text-amber-600 hover:bg-amber-50 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Printer size={14} />
              طباعة
            </button>
          </div>
        </div>

        
        <LectureTable
          lectures={displayedLectures}
          totalCount={filteredLectures.length}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          isLoading={isLoading}
        />

        {/* 🔹 Bouton "Voir plus" (See More) */}
        {!isLoading && visibleCount < filteredLectures.length && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleSeeMore}
              className="px-5 py-2 text-xs font-bold rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/70 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span>عرض المزيد</span>
              <ChevronDown size={16} />
            </button>
          </div>
        )}

        
        <AddLectureModal
          isOpen={isAddModalOpen}
          initialData={editingLecture}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingLecture(null);
          }}
          onSuccess={handleSuccess}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          count={selectedIds.length}
          isLoading={isDeleting}
        />
      </div>
    </AppLayout>
  );
}