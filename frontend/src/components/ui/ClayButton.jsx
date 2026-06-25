const ClayButton = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const bgColors = {
    primary: 'bg-wander-primary',
    secondary: 'bg-wander-secondary',
    accent: 'bg-wander-accent',
    base: 'bg-wander-base',
  };

  const bgColor = bgColors[variant] || bgColors.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${bgColor} 
        text-wander-textMain font-syne font-bold tracking-wide
        py-3 px-8 rounded-clay 
        shadow-clay-btn 
        active:shadow-clay-btn-pressed active:translate-y-0.5
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}>
      {children}
    </button>
  );
};

export default ClayButton;