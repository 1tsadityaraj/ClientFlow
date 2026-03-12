"use client";

import { useState, useEffect, useRef } from "react";
import { Can } from "../../../../../components/Can";
import { FileText, Download, Upload } from "lucide-react";

function FileSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 rounded-xl border border-zinc-800 p-3">
      <div className="h-8 w-8 rounded bg-zinc-700" />
      <div className="h-4 flex-1 rounded bg-zinc-700" />
      <div className="h-4 w-16 rounded bg-zinc-700" />
    </div>
  );
}

export default function ProjectFilesTab({ projectId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  async function loadFiles() {
    const res = await fetch(`/api/projects/${projectId}/files`, {
      cache: "no-store",
    });
    if (!res.ok) {
      setError("Failed to load files");
      return;
    }
    const data = await res.json();
    setFiles(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadFiles().finally(() => setLoading(false));
  }, [projectId]);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);

    try {
      const presignRes = await fetch(`/api/projects/${projectId}/files/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });
      const presignData = await presignRes.json();
      if (!presignRes.ok) {
        setUploadError(presignData.error || "Failed to get upload URL");
        setUploading(false);
        return;
      }

      const putRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!putRes.ok) {
        setUploadError("Failed to upload file to storage");
        setUploading(false);
        return;
      }

      const metaRes = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          key: presignData.key,
          size: String(file.size),
          type: file.type || "application/octet-stream",
        }),
      });
      const metaData = await metaRes.json();
      if (!metaRes.ok) {
        setUploadError(metaData.error || "Failed to save file record");
        setUploading(false);
        return;
      }

      setFiles((prev) => [metaData, ...prev]);
    } catch (err) {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <FileSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-300">Files</h2>
        <Can permission="uploadFiles">
          <label className="flex cursor-pointer items-center gap-2 rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-400">
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading..." : "Upload"}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              disabled={uploading}
              onChange={handleFileSelect}
            />
          </label>
        </Can>
      </div>

      {uploadError && (
        <p className="text-xs text-rose-400">{uploadError}</p>
      )}

      <ul className="space-y-2">
        {files.map((f) => (
          <li
            key={f.id}
            className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"
          >
            <FileText className="h-5 w-5 shrink-0 text-zinc-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-50">
                {f.name}
              </p>
              <p className="text-xs text-zinc-500">
                {f.size} · {f.type}
                {f.uploadedBy?.name && ` · ${f.uploadedBy.name}`}
              </p>
            </div>
            {f.downloadUrl ? (
              <a
                href={f.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1 rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            ) : (
              <span className="text-xs text-zinc-500">No download link</span>
            )}
          </li>
        ))}
        {files.length === 0 && (
          <li className="rounded-xl border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
            No files yet.
          </li>
        )}
      </ul>
    </div>
  );
}
