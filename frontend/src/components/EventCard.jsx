import ClayCard from './ui/ClayCard';
import ClayBadge from './ui/ClayBadge';
import ClayButton from './ui/ClayButton';

const EventCard = ({ event }) => {
  let sourceColor = 'bg-wander-secondary';
  if (event.source === 'mlh') sourceColor = 'bg-wander-primary';
  if (event.source === 'devfolio') sourceColor = 'bg-wander-accent';
  if (event.source === 'luma') sourceColor = 'bg-[#673AB7]';

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-wander-accent';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGradientBlob = (score) => {
    if (score >= 8) return 'bg-wander-accent/50';
    if (score >= 5) return 'bg-wander-primary/50';
    return 'bg-wander-secondary/50';
  };

  return (
    <ClayCard className="flex flex-col h-full relative overflow-hidden group !p-0 border-none">
      <div className="w-full h-40 relative overflow-hidden bg-[#0A121E]">
        <div className={`absolute top-[-30%] left-[-10%] w-48 h-48 rounded-full ${getGradientBlob(event.relevance_score)} blur-[40px] mix-blend-screen transition-transform duration-1000 group-hover:scale-[1.3] group-hover:rotate-12`}></div>
        <div className="absolute bottom-[-30%] right-[-10%] w-40 h-40 rounded-full bg-wander-primary/40 blur-[40px] mix-blend-screen transition-transform duration-1000 group-hover:scale-[1.3] group-hover:-rotate-12"></div>
        <div className="absolute top-5 left-6 z-20 flex flex-wrap gap-2">
          <ClayBadge colorClass={sourceColor} className="uppercase text-[0.65rem] tracking-wider shadow-lg">{event.source}</ClayBadge>
          {event.type && <ClayBadge colorClass="bg-black/30 backdrop-blur-md border border-white/10 text-white/90 shadow-lg">{event.type}</ClayBadge>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1E3A5F] to-transparent z-10 pointer-events-none"></div>
      </div>
      <div className="absolute right-6 top-32 z-30 w-16 h-16 rounded-full bg-wander-base/80 backdrop-blur-xl shadow-[inset_0px_2px_10px_rgba(255,255,255,0.15),0_10px_20px_rgba(0,0,0,0.6)] border border-wander-primary/30 flex flex-col items-center justify-center transform group-hover:-translate-y-2 transition-transform duration-500">
        <span className={`text-2xl font-black font-syne ${getScoreColor(event.relevance_score)} leading-none drop-shadow-[0_0_8px_currentColor]`}>{event.relevance_score}</span>
      </div>
      <div className="px-6 pb-6 pt-2 flex flex-col flex-grow relative z-20">
        <h3 className="font-bold text-2xl leading-tight line-clamp-2 text-wander-textMain font-syne mb-3 pr-16" title={event.title}>
          {event.title}
        </h3>
        {event.is_free_or_student && (
          <div className="mb-4">
            <span className="text-[0.7rem] font-black uppercase tracking-widest text-wander-accent bg-wander-accent/10 px-2.5 py-1.5 rounded border border-wander-accent/30 drop-shadow-sm">Free / Student</span>
          </div>
        )}
        <div className="text-sm space-y-3 mt-1 mb-6 z-10 text-wander-textMuted font-medium">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-wander-primary/70 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span className="leading-relaxed">{event.location}</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-wander-primary/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span className="">{event.date}</span>
          </div>
        </div>
        <div className="mt-auto bg-wander-base/40 p-4 rounded-xl border border-white/5 relative overflow-hidden group-hover:border-wander-primary/30 group-hover:bg-wander-base/60 transition-colors duration-500 shadow-inner">
          <svg className="absolute top-2 left-2 w-8 h-8 text-wander-textMuted opacity-10" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
          <p className="text-sm italic opacity-90 text-wander-textMain/80 leading-relaxed pl-6 relative z-10">
            {event.why_relevant}
          </p>
        </div>
        <div className="mt-6">
          <a href={event.link} target="_blank" rel="noopener noreferrer" className="block w-full outline-none">
            <ClayButton className="w-full text-sm !py-3 tracking-wide group-hover:brightness-110 transition-all">View Event Details</ClayButton>
          </a>
        </div>
      </div>
    </ClayCard>
  );
};

export default EventCard;