const Footer = () => {
  return (
    <footer className="relative z-10 py-16 border-t border-wander-secondary/20 mt-16 bg-black/20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <h4 className="font-syne font-black text-2xl text-wander-textMain mb-4 flex items-center gap-3">
            <img src="/assets/logo.png" alt="Wanderlust" className="w-8 h-8 mix-blend-screen" />
            WanderLust
          </h4>
          <p className="text-wander-textMuted text-sm leading-relaxed max-w-xs">
            The ultimate discovery engine for tech events across India. Scraped, scored, and curated just for you.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-start">
          <h5 className="font-syne font-bold text-lg text-wander-textMain mb-4">Supported Sources</h5>
          <ul className="text-sm text-wander-textMuted space-y-3">
            <li className="hover:text-wander-primary transition-colors cursor-pointer flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-wander-primary"></span>Major League Hacking</li>
            <li className="hover:text-wander-primary transition-colors cursor-pointer flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-wander-accent"></span>Devfolio</li>
            <li className="hover:text-wander-primary transition-colors cursor-pointer flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#673AB7]"></span>Luma</li>
            <li className="hover:text-wander-primary transition-colors cursor-pointer flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Google Search</li>
          </ul>
        </div>
        <div className="flex flex-col items-center md:items-start">
          <h5 className="font-syne font-bold text-lg text-wander-textMain mb-4">Developer</h5>
          <p className="text-sm text-wander-textMuted mb-2">Designed and built by</p>
          <p className="font-bold text-lg text-wander-primary tracking-wide">Nitesh Kalyanshetti</p>
        </div>
      </div>
      <div className="text-center text-wander-textMuted text-sm mt-16 pt-8 border-t border-wander-secondary/10 opacity-60">
        <p>© 2026 Wanderlust. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;