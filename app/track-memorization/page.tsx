'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toast } from '@/components/ui/Toast';
import lecturesAPI, { Lecture } from '@/app/API/lectures';

type ToastState = { visible: boolean; type: 'success' | 'info' | 'error'; message: string };

export default function TrackMemorizationPage() {
  const router = useRouter();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });

  const showToast = (type: ToastState['type'], message: string) =>
    setToast({ visible: true, type, message });

  useEffect(() => {
    // Set today's date as default
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);

    loadLectures();
  }, []);

  const loadLectures = async () => {
    setIsLoading(true);
    try {
      const response = await lecturesAPI.getAllLectures();
      setLectures(response);
      if (response.length > 0) {
        setSelectedLecture(response[0]);
      }
    } catch (err: any) {
      console.error('Error loading lectures:', err);
      showToast('error', err.response?.data?.detail || 'فشل تحميل الحلقات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedLecture) {
      showToast('info', 'الرجاء اختيار الحلقة');
      return;
    }
    if (!date) {
      showToast('info', 'الرجاء اختيار التاريخ');
      return;
    }

    // Convert date from YYYY-MM-DD to DD-MM-YYYY for API
    const [yyyy, mm, dd] = date.split('-');
    const apiDate = `${dd}-${mm}-${yyyy}`;

    // Navigate to students list with lecture and date
    router.push(
      `/track-memorization/students?lectureId=${selectedLecture.lecture_id}&lectureName=${encodeURIComponent(selectedLecture.lecture_name_ar)}&date=${encodeURIComponent(apiDate)}`
    );
  };

  return (
    <AppLayout title="متابعة الحفظ والمراجعة" breadcrumb="الشؤون الإدارية / متابعة الحفظ والمراجعة">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Banner */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm">
          متابعة الحفظ والمراجعة / الصفحة الرئيسية
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="w-full max-w-3xl space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <>
                {/* Lecture Selection Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-teal-500/10 rounded-lg">
                      <svg
                        className="w-6 h-6 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">الحلقة</h2>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر الحلقة
                    </label>
                    <select
                      value={selectedLecture?.lecture_id || ''}
                      onChange={(e) => {
                        const lecture = lectures.find(
                          (l) => l.lecture_id === Number(e.target.value)
                        );
                        setSelectedLecture(lecture || null);
                      }}
                      disabled={lectures.length === 0}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    >
                      {lectures.length === 0 ? (
                        <option value="">لا توجد حلقات متاحة</option>
                      ) : (
                        lectures.map((lecture) => (
                          <option key={lecture.lecture_id} value={lecture.lecture_id}>
                            {lecture.lecture_name_ar}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Date Selection Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-teal-500/10 rounded-lg">
                      <svg
                        className="w-6 h-6 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">التاريخ</h2>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر التاريخ
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedLecture || !date}
                    className="px-12 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    رجاء قم باختيار التاريخ والحلقة
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </AppLayout>
  );
}
