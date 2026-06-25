import { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchEvents, fetchStats } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import ClayCard from '../components/ui/ClayCard';

const SOURCES = [
  { key: 'all', label: 'All Sources' },
  { key: 'mlh', label: 'MLH', color: 'bg-wander-primary' },
  { key: 'devfolio', label: 'Devfolio', color: 'bg-wander-accent' },
  { key: 'luma', label: 'Luma', color: 'bg-[#673AB7]' },
  { key: 'google', label: 'Google', color: 'bg-blue-500' },
];

const SkeletonCard = () => (
  <ClayCard className="flex flex-col h-full relative overflow-hidden !p-0 border-none">
    <div className="w-full h-40 bg-[#0A121E] animate-pulse" />
    <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
      <div className="h-7 w-3/4 rounded-lg bg-wander-secondary/30 animate-pulse" />
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-clay-full bg-wander-secondary/20 animate-pulse" />
        <div className="h-5 w-20 rounded-clay-full bg-wander-secondary/20 animate-pulse" />
      </div>
      <div className="space-y-2 mt-2">
        <div className="h-4 w-1/2 rounded bg-wander-secondary/15 animate-pulse" />
        <div className="h-4 w-1/3 rounded bg-wander-secondary/15 animate-pulse" />
      </div>
      <div className="h-20 w-full rounded-xl bg-wander-base/40 animate-pulse mt-2" />
      <div className="h-12 w-full rounded-clay bg-wander-secondary/20 animate-pulse mt-4" />
    </div>
  </ClayCard>
);

const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-32 text-center">
    <ClayCard className="!p-12 flex flex-col items-center max-w-md">
      <div className="w-24 h-24 rounded-full bg-wander-base/60 flex items-center justify-center mb-8 shadow-clay-badge border border-wander-secondary/20">
        <svg className="w-12 h-12 text-wander-primary opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold font-syne text-wander-textMain mb-3">No events found</h3>
      <p className="text-wander-textMuted leading-relaxed">
        Try adjusting your filters or search query to discover more events.
      </p>
    </ClayCard>
  </div>
);

