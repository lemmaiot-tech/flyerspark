import React from 'react';
import { SparklesIcon, PencilSquareIcon } from './IconComponents';
import { ToolMode } from '../types';

interface WelcomeProps {
  toolMode: ToolMode;
}

const Welcome: React.FC<WelcomeProps> = ({ toolMode }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
      {toolMode === 'ideaGenerator' ? (
        <>
            <SparklesIcon className="w-16 h-16 text-[#FF3366] mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Ready to Create?</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md">
                Fill in the details about your flyer on the left, and let our AI generate a unique set of design ideas to get you started!
            </p>
        </>
      ) : (
        <>
            <PencilSquareIcon className="w-16 h-16 text-[#FF3366] mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Structure Your Content</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md">
                Paste your existing content on the left, choose an output format, and let AI organize it into headlines, body text, and calls-to-action.
            </p>
        </>
      )}
    </div>
  );
};

export default Welcome;
