const ClayCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-wander-card rounded-clay shadow-clay-card p-6 ${className}`}>
      {children}
    </div>
  );
};

export default ClayCard;