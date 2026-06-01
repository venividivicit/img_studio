import { ErrorBanner } from "./components/ErrorBanner";
import { ImageUploader } from "./components/ImageUploader";
import { WorkHistory } from "./components/WorkHistory";
import { JobsProvider } from "./context/JobsContext";
import { useJobs } from "./context/useJobs";

function Studio() {
  const { bannerError, clearBannerError } = useJobs();

  return (
    <div className="flex w-full max-w-3xl flex-col gap-10">
      {bannerError && (
        <ErrorBanner error={bannerError} onDismiss={clearBannerError} />
      )}
      <ImageUploader />
      <WorkHistory />
    </div>
  );
}

function App() {
  return (
    <JobsProvider>
      <main className="flex min-h-screen justify-center bg-zinc-950 px-4 py-10 sm:px-8">
        <Studio />
      </main>
    </JobsProvider>
  );
}

export default App;
