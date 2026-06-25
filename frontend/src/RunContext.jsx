import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { fetchStats, triggerPipelineRun, fetchRunStatus } from './services/api';

const RunContext = createContext(null);

export const useRunContext = () => useContext(RunContext);

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 180000;

export const RunProvider = ({ children, onRefetch }) => {
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState(null);
  const pollRef = useRef(null);

  const clearPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const showToast = useCallback((message, type, duration = 4000) => {
    setToast({ message, type });
    if (duration > 0) setTimeout(() => setToast(null), duration);
  }, []);

  const pollForCompletion = useCallback((countBefore) => {
    const startTime = Date.now();

    pollRef.current = setInterval(async () => {
      if (Date.now() - startTime > POLL_TIMEOUT_MS) {
        clearPolling();
        setRunning(false);
        showToast("Pipeline is taking longer than expected. Check back shortly.", "error");
        return;
      }

      try {
        const data = await fetchRunStatus();

        if (data.status === 'complete') {
          clearPolling();
          setRunning(false);

          let newEvents = 0;
          try {
            const stats = await fetchStats();
            newEvents = Math.max(0, (stats.total_events || 0) - countBefore);
          } catch (e) { /* ignore */ }

          showToast(`Found ${newEvents} new events.`, "success");
          if (onRefetch) onRefetch();
        } else if (data.status === 'failed') {
          clearPolling();
          setRunning(false);
          const msg = data.error_message || "Pipeline run failed.";
          showToast(msg, "error");
        }
      } catch (e) {
        // Network error during polling — keep trying until timeout
      }
    }, POLL_INTERVAL_MS);
  }, [clearPolling, showToast, onRefetch]);

  const runPipeline = async () => {
    setRunning(true);
    showToast("Fetching the latest events — this may take a minute.", "loading", 0);

    let countBefore = 0;
    try {
      const stats = await fetchStats();
      countBefore = stats.total_events || 0;
    } catch (e) { /* ignore */ }

    try {
      await triggerPipelineRun();
      pollForCompletion(countBefore);
    } catch (err) {
      setRunning(false);

      if (err.status === 401) {
        showToast("Not authorized.", "error");
      } else if (err.status === 429) {
        showToast("A run was already started recently, try again later.", "error");
      } else {
        showToast("Run failed, try again.", "error");
      }
    }
  };

  return (
    <RunContext.Provider value={{ running, runPipeline }}>
      {toast && (
        <div className="fixed top-24 left-0 right-0 z-[100] flex justify-center pointer-events-none px-6">
          <div className={`bg-wander-card/95 backdrop-blur-xl border border-wander-secondary/20 shadow-clay-badge rounded-clay-full px-6 py-3 flex items-center gap-3 transition-all transform pointer-events-auto ${toast.type === 'error' ? 'border-red-500/50' : toast.type === 'success' ? 'border-green-500/50' : ''}`}>
            {toast.type === 'loading' && (
              <svg className="w-5 h-5 text-wander-primary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {toast.type === 'success' && (
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            )}
            <span className="text-wander-textMain text-sm font-syne font-bold tracking-wide">
              {toast.message}
            </span>
          </div>
        </div>
      )}
      {children}
    </RunContext.Provider>
  );
};