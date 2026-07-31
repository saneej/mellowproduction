import { useState, useEffect, useCallback, useMemo } from "react";
import { Project, EventFolder, MediaItem } from "../types/gallery";
import { getProjectBySlug, getEventsByProject, getMediaByEvent, getSortedMedia } from "../services/dbService";

export function useGallery(projectSlug?: string, eventSlug?: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [eventFolder, setEventFolder] = useState<EventFolder | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<'manual' | 'date_created' | 'file_name' | 'file_size'>('manual');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  const loadGalleryData = useCallback(async () => {
    if (!projectSlug) return;
    setLoading(true);
    setError(null);
    try {
      const proj = await getProjectBySlug(projectSlug);
      if (!proj) {
        setError("Project not found");
        return;
      }
      setProject(proj);

      const events = await getEventsByProject(proj.id);
      const targetEvt = events.find(e => e.slug === eventSlug) || events[0];

      if (targetEvt) {
        setEventFolder(targetEvt);
        const media = await getMediaByEvent(targetEvt.id);
        setMediaItems(media);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, [projectSlug, eventSlug]);

  useEffect(() => {
    loadGalleryData();
  }, [loadGalleryData]);

  const sortedMedia = useMemo(() => {
    return getSortedMedia(mediaItems, sortBy, sortOrder);
  }, [mediaItems, sortBy, sortOrder]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(mediaItems.map(m => m.id)));
  }, [mediaItems]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    project,
    eventFolder,
    mediaItems: sortedMedia,
    rawMediaItems: mediaItems,
    loading,
    error,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    favoritedIds,
    setFavoritedIds,
    refresh: loadGalleryData
  };
}
