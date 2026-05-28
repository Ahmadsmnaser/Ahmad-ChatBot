'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  uploadFile,
  clearRag,
  deleteRagFile,
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_LABEL,
  UploadedFile,
  UploadStatus,
} from '@/lib/api';

export type { UploadedFile, UploadStatus };

export function useRag(sessionId: string | null, accessToken?: string) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  // Track previous sessionId to detect actual session switches (not initial mount)
  const prevSessionId = useRef(sessionId);
  const uploadControllers = useRef<Map<string, AbortController>>(new Map());

  useEffect(() => {
    if (prevSessionId.current !== sessionId) {
      uploadControllers.current.forEach((controller) => controller.abort());
      uploadControllers.current.clear();
      prevSessionId.current = sessionId;
      setFiles([]);
    }
  }, [accessToken, sessionId]);

  // sid param lets the caller pass a just-created session ID before React's state updates
  const upload = useCallback(async (file: File, sid?: string) => {
    const effectiveSid = sid ?? sessionId;
    if (!effectiveSid || !accessToken) return;

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setFiles((prev) => [
        ...prev.filter((f) => f.fileName !== file.name),
        {
          fileName: file.name,
          chunks: 0,
          status: 'failed' as UploadStatus,
          error: `Max ${MAX_UPLOAD_SIZE_LABEL}`,
        },
      ]);
      return;
    }

    const controller = new AbortController();
    uploadControllers.current.set(file.name, controller);
    setFiles((prev) => [
      ...prev.filter((f) => f.fileName !== file.name),
      { fileName: file.name, chunks: 0, status: 'uploading' },
    ]);

    try {
      const result = await uploadFile(accessToken, effectiveSid, file, (status) => {
        setFiles((prev) =>
          prev.map((f) => (f.fileName === file.name ? { ...f, status } : f))
        );
      }, controller.signal);
      setFiles((prev) =>
        prev.map((f) => (f.fileName === file.name ? { ...f, ...result } : f))
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setFiles((prev) => prev.filter((f) => f.fileName !== file.name));
        return;
      }
      setFiles((prev) =>
        prev.map((f) => (f.fileName === file.name ? { ...f, status: 'failed' as UploadStatus } : f))
      );
    } finally {
      uploadControllers.current.delete(file.name);
    }
  }, [accessToken, sessionId]);

  const remove = useCallback(async (fileName: string) => {
    const file = files.find((f) => f.fileName === fileName);
    const controller = uploadControllers.current.get(fileName);
    if (controller) {
      controller.abort();
      uploadControllers.current.delete(fileName);
      setFiles((prev) => prev.filter((f) => f.fileName !== fileName));
      return;
    }

    setFiles((prev) => prev.filter((f) => f.fileName !== fileName));
    if (file?.status === 'ready' && sessionId && accessToken) {
      try {
        await deleteRagFile(accessToken, sessionId, fileName);
      } catch {
        // The chip has already been removed; future full clears still reset session RAG state.
      }
    }
  }, [accessToken, files, sessionId]);

  const clear = useCallback(async () => {
    uploadControllers.current.forEach((controller) => controller.abort());
    uploadControllers.current.clear();
    if (!sessionId || !accessToken) {
      setFiles([]);
      return;
    }
    await clearRag(accessToken, sessionId);
    setFiles([]);
  }, [accessToken, sessionId]);

  const hasReadyFiles = files.some((f) => f.status === 'ready');

  return { files, upload, remove, clear, hasReadyFiles };
}
