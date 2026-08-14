// ─── useNovel hook ────────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { useProjectStore } from '@/store/projectStore';

export function useNovel() {
  const { projects, activeProjectId, loadProjects, createProject, setActiveProject } = useProjectStore();
  const activeProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : undefined;

  const initProject = useCallback(
    async (profile: Parameters<typeof createProject>[0]) => {
      const project = await createProject(profile);
      setActiveProject(project.id);
      return project;
    },
    [createProject, setActiveProject],
  );

  return {
    projects,
    activeProjectId,
    activeProject,
    loadProjects,
    initProject,
    setActiveProject,
  };
}
