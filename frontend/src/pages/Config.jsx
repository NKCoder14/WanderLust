import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchConfig, updateConfig } from '../services/api';
import Header from '../components/Header';
import ClayCard from '../components/ui/ClayCard';
import ClayButton from '../components/ui/ClayButton';

const EVENT_TYPES = ["Hackathon", "Conference", "Meetup", "Workshop", "Summit"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const SkeletonConfig = () => (
  <div className="space-y-8 animate-pulse">
    <ClayCard className="!p-8 h-80 bg-wander-base/40 border-none" />
    <ClayCard className="!p-8 h-48 bg-wander-base/40 border-none" />
    <ClayCard className="!p-8 h-48 bg-wander-base/40 border-none" />
  </div>
);

const ChipInput = ({ label, items, onChange, placeholder }) => {
  const [val, setVal] = useState('');

  const handleAdd = () => {
    const trimmed = val.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setVal('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (item) => {
    onChange(items.filter(i => i !== item));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-syne font-bold tracking-wide text-wander-textMain">{label}</label>
      <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
        {items.length === 0 && <span className="text-wander-textMuted/50 text-sm italic py-1">No items added</span>}
        {items.map(item => (
          <div key={item} className="flex items-center gap-1.5 px-3 py-1.5 rounded-clay-full bg-wander-base/60 border border-wander-secondary/30 shadow-sm group">
            <span className="text-wander-textMain text-sm font-medium">{item}</span>
            <button onClick={() => handleRemove(item)} className="text-wander-textMuted group-hover:text-red-400 transition-colors ml-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-wander-base/50 border border-wander-secondary/20 rounded-clay px-4 py-2 text-wander-textMain placeholder:text-wander-textMuted/50 outline-none focus:border-wander-primary/50 transition-colors shadow-inner text-sm" />
        <button
          onClick={handleAdd}
          disabled={!val.trim()}
          className="px-5 py-2 bg-wander-secondary text-wander-textMain font-syne font-bold text-sm rounded-clay shadow-clay-btn disabled:opacity-50 transition-all hover:bg-wander-secondary/80">
          Add
        </button>
      </div>
    </div>
  );
};

const Config = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [originalConfig, setOriginalConfig] = useState(null);
  const [config, setConfig] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchConfig();
      setOriginalConfig(res);
      setConfig(res);
    } catch (err) {
      console.error(err);
      setError("Backend is unreachable. Showing mock config for preview.");
      const mock = {
        USER_PROFILE: {
          interests: ["React", "AI", "Web3"],
          cities: ["Bengaluru", "Mumbai"],
          type: "Hackathon, Conference",
          level: "Intermediate"
        },
        CITIES: ["Bengaluru", "Mumbai", "Pune"],
        SEARCH_QUERIES: ["AI hackathons", "React conferences"]
      };
      setOriginalConfig(mock);
      setConfig(mock);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const isDirty = useMemo(() => {
    if (!originalConfig || !config) return false;
    return JSON.stringify(originalConfig) !== JSON.stringify(config);
  }, [originalConfig, config]);

  const handleSave = async () => {
    if (!isDirty) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateConfig(config);
      setSaveSuccess(true);
      setOriginalConfig(config);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      if (error) {
        setSaveSuccess(true);
        setOriginalConfig(config);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else if (err.status === 401) {
        setSaveError("Not authorized.");
      } else {
        setSaveError("Failed to save changes. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setConfig(originalConfig);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const selectedTypes = useMemo(() => {
    if (!config?.USER_PROFILE?.type) return [];
    return config.USER_PROFILE.type.split(',').map(s => s.trim()).filter(Boolean);
  }, [config?.USER_PROFILE?.type]);

  const toggleType = (t) => {
    const newTypes = selectedTypes.includes(t)
      ? selectedTypes.filter(x => x !== t)
      : [...selectedTypes, t];
    setConfig({
      ...config,
      USER_PROFILE: { ...config.USER_PROFILE, type: newTypes.join(', ') }
    });
  };

  const updateProfile = (key, value) => {
    setConfig({
      ...config,
      USER_PROFILE: { ...config.USER_PROFILE, [key]: value }
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-aurora text-wander-textMuted font-outfit selection:bg-wander-primary selection:text-wander-base overflow-x-hidden pb-32">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[#0a4a5e] rounded-full blur-[140px] opacity-[0.03]" />
          <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-[#1a3a6e] rounded-full blur-[150px] opacity-[0.05]" />
          <div className="absolute bottom-[10%] left-[30%] w-[550px] h-[550px] bg-[#1a1040] rounded-full blur-[140px] opacity-[0.05]" />
        </div>
        <section className="relative z-10 pt-36 pb-8 max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-black font-syne text-wander-textMain mb-3 tracking-tight">
            Config
          </h1>
          <p className="text-lg opacity-70 max-w-xl leading-relaxed">
            Tune what Wanderlust looks for.
          </p>
        </section>
        <section className="relative z-10 max-w-4xl mx-auto px-6">
          {loading ? (
            <SkeletonConfig />
          ) : (
            <div className="space-y-8">
              {error && (
                <div className="bg-wander-card/80 border border-wander-primary/50 text-wander-textMain px-6 py-4 rounded-clay shadow-clay-badge flex items-center gap-4">
                  <svg className="w-6 h-6 text-wander-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-syne font-bold">{error}</p>
                  </div>
                </div>
              )}
              <ClayCard className="!p-8">
                <h3 className="text-2xl font-bold font-syne text-wander-textMain mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6 text-wander-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  User Profile
                </h3>
                <div className="space-y-8">
                  <ChipInput
                    label="Interests"
                    items={config.USER_PROFILE.interests}
                    onChange={(newItems) => updateProfile('interests', newItems)}
                    placeholder="e.g. React, AI, Web3..." />
                  <div>
                    <label className="block text-sm font-syne font-bold tracking-wide text-wander-textMain mb-3">Experience Level</label>
                    <div className="flex bg-wander-base/50 p-1.5 rounded-clay-full border border-wander-secondary/20 shadow-inner w-full sm:w-max">
                      {LEVELS.map(lvl => {
                        const isActive = config.USER_PROFILE.level === lvl;
                        return (
                          <button
                            key={lvl}
                            onClick={() => updateProfile('level', lvl)}
                            className={`px-6 py-2 rounded-clay-full text-sm font-syne font-bold transition-all ${isActive
                              ? 'bg-wander-card text-wander-textMain shadow-clay-badge border border-wander-secondary/20 scale-100'
                              : 'text-wander-textMuted hover:text-wander-textMain scale-95 opacity-70 hover:opacity-100'}`}>
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-syne font-bold tracking-wide text-wander-textMain mb-3">Preferred Event Types</label>
                    <div className="flex flex-wrap gap-2">
                      {EVENT_TYPES.map(type => {
                        const isSelected = selectedTypes.includes(type);
                        return (
                          <button
                            key={type}
                            onClick={() => toggleType(type)}
                            className={`px-4 py-2 rounded-clay-full text-sm font-syne font-bold transition-all border ${isSelected
                              ? 'bg-wander-primary text-wander-base border-wander-primary shadow-clay-badge'
                              : 'bg-wander-base/50 text-wander-textMuted border-wander-secondary/30 hover:border-wander-primary/50'}`}>
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ClayCard>
              <ClayCard className="!p-8">
                <h3 className="text-2xl font-bold font-syne text-wander-textMain mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6 text-wander-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Target Cities
                </h3>
                <ChipInput
                  label="Cities"
                  items={config.CITIES}
                  onChange={(newCities) => {
                    setConfig({
                      ...config,
                      CITIES: newCities,
                      USER_PROFILE: { ...config.USER_PROFILE, cities: newCities }
                    });
                  }}
                  placeholder="e.g. Bengaluru, Remote..." />
              </ClayCard>
              <ClayCard className="!p-8">
                <h3 className="text-2xl font-bold font-syne text-wander-textMain mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6 text-[#673AB7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Queries
                </h3>
                <p className="text-sm text-wander-textMuted mb-4">Specific queries used when scraping from generic search engines like SerpAPI.</p>
                <ChipInput
                  label="Queries"
                  items={config.SEARCH_QUERIES}
                  onChange={(newQueries) => setConfig({ ...config, SEARCH_QUERIES: newQueries })}
                  placeholder="e.g. hackathons in India 2024..." />
              </ClayCard>
            </div>
          )}
        </section>
        {!loading && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center pointer-events-none">
            <div className={`w-full max-w-4xl bg-wander-card/95 backdrop-blur-xl border border-wander-secondary/20 shadow-clay-card rounded-clay-lg p-4 flex items-center justify-between transition-transform duration-500 pointer-events-auto ${isDirty ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
              <div className="flex items-center gap-4">
                {saveSuccess ? (
                  <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-clay-full text-sm font-syne font-bold border border-green-400/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Changes saved!
                  </div>
                ) : saveError ? (
                  <div className="text-red-400 text-sm font-syne font-bold px-2">{saveError}</div>
                ) : (
                  <span className="text-wander-textMain font-syne font-bold text-sm hidden sm:inline-block px-2">You have unsaved changes</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDiscard}
                  disabled={saving || saveSuccess}
                  className="px-5 py-2.5 text-wander-textMuted hover:text-wander-textMain font-syne font-bold text-sm transition-colors rounded-clay disabled:opacity-50">
                  Discard
                </button>
                <ClayButton
                  onClick={handleSave}
                  disabled={saving || saveSuccess}
                  variant="primary"
                  className="!py-2.5 !px-8 text-sm rounded-clay shadow-clay-btn">
                  {saving ? 'Saving...' : 'Save Changes'}
                </ClayButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Config;