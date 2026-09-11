/** Homepage project presentation data — images PHASE-LATER */

export type HomeProject = {
  id: number;
  title: string;
  location: string;
  status: 'active' | 'completed' | 'upcoming';
  progress: number;
  category: string;
  imageUrl?: string;
};

export const FEATURED_HOME_PROJECT: HomeProject = {
  id: 1,
  title: 'برج الأعمال المركزي',
  location: 'الرياض',
  status: 'active',
  progress: 72,
  category: 'أبراج تجارية',
};

export const COMPACT_HOME_PROJECTS: HomeProject[] = [
  {
    id: 2,
    title: 'مجمع الواحة السكني',
    location: 'الدمام',
    status: 'active',
    progress: 45,
    category: 'مجمعات سكنية',
  },
  {
    id: 3,
    title: 'جسر الملك عبدالله',
    location: 'جدة',
    status: 'completed',
    progress: 100,
    category: 'بنية تحتية',
  },
  {
    id: 4,
    title: 'مركز الابتكار التقني',
    location: 'الرياض',
    status: 'active',
    progress: 58,
    category: 'مباني تقنية',
  },
];

export const CAROUSEL_HOME_PROJECTS: HomeProject[] = [
  FEATURED_HOME_PROJECT,
  ...COMPACT_HOME_PROJECTS,
  {
    id: 5,
    title: 'واجهة الكورنيش التجارية',
    location: 'جدة',
    status: 'upcoming',
    progress: 12,
    category: 'تجاري',
  },
];

export const STATUS_LABELS: Record<HomeProject['status'], string> = {
  active: 'قيد التنفيذ',
  completed: 'مكتمل',
  upcoming: 'قريباً',
};
