import { useState, useEffect, useCallback } from "react";
import { Project } from "../types/gallery";
import { getProjects, createProject, deleteProject, updateProject } from "../services/dbService";

export function useProjects(searchQuery: string = "", categoryFilter: string = "all") {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleCreate = async (projectData: Partial<Project> & { title: string; clientName: string; slug: string }) => {
    const created = await createProject(projectData);
    await loadProjects();
    return created;
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdate = async (id: string, updates: Partial<Project>) => {
    await updateProject(id, updates);
    await loadProjects();
  };

  return {
    projects: filteredProjects,
    allProjects: projects,
    loading,
    error,
    refresh: loadProjects,
    createProject: handleCreate,
    deleteProject: handleDelete,
    updateProject: handleUpdate,
  };
}