const RangeSlider = ({ min, max, value, onChange }) => {
  const [localMin, localMax] = value;
  const pctLeft = ((localMin - min) / (max - min)) * 100;
  const pctRight = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2 min-w-[180px]">
      <div className="flex items-center justify-between text-xs text-wander-textMuted font-syne font-bold">
        <span>Score</span>
        <span className="text-wander-primary">{localMin} – {localMax}</span>
      </div>
      <div className="relative h-2 bg-wander-base/60 rounded-full">
        <div
          className="absolute top-0 h-full bg-wander-primary/50 rounded-full"
          style={{ left: `${pctLeft}%`, width: `${pctRight - pctLeft}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          value={localMin}
          onChange={e => {
            const v = Math.min(Number(e.target.value), localMax);
            onChange([v, localMax]);
          }}
          className="range-thumb absolute top-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-wander-primary [&::-webkit-slider-thumb]:shadow-clay-badge [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-wander-textMain [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-wander-primary [&::-moz-range-thumb]:shadow-clay-badge [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-wander-textMain [&::-moz-range-thumb]:cursor-pointer" />
        <input
          type="range"
          min={min}
          max={max}
          value={localMax}
          onChange={e => {
            const v = Math.max(Number(e.target.value), localMin);
            onChange([localMin, v]);
          }}
          className="range-thumb absolute top-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-wander-primary [&::-webkit-slider-thumb]:shadow-clay-badge [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-wander-textMain [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-wander-primary [&::-moz-range-thumb]:shadow-clay-badge [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-wander-textMain [&::-moz-range-thumb]:cursor-pointer" />
      </div>
    </div>
  );
};

const Events = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSource, setActiveSource] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [scoreRange, setScoreRange] = useState([1, 10]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsRes, statsRes] = await Promise.all([fetchEvents(), fetchStats()]);
      const evts = eventsRes.events ?? [];
      setAllEvents(evts);
      setTotalCount(statsRes.total_events ?? evts.length);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setAllEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const cities = useMemo(() => {
    const set = new Set(allEvents.map(e => e.location).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(e => {
      if (activeSource !== 'all' && e.source !== activeSource) return false;
      if (selectedCity !== 'all' && e.location !== selectedCity) return false;
      const score = e.relevance_score ?? 0;
      if (score < scoreRange[0] || score > scoreRange[1]) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = `${e.title} ${e.location} ${e.source} ${e.why_relevant ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allEvents, activeSource, selectedCity, scoreRange, searchQuery]);

  const clearFilters = () => {
    setActiveSource('all');
    setSelectedCity('all');
    setScoreRange([1, 10]);
    setSearchQuery('');
  };

  const hasActiveFilters = activeSource !== 'all' || selectedCity !== 'all' || scoreRange[0] !== 1 || scoreRange[1] !== 10 || searchQuery.trim() !== '';

  return (
    <>
      <Header />
      <div className="fixed top-[8.5rem] left-0 right-0 z-40 px-6">
        <ClayCard className="!rounded-clay-lg max-w-7xl mx-auto border border-wander-secondary/20 bg-wander-card/95 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex flex-wrap gap-2">
              {SOURCES.map(s => (
                <button
                  key={s.key}
                  onClick={() => setActiveSource(s.key)}
                  className={`
                    px-4 py-2 rounded-clay-full text-xs font-syne font-bold tracking-wider uppercase
                    transition-all duration-200 border
                    ${activeSource === s.key
                      ? 'bg-wander-primary text-wander-textMain border-wander-primary shadow-clay-badge scale-105'
                      : 'bg-wander-base/50 text-wander-textMuted border-wander-secondary/30 hover:border-wander-primary/50 hover:text-wander-textMain'}`}>
                  {s.key !== 'all' && (
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${s.color}`} />
                  )}
                  {s.label}
                </button>
              ))}
            </div>
            <div className="hidden lg:block w-px h-10 bg-wander-secondary/20 shrink-0" />
            <div className="relative min-w-[160px]">
              <label className="block text-xs text-wander-textMuted font-syne font-bold uppercase tracking-widest mb-1.5">City</label>
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="w-full appearance-none bg-wander-base/60 border border-wander-secondary/30 rounded-clay text-sm text-wander-textMain px-4 py-2.5 pr-10 font-medium focus:outline-none focus:border-wander-primary transition-colors cursor-pointer">
                {cities.map(c => (
                  <option key={c} value={c} className="bg-wander-base text-wander-textMain">
                    {c === 'all' ? 'All Cities' : c}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 bottom-3 w-4 h-4 text-wander-textMuted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <RangeSlider min={1} max={10} value={scoreRange} onChange={setScoreRange} />
            <div className="hidden lg:block w-px h-10 bg-wander-secondary/20 shrink-0" />
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-wander-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-wander-base/60 border border-wander-secondary/30 rounded-clay text-sm text-wander-textMain pl-11 pr-4 py-2.5 font-medium placeholder:text-wander-textMuted/50 focus:outline-none focus:border-wander-primary transition-colors" />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-wander-primary hover:text-wander-accent font-syne font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>
        </ClayCard>
      </div>
      <div className="min-h-screen bg-aurora text-wander-textMuted font-outfit selection:bg-wander-primary selection:text-wander-base overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[#0a4a5e] rounded-full blur-[140px] opacity-[0.03]" />
          <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-[#1a3a6e] rounded-full blur-[150px] opacity-[0.05]" />
          <div className="absolute bottom-[10%] left-[30%] w-[550px] h-[550px] bg-[#1a1040] rounded-full blur-[140px] opacity-[0.05]" />
        </div>
        <section className="relative z-10 pt-96 pb-8 max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-5xl font-black font-syne text-wander-textMain mb-3 tracking-tight">
                Explore Events
              </h1>
              <p className="text-lg opacity-70 max-w-xl leading-relaxed">
                Discover hackathons, tech summits, and developer meetups happening across India - all scored by AI for your profile.
              </p>
            </div>
            <div className="shrink-0">
              <ClayCard className="!p-4 flex items-center gap-4 !rounded-clay">
                <div className="w-12 h-12 rounded-full bg-wander-primary/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-wander-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-wander-textMuted uppercase tracking-widest font-syne font-bold">Total Events</p>
                  <p className="text-3xl font-black font-syne text-wander-textMain leading-none mt-1">
                    {loading ? '—' : totalCount}
                  </p>
                </div>
              </ClayCard>
            </div>
          </div>
        </section>
        <div className="relative z-10 max-w-7xl mx-auto px-6 mt-8 mb-6">
          <p className="text-sm text-wander-textMuted font-medium">
            {loading ? (
              <span className="inline-block w-32 h-4 rounded bg-wander-secondary/20 animate-pulse" />
            ) : (
              <>
                Showing <span className="text-wander-textMain font-bold">{filteredEvents.length}</span>
                {totalCount > 0 && <> of <span className="text-wander-textMain font-bold">{totalCount}</span></>}
                {' '}event{filteredEvents.length !== 1 ? 's' : ''}
                {hasActiveFilters && <span className="text-wander-primary"> (filtered)</span>}
              </>
            )}
          </p>
        </div>
        <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : error ? (
              <div className="col-span-full flex flex-col items-center justify-center py-32 text-center">
                <ClayCard className="!p-12 flex flex-col items-center max-w-md">
                  <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-8 shadow-clay-badge border border-red-500/20">
                    <svg className="w-12 h-12 text-red-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold font-syne text-wander-textMain mb-3">Failed to load events</h3>
                  <p className="text-wander-textMuted leading-relaxed mb-6">{error}</p>
                  <button
                    onClick={loadData}
                    className="px-6 py-2.5 rounded-clay bg-wander-primary text-wander-textMain font-syne font-bold text-sm shadow-clay-btn active:shadow-clay-btn-pressed active:translate-y-0.5 transition-all">
                    Try Again
                  </button>
                </ClayCard>
              </div>
            ) : filteredEvents.length === 0 ? (
              <EmptyState />
            ) : (
              filteredEvents.map((event, idx) => (
                <EventCard key={event.link || idx} event={event} />
              ))
            )}
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default Events;