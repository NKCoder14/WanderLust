const ClayBadge = ({ children, colorClass = 'bg-wander-secondary', className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center px-4 py-1.5 
        rounded-clay-full text-xs font-syne font-bold tracking-wider uppercase
        text-wander-textMain shadow-clay-badge 
        ${colorClass} ${className}`}>
      {children}
    </span>
  );
};

export default ClayBadge;