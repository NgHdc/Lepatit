import React from 'react';

export default function Overlay() {
  return (
    <div className="absolute bottom-8 left-8 pointer-events-none select-none z-10 text-white/70 font-mono">
      <h1 className="text-2xl font-bold tracking-widest mb-2 glitch text-red-500">
        SYSTEM FAILURE
      </h1>
      <div className="text-sm border-l-2 border-red-500 pl-2">
        <p>LOCATION: LUNA SERVER [AGNES]</p>
        <p>STATUS: COOLANT LEAK DETECTED</p>
        <p>TARGET: EARTH [CONNECTION LOST]</p>
      </div>
    </div>
  );
}