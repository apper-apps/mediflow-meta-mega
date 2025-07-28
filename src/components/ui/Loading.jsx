import React from "react";

const Loading = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-200 h-24 rounded-lg"></div>
        <div className="bg-gray-200 h-24 rounded-lg"></div>
        <div className="bg-gray-200 h-24 rounded-lg"></div>
      </div>
      
      <div className="bg-gray-200 h-8 rounded w-1/4 mb-4"></div>
      
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
};

export default Loading;