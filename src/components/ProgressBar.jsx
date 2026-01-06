import React from 'react';

const ProgressBar = ({ currentIndex, total }) => {
  const percentage = ((currentIndex + 1) / total) * 100;
  
  return (
    <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
      <div 
        className="h-full bg-cyan-500 transition-all duration-500" 
        style={{ width: `${percentage}%` }} 
      />
    </div>
  );
};

export default ProgressBar;
