import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchEvents, fetchStats, triggerPipelineRun } from '../services/api';
import ClayCard from '../components/ui/ClayCard';
import ClayButton from '../components/ui/ClayButton';
import EventCard from '../components/EventCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsData] = await Promise.all([fetchEvents(), fetchStats()]);
      if (eventsData.events && eventsData.events.length > 0) {
        setEvents(eventsData.events.slice(0, 3));
      } else {
        setEvents([
          { title: "ETHGlobal India", source: "devfolio", location: "Bengaluru", date: "Aug 15", relevance_score: 9, why_relevant: "Massive Web3 hackathon matching your interests." },
          { title: "Google Cloud Next Extended", source: "luma", location: "Mumbai", date: "Sep 2", relevance_score: 8, why_relevant: "Major cloud architecture summit." },
          { title: "MLH HackIndia", source: "mlh", location: "Online", date: "Oct 10", relevance_score: 7, why_relevant: "Student-focused global hackathon." }
        ]);
      }
    } catch (err) {
      console.error(err);
      setEvents([
        { title: "ETHGlobal India", source: "devfolio", location: "Bengaluru", date: "Aug 15", relevance_score: 9, why_relevant: "Massive Web3 hackathon matching your interests." },
        { title: "Google Cloud Next Extended", source: "luma", location: "Mumbai", date: "Sep 2", relevance_score: 8, why_relevant: "Major cloud architecture summit." },
        { title: "MLH HackIndia", source: "mlh", location: "Online", date: "Oct 10", relevance_score: 7, why_relevant: "Student-focused global hackathon." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRunPipeline = async () => {
    setRunning(true);
    try {
      await triggerPipelineRun();
      await loadData();
    } catch (err) {
      alert('Pipeline run failed. Check backend logs.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-aurora text-wander-textMuted font-outfit selection:bg-wander-primary selection:text-wander-base overflow-x-hidden">
      <Header handleRunPipeline={handleRunPipeline} running={running} />
      <section className="relative w-full min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[#0a4a5e] rounded-full blur-[140px] opacity-[0.03] pointer-events-none z-0"></div>
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-[#1a3a6e] rounded-full blur-[150px] opacity-[0.05] pointer-events-none z-0"></div>
        <div className="absolute bottom-[10%] left-[30%] w-[550px] h-[550px] bg-[#1a1040] rounded-full blur-[140px] opacity-[0.05] pointer-events-none z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-10">
          <div className="relative flex justify-center items-center pointer-events-none pt-16">
            <img
              src="/assets/clay_hero_map.png"
              alt="Wanderlust Explorer Map"
              className="w-[22rem] h-[22rem] md:w-[28rem] md:h-[28rem] object-cover scale-125 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_70%)] opacity-95" />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-2xl md:text-3xl opacity-90 max-w-3xl mb-12 font-medium leading-relaxed">
              The ultimate discovery engine for tech events across India. Scraped, scored, and curated just for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link to="/events" className="w-full sm:w-auto">
                <ClayButton variant="primary" className="w-full text-lg !px-10 !py-4">
                  Explore Events
                </ClayButton>
              </Link>
              <a href="#events" className="w-full sm:w-auto">
                <ClayButton variant="base" className="w-full text-lg !px-10 !py-4 border-2 border-wander-primary !text-wander-primary hover:!text-wander-textMain">
                  View This Week
                </ClayButton>
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black font-syne text-wander-textMain mb-4">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <ClayCard className="text-center flex flex-col items-center group !p-6 overflow-hidden relative">
            <div className="w-full h-56 relative pointer-events-none flex justify-center items-center mb-4">
              <img src="/assets/clay_scrape.png" alt="We Scrape 3D" className="w-[140%] h-[140%] max-w-none object-cover [mask-image:radial-gradient(circle_at_center,black_35%,transparent_65%)] transition-transform duration-700 group-hover:scale-[1.1]" />
            </div>
            <div className="flex flex-col items-center relative z-20">
              <h3 className="text-2xl font-bold font-syne mb-3 text-wander-textMain">1. We Scrape</h3>
              <p className="opacity-80 leading-relaxed">Continuously fetching data from the top hackathon and event platforms in India.</p>
            </div>
          </ClayCard>
          <ClayCard className="text-center flex flex-col items-center group !p-6 overflow-hidden relative">
            <div className="w-full h-56 relative pointer-events-none flex justify-center items-center mb-4">
              <img src="/assets/clay_ai.png" alt="AI Scores It 3D" className="w-[140%] h-[140%] max-w-none object-cover [mask-image:radial-gradient(circle_at_center,black_35%,transparent_65%)] transition-transform duration-700 group-hover:scale-[1.1]" />
            </div>
            <div className="flex flex-col items-center relative z-20">
              <h3 className="text-2xl font-bold font-syne mb-3 text-wander-textMain">2. AI Scores It</h3>
              <p className="opacity-80 leading-relaxed">AI evaluates each event against your custom profile to filter out the noise.</p>
            </div>
          </ClayCard>
          <ClayCard className="text-center flex flex-col items-center group !p-6 overflow-hidden relative">
            <div className="w-full h-56 relative pointer-events-none flex justify-center items-center mb-4">
              <img src="/assets/clay_explore.png" alt="You Explore 3D" className="w-[140%] h-[140%] max-w-none object-cover [mask-image:radial-gradient(circle_at_center,black_35%,transparent_65%)] transition-transform duration-700 group-hover:scale-[1.1]" />
            </div>
            <div className="flex flex-col items-center relative z-20">
              <h3 className="text-2xl font-bold font-syne mb-3 text-wander-textMain">3. You Explore</h3>
              <p className="opacity-80 leading-relaxed">Discover high-quality, highly relevant events ready for you to conquer.</p>
            </div>
          </ClayCard>
        </div>
      </section>
      <section id="events" className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black font-syne text-wander-textMain mb-4">Sample Events</h2>
          <p className="opacity-70 text-lg">A sneak peek at what's on the radar.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {events.map((event, idx) => (
            <EventCard key={idx} event={event} />
          ))}
        </div>
        <div className="text-center mt-16">
          <Link to="/events">
            <ClayButton variant="primary" className="!px-12 !py-4 text-lg">
              View All Events
            </ClayButton>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Dashboard;