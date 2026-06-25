import { Link } from 'react-router-dom';
import ClayButton from './ui/ClayButton';
import { useRunContext } from '../RunContext';

const Header = () => {
  const { running, runPipeline } = useRunContext() || {};

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
      <header className="w-full max-w-5xl bg-wander-card rounded-clay-full shadow-clay-card border border-wander-secondary/20 flex justify-between items-center px-8 py-3 pointer-events-auto">
        <Link to="/" className="flex items-center">
          <img src="/assets/logo.png" alt="Wanderlust" className="w-14 h-14 mr-1 object-contain mix-blend-screen scale-[1.15]" />
          <span className="font-syne font-black text-2xl tracking-wide text-wander-textMain">
            WanderLust
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 font-semibold text-wander-textMuted">
          <Link to="/" className="hover:text-wander-textMain transition-colors">Home</Link>
          <Link to="/events" className="hover:text-wander-textMain transition-colors">Events</Link>
          <Link to="/stats" className="hover:text-wander-textMain transition-colors">Statistics</Link>
          <Link to="/config" className="hover:text-wander-textMain transition-colors">Configuration</Link>
        </div>
        <ClayButton
          onClick={runPipeline}
          disabled={running}
          variant="primary"
          className="!py-2 !px-6 text-sm rounded-clay-full">
          {running ? 'Scraping...' : 'Run Now'}
        </ClayButton>
      </header>
    </div>
  );
};

export default Header;