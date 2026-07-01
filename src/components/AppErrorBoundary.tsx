import { useEffect, useState, type ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

export default function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  const [state, setState] = useState<AppErrorBoundaryState>({
    hasError: false,
    message: "",
  });

  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      setState({
        hasError: true,
        message: event.error?.message || event.message || "Unexpected browser error",
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error
        ? event.reason.message
        : typeof event.reason === "string"
          ? event.reason
          : "Unexpected unhandled promise rejection";

      setState({
        hasError: true,
        message: reason,
      });
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  if (state.hasError) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-10">
        <div className="max-w-2xl w-full rounded-3xl border border-slate-700/70 bg-slate-900/95 shadow-2xl shadow-black/40 p-8 md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
            System fault captured
          </div>
          <h1 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Solomon X stayed online, but a panel crashed.
          </h1>
          <p className="mt-4 text-sm md:text-base leading-7 text-slate-300">
            The app caught a runtime error before it could blank the entire interface. You can reload the page if the issue persists.
          </p>
          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 break-words">
            {state.message}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setState({ hasError: false, message: "" })}
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Retry interface
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-slate-600 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/70"
            >
              Reload app
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}