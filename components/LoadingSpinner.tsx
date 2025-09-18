
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#FF3366]"></div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Generating brilliant ideas...</p>
    </div>
  );
};

export default LoadingSpinner;