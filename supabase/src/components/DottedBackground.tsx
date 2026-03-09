import React from "react";

interface DottedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const DottedBackground = ({ children, className = "" }: DottedBackgroundProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Colorful Dots Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 dots-pattern" />
        
        {/* Floating colorful circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-green-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2.5s' }} />
        
        {/* Small scattered dots */}
        <div className="absolute top-32 left-1/4 w-2 h-2 bg-purple-400/40 rounded-full" />
        <div className="absolute top-48 right-1/3 w-2 h-2 bg-pink-400/40 rounded-full" />
        <div className="absolute top-64 left-1/5 w-2 h-2 bg-orange-400/40 rounded-full" />
        <div className="absolute top-80 right-1/4 w-2 h-2 bg-cyan-400/40 rounded-full" />
        <div className="absolute top-96 left-1/3 w-2 h-2 bg-green-400/40 rounded-full" />
        
        <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-purple-400/40 rounded-full" />
        <div className="absolute bottom-48 right-1/5 w-2 h-2 bg-pink-400/40 rounded-full" />
        <div className="absolute bottom-64 left-1/4 w-2 h-2 bg-orange-400/40 rounded-full" />
        <div className="absolute bottom-80 right-1/3 w-2 h-2 bg-cyan-400/40 rounded-full" />
        
        <div className="absolute top-1/4 left-20 w-3 h-3 bg-purple-300/30 rounded-full" />
        <div className="absolute top-2/3 right-20 w-3 h-3 bg-pink-300/30 rounded-full" />
        <div className="absolute bottom-1/4 left-32 w-3 h-3 bg-orange-300/30 rounded-full" />
      </div>
      
      {children}
    </div>
  );
};

export default DottedBackground;
