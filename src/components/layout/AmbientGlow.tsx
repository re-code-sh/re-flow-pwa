import React from 'react';

export const AmbientGlow: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top right cool/slate blob */}
      <div className="absolute -top-[15%] -end-[15%] w-[450px] h-[450px] md:w-[600px] md:h-[600px] rounded-full bg-[#788CBE]/[0.08] blur-[120px]" />
      
      {/* Bottom left warm accent blob */}
      <div className="absolute -bottom-[20%] -start-[15%] w-[500px] h-[500px] md:w-[650px] md:h-[650px] rounded-full bg-[var(--accent)]/[0.06] blur-[130px]" />
    </div>
  );
};
