import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useJobs } from "../context/useJobs";
import { PulsingBorderBox } from "./PulsingBorderBox";

type UploadState = "idle" | "uploading" | "done";

const PREVIEW_BOX_CLASS = "h-40 w-full";

export function ImageUploader() {
  const { uploadFile, sessionReady } = useJobs();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [state, setState] = useState<UploadState>("idle");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!sessionReady) {
        setLocalError("Connecting to server… try again in a moment.");
        return;
      }

      setLocalError(null);
      setFileName(file.name);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      setState("uploading");

      const job = await uploadFile(file);
      if (job) {
        setState("done");
      } else {
        setState("idle");
      }
    },
    [sessionReady, uploadFile],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void handleFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    void handleFile(e.dataTransfer.files[0]);
  };

  const chooseAnother = () => {
    inputRef.current?.click();
  };

  const hasPreview = previewUrl != null;
  const showChooseAnother =
    hasPreview && state !== "uploading";

  return (
    <PulsingBorderBox className="w-full">
      <h1 className="text-center text-lg font-medium text-zinc-100">
        Upload an image
      </h1>
      <p className="mt-1 text-center text-sm text-zinc-500">
        JPEG or PNG · max 5 MB
      </p>

      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`mt-6 flex cursor-pointer flex-col items-center rounded-xl border border-dashed px-6 py-6 transition-colors ${
          dragOver
            ? "border-indigo-400/60 bg-indigo-500/10"
            : "border-zinc-700 bg-zinc-950/50 hover:border-zinc-600 hover:bg-zinc-900/80"
        } ${!sessionReady ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          disabled={!sessionReady || state === "uploading"}
          onChange={onInputChange}
        />

        <div
          className={`${PREVIEW_BOX_CLASS} flex shrink-0 items-center justify-center`}
        >
          {hasPreview ? (
            <img
              src={previewUrl}
              alt="Preview"
              className={`${PREVIEW_BOX_CLASS} rounded-lg object-contain`}
            />
          ) : (
            <svg
              className="h-10 w-10 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          )}
        </div>

        <span className="mt-3 text-sm text-zinc-300">
          {!sessionReady
            ? "Starting session…"
            : dragOver
              ? "Drop image here"
              : hasPreview
                ? "Click or drag to replace"
                : "Click or drag an image"}
        </span>
        {fileName && (
          <span className="mt-1 max-w-full truncate text-xs text-zinc-500">
            {fileName}
          </span>
        )}
      </label>

      {state === "uploading" && (
        <p className="mt-4 text-center text-sm text-indigo-300">Uploading…</p>
      )}
      {state === "done" && (
        <p className="mt-4 text-center text-sm text-emerald-400">
          Upload complete — processing started.
        </p>
      )}
      {localError && (
        <p className="mt-4 text-center text-sm text-red-400" role="alert">
          {localError}
        </p>
      )}

      {showChooseAnother && (
        <button
          type="button"
          onClick={chooseAnother}
          className="mt-4 w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
        >
          Choose another image
        </button>
      )}
    </PulsingBorderBox>
  );
}
