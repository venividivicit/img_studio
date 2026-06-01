import { userFacingMessage, type AppApiError } from "../api/errors";

type ErrorBannerProps = {
  error: AppApiError;
  onDismiss: () => void;
};

const SOURCE_LABEL: Record<AppApiError["source"], string> = {
  api: "Server",
  network: "Network",
  client: "Validation",
};

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  return (
    <div
      className="flex gap-3 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3"
      role="alert"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-red-200">
          {userFacingMessage(error)}
        </p>
        <p className="mt-1 text-xs text-red-400/80">
          <span className="font-mono">{error.code}</span>
          {error.status != null && (
            <>
              {" "}
              · HTTP {error.status}
            </>
          )}
          {" · "}
          {SOURCE_LABEL[error.source]}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 cursor-pointer rounded-lg px-2 py-1 text-xs text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-100"
        aria-label="Dismiss error"
      >
        Dismiss
      </button>
    </div>
  );
}
