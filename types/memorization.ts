export interface MemorizationRecord {
  id: string;
  name: string;
  halqa?: string;
  joinDate?: string;
  status: 'active' | 'inactive';
  surah: string; // اسم السورة
  ayah: string; // إلى آية
  notes?: string;
}
