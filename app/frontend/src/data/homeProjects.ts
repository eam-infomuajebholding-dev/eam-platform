import type { ProjectImageKey } from '@/config/assetKeys';

/** Homepage project presentation — demo portfolio, not live CMS records */

export type HomeProject = {
  id: number;
  status: 'active' | 'completed' | 'upcoming';
  progress: number;
  imageKey: ProjectImageKey;
};

export const FEATURED_HOME_PROJECTS: HomeProject[] = [
  { id: 1, status: 'active', progress: 72, imageKey: 'luxuryResidential' },
  { id: 2, status: 'active', progress: 58, imageKey: 'businessCenter' },
  { id: 3, status: 'active', progress: 45, imageKey: 'specializedHospital' },
  { id: 4, status: 'upcoming', progress: 22, imageKey: 'commercialTower' },
];

/** @deprecated use FEATURED_HOME_PROJECTS */
export const FEATURED_HOME_PROJECT = FEATURED_HOME_PROJECTS[0];

/** @deprecated use FEATURED_HOME_PROJECTS */
export const COMPACT_HOME_PROJECTS = FEATURED_HOME_PROJECTS.slice(1);

/** @deprecated use FEATURED_HOME_PROJECTS */
export const CAROUSEL_HOME_PROJECTS = FEATURED_HOME_PROJECTS;
