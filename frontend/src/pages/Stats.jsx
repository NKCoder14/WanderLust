import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchEvents, fetchStats } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClayCard from '../components/ui/ClayCard';

const SkeletonStats = () => (
  <div className="space-y-10 animate-pulse">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <ClayCard key={i} className="!p-6 h-32 bg-wander-base/40 border-none" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ClayCard className="!p-8 h-64 bg-wander-base/40 border-none" />
      <ClayCard className="!p-8 h-64 bg-wander-base/40 border-none" />
    </div>
    <ClayCard className="!p-8 h-80 bg-wander-base/40 border-none" />
  </div>
);

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, eventsRes] = await Promise.all([fetchStats(), fetchEvents()]);
      setStats(statsRes);
      setEvents(eventsRes.events ?? []);
    } catch (err) {
      console.error(err);
      setError("Backend is unreachable. Showing mock data for preview.");
      setStats({
        total_events: 142,
        avg_score: 8.4,
        by_source: {
          mlh: 45,
          devfolio: 62,
          luma: 20,
          google: 15
        },
        by_city: {
          'Bengaluru': 35,
          'Delhi': 28,
          'Mumbai': 22,
          'Pune': 15,
          'Hyderabad': 12,
          'Chennai': 8
        }
      });
      const mockEvents = [];
      for (let i = 0; i < 15; i++) mockEvents.push({ relevance_score: 2 });
      for (let i = 0; i < 40; i++) mockEvents.push({ relevance_score: 5 });
      for (let i = 0; i < 87; i++) mockEvents.push({ relevance_score: 8 });
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const { topSource, topCity, topCities, distribution } = useMemo(() => {
    if (!stats || !events) return { topSource: '—', topCity: '—', topCities: [], distribution: { '1-3': 0, '4-6': 0, '7-10': 0 } };

    const sources = Object.entries(stats.by_source || {});
    sources.sort((a, b) => b[1] - a[1]);
    const ts = sources.length > 0 ? sources[0][0] : '—';

    const cities = Object.entries(stats.by_city || {}).filter(([c]) => c !== 'Online');
    cities.sort((a, b) => b[1] - a[1]);
    const tc = cities.length > 0 ? cities[0][0] : '—';
    const top5Cities = cities.slice(0, 5);

    const dist = { '1-3': 0, '4-6': 0, '7-10': 0 };
    events.forEach(e => {
      const score = e.relevance_score ?? 0;
      if (score >= 1 && score <= 3) dist['1-3']++;
      else if (score >= 4 && score <= 6) dist['4-6']++;
      else if (score >= 7 && score <= 10) dist['7-10']++;
    });

    return { topSource: ts, topCity: tc, topCities: top5Cities, distribution: dist };
  }, [stats, events]);

  const maxDistCount = Math.max(...Object.values(distribution || {}), 1);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-aurora text-wander-textMuted font-outfit selection:bg-wander-primary selection:text-wander-base overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[#0a4a5e] rounded-full blur-[140px] opacity-[0.03]" />
          <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-[#1a3a6e] rounded-full blur-[150px] opacity-[0.05]" />
          <div className="absolute bottom-[10%] left-[30%] w-[550px] h-[550px] bg-[#1a1040] rounded-full blur-[140px] opacity-[0.05]" />
        </div>
        <section className="relative z-10 pt-36 pb-8 max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-black font-syne text-wander-textMain mb-3 tracking-tight">
            Statistics
          </h1>
          <p className="text-lg opacity-70 max-w-xl leading-relaxed">
            A breakdown of what we've found across the ecosystem.
          </p>
        </section>
        <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
          {loading ? (
            <SkeletonStats />
          ) : (
            <div className="space-y-10">
              {error && (
                <div className="bg-wander-card/80 border border-wander-primary/50 text-wander-textMain px-6 py-4 rounded-clay shadow-clay-badge flex items-center gap-4">
                  <svg className="w-6 h-6 text-wander-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="font-syne font-bold">{error}</p>
                  </div>
                  <button onClick={loadData} className="ml-auto px-4 py-1.5 bg-wander-base/50 hover:bg-wander-primary/20 rounded-clay text-sm font-bold font-syne transition-colors border border-wander-secondary/30">
                    Retry
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <ClayCard className="!p-6 flex flex-col items-center text-center justify-center">
                  <p className="text-xs text-wander-textMuted uppercase tracking-widest font-syne font-bold mb-2">Total Events</p>
                  <p className="text-4xl font-black font-syne text-wander-textMain">{stats.total_events}</p>
                </ClayCard>
                <ClayCard className="!p-6 flex flex-col items-center text-center justify-center">
                  <p className="text-xs text-wander-textMuted uppercase tracking-widest font-syne font-bold mb-2">Avg Score</p>
                  <p className="text-4xl font-black font-syne text-wander-primary">{stats.avg_score}</p>
                </ClayCard>
                <ClayCard className="!p-6 flex flex-col items-center text-center justify-center">
                  <p className="text-xs text-wander-textMuted uppercase tracking-widest font-syne font-bold mb-2">Top Source</p>
                  <p className="text-2xl md:text-3xl font-black font-syne text-wander-textMain capitalize truncate w-full">{topSource}</p>
                </ClayCard>
                <ClayCard className="!p-6 flex flex-col items-center text-center justify-center">
                  <p className="text-xs text-wander-textMuted uppercase tracking-widest font-syne font-bold mb-2">Top City</p>
                  <p className="text-2xl md:text-3xl font-black font-syne text-wander-textMain truncate w-full">{topCity}</p>
                </ClayCard>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClayCard className="!p-8">
                  <h3 className="text-xl font-bold font-syne text-wander-textMain mb-8 flex items-center gap-3">
                    <svg className="w-5 h-5 text-wander-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Events by Source
                  </h3>
                  <div className="space-y-6">
                    {Object.entries(stats.by_source || {}).sort((a, b) => b[1] - a[1]).map(([source, count]) => {
                      const percentage = stats.total_events > 0 ? (count / stats.total_events) * 100 : 0;
                      return (
                        <div key={source}>
                          <div className="flex justify-between text-sm mb-2 font-syne font-bold text-wander-textMain">
                            <span className="capitalize tracking-wide">{source}</span>
                            <span>{count}</span>
                          </div>
                          <div className="w-full bg-wander-base/80 rounded-full h-3 shadow-inner overflow-hidden border border-wander-secondary/10">
                            <div
                              className="bg-wander-primary h-full rounded-full shadow-clay-badge transition-all duration-1000 ease-out"
                              style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ClayCard>
                <ClayCard className="!p-8">
                  <h3 className="text-xl font-bold font-syne text-wander-textMain mb-8 flex items-center gap-3">
                    <svg className="w-5 h-5 text-wander-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Top Cities
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {topCities.length > 0 ? topCities.map(([city, count], idx) => (
                      <div key={city} className="flex items-center gap-2 px-4 py-2.5 rounded-clay-full bg-wander-base/50 border border-wander-secondary/30 shadow-sm transition-transform hover:scale-105">
                        <span className="text-wander-primary font-bold text-lg font-syne">#{idx + 1}</span>
                        <span className="text-wander-textMain font-medium">{city}</span>
                        <span className="text-wander-textMuted text-sm">({count})</span>
                      </div>
                    )) : (
                      <p className="text-wander-textMuted text-sm">No city data available</p>
                    )}
                  </div>
                </ClayCard>
              </div>
              <ClayCard className="!p-8">
                <h3 className="text-xl font-bold font-syne text-wander-textMain mb-10 flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#673AB7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Relevance Distribution
                </h3>
                <div className="flex items-end justify-around h-64 mt-4 px-4 md:px-12 border-b border-wander-secondary/20 pb-4 relative">                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-4 opacity-10">
                  <div className="w-full h-px bg-wander-textMain" />
                  <div className="w-full h-px bg-wander-textMain" />
                  <div className="w-full h-px bg-wander-textMain" />
                  <div className="w-full h-px bg-wander-textMain" />
                </div>
                  {['1-3', '4-6', '7-10'].map(range => {
                    const count = distribution[range];
                    const heightPct = maxDistCount > 0 ? Math.max((count / maxDistCount) * 100, 2) : 0; // min 2% height
                    return (
                      <div key={range} className="flex-1 flex flex-col items-center gap-3 relative z-10 group">
                        <span className="text-wander-textMain font-bold bg-wander-card px-3 py-1 rounded-clay-full text-sm border border-wander-secondary/20 shadow-clay-badge opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12">
                          {count} events
                        </span>
                        <div
                          className="w-full max-w-[80px] md:max-w-[120px] rounded-t-xl transition-all duration-1000 ease-out flex items-start justify-center pt-3"
                          style={{
                            height: `${heightPct}%`,
                            background: range === '1-3' ? 'linear-gradient(to top, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.8))' :
                              range === '4-6' ? 'linear-gradient(to top, rgba(234, 179, 8, 0.2), rgba(234, 179, 8, 0.8))' :
                                'linear-gradient(to top, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.8))'
                          }}>
                          <span className="text-white/80 font-bold text-sm drop-shadow-md">{count}</span>
                        </div>
                        <span className="text-sm text-wander-textMuted font-syne font-bold tracking-widest uppercase mt-2">Score {range}</span>
                      </div>
                    );
                  })}
                </div>
              </ClayCard>
            </div>
          )}
        </section>
        <Footer />
      </div>
    </>
  );
};

export default Stats;