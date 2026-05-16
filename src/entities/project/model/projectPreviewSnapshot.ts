const PREVIEW_SNAPSHOT_PREFIX = "stacklivo_preview_snapshot:";

function getPreviewSnapshotKey(previewPath) {
  return `${PREVIEW_SNAPSHOT_PREFIX}${previewPath}`;
}

export function saveProjectPreviewSnapshot(previewPath, project) {
  if (typeof localStorage === "undefined" || !previewPath || !project) {
    return;
  }

  localStorage.setItem(
    getPreviewSnapshotKey(previewPath),
    JSON.stringify({
      ...project,
      previewSavedAt: new Date().toISOString(),
    })
  );
}

export function loadProjectPreviewSnapshot(previewPath) {
  if (typeof localStorage === "undefined" || !previewPath) {
    return null;
  }

  try {
    const raw = localStorage.getItem(getPreviewSnapshotKey(previewPath));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
