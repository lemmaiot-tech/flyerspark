
import React, { useState } from 'react';
import { DesignIdea, Color, DesignMode } from '../types';
import { SparklesIcon, PaintBrushIcon, EyeIcon, ChatBubbleBottomCenterTextIcon, MegaphoneIcon, DocumentTextIcon, RefreshIcon, SaveIcon, ClipboardIcon, CheckIcon, FilmIcon, PhotoIcon } from './IconComponents';
import ModeSpecificContentDisplay from './ModeSpecificContentDisplay';
import { generatePlaceholderImage } from '../services/geminiService';

interface ResultsDisplayProps {
  idea: DesignIdea;
  onRegenerate: () => void;
  isRegenerating: boolean;
  mode: DesignMode;
}

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string; }> = ({ title, icon, children, className }) => (
    <div className={`bg-gradient-to-br from-blue-50 to-transparent dark:from-[#0808F5]/15 dark:to-transparent p-4 rounded-xl border border-blue-200 dark:border-[#FF3366]/30 shadow-lg dark:shadow-black/25 backdrop-blur-sm ${className || ''}`}>
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-[#0808F5] dark:text-[#FF3366] mb-3">
            {icon}
            {title}
        </h3>
        <div className="text-gray-700 dark:text-gray-200 space-y-2 text-sm sm:text-base">{children}</div>
    </div>
);

const ColorSwatch: React.FC<{ color: Color }> = ({ color }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-white/20" style={{ backgroundColor: color.hex }}></div>
    <div>
      <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">{color.name}</p>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase">{color.hex}</p>
    </div>
  </div>
);

const InlineSpinner = () => (
    <div className="flex items-center justify-center py-4">
      <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-gray-600 dark:border-white"></div>
    </div>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ idea, onRegenerate, isRegenerating, mode }) => {
  const [copiedCtaIndex, setCopiedCtaIndex] = useState<number | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [generatingImageFor, setGeneratingImageFor] = useState<string | null>(null);

  const handleGenerateImage = async (suggestion: string) => {
    setGeneratingImageFor(suggestion);
    try {
      const base64Image = await generatePlaceholderImage(suggestion);
      setGeneratedImages(prev => ({
        ...prev,
        [suggestion]: `data:image/jpeg;base64,${base64Image}`
      }));
    } catch (error) {
      console.error("Image generation failed:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred while generating the image.");
    } finally {
      setGeneratingImageFor(null);
    }
  };
  
  const handleSave = () => {
    try {
        const dataToSave = { ...idea, generatedImages };
        const dataStr = JSON.stringify(dataToSave, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'flyer-spark-ideas.json');
        document.body.appendChild(linkElement); // Required for Firefox
        linkElement.click();
        document.body.removeChild(linkElement);
    } catch (error) {
        console.error("Failed to save ideas:", error);
        alert("Could not save the file. Please try again.");
    }
  };

  const handleCopyCta = (ctaText: string, index: number) => {
    navigator.clipboard.writeText(ctaText).then(() => {
        setCopiedCtaIndex(index);
        setTimeout(() => {
            setCopiedCtaIndex(null);
        }, 2000); // Reset after 2 seconds
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text.');
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
                    <SparklesIcon />
                    Design Concept
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{idea.concept}</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={onRegenerate} 
                  disabled={isRegenerating || !!generatingImageFor}
                  className="flex-grow flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 dark:text-white bg-gray-200/80 dark:bg-white/10 px-4 py-2.5 rounded-lg hover:bg-gray-300/80 dark:hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Regenerate content and visual ideas"
                >
                  <RefreshIcon className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
                 <button 
                  onClick={handleSave}
                  className="flex-grow flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#FF3366] px-4 py-2.5 rounded-lg hover:bg-opacity-90 transition-all duration-200"
                  aria-label="Save generated ideas"
                >
                  <SaveIcon className="w-5 h-5" />
                  <span>Save Ideas</span>
                </button>
            </div>
        </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResultCard title="Title / Headline Ideas" icon={<MegaphoneIcon />}>
          <ul className="list-disc list-inside space-y-1">
            {(idea.titleSuggestions || []).map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </ResultCard>

        <ResultCard title="Call to Actions" icon={<ChatBubbleBottomCenterTextIcon />}>
          <ul className="space-y-2">
            {(idea.ctas || []).map((c, i) => (
                <li key={i} className="flex items-center justify-between gap-2 bg-gray-100 dark:bg-black/10 p-2 rounded-md">
                    <span className="flex-grow text-gray-800 dark:text-gray-200">{c}</span>
                    <button
                        onClick={() => handleCopyCta(c, i)}
                        className="flex-shrink-0 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-500 dark:text-gray-300"
                        aria-label={`Copy call to action: ${c}`}
                    >
                        {copiedCtaIndex === i ? (
                            <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
                        ) : (
                            <ClipboardIcon className="w-5 h-5" />
                        )}
                    </button>
                </li>
            ))}
          </ul>
        </ResultCard>

        <ResultCard title="Suggested Content" icon={<DocumentTextIcon />} className="md:col-span-2">
            {isRegenerating ? (
                <InlineSpinner />
            ) : (
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{idea.suggestedContent}</p>
            )}
        </ResultCard>

        <ResultCard title="Visual Elements" icon={<EyeIcon />}>
          {isRegenerating ? (
            <InlineSpinner />
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-500 dark:text-gray-100 text-sm uppercase tracking-wider">Icon Style</h4>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{idea.visuals?.iconStyle}</p>
              </div>
              <div className="border-t border-gray-200 dark:border-white/10"></div>
              <div>
                <h4 className="font-semibold text-gray-500 dark:text-gray-100 text-sm uppercase tracking-wider">Background</h4>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{idea.visuals?.background}</p>
              </div>
              <div className="border-t border-gray-200 dark:border-white/10"></div>
              <div>
                <h4 className="font-semibold text-gray-500 dark:text-gray-100 text-sm uppercase tracking-wider mb-2">Image Suggestions</h4>
                 <div className="space-y-3">
                    {(idea.visuals?.imageSuggestions || []).map((suggestion, i) => (
                    <div key={i} className="bg-gray-100/50 dark:bg-black/20 p-3 rounded-lg transition-all duration-300">
                        <div className="flex items-center justify-between gap-3">
                        <p className="text-sm flex-1">{suggestion}</p>
                        {!generatedImages[suggestion] && (
                            <button
                            onClick={() => handleGenerateImage(suggestion)}
                            disabled={!!generatingImageFor}
                            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md text-[#0808F5] dark:text-white bg-blue-100 dark:bg-white/10 hover:bg-blue-200 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-wait transition-colors"
                            aria-label={`Generate image for: ${suggestion}`}
                            >
                            {generatingImageFor === suggestion ? (
                                <svg className="animate-spin -ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <PhotoIcon className="w-4 h-4" />
                            )}
                            <span>{generatingImageFor === suggestion ? 'Generating...' : 'Generate'}</span>
                            </button>
                        )}
                        </div>
                        {generatingImageFor === suggestion && !generatedImages[suggestion] && (
                            <div className="mt-3 aspect-video bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center animate-pulse">
                                <PhotoIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                            </div>
                        )}
                        {generatedImages[suggestion] && (
                        <div className="mt-3 aspect-video bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden animate-fade-in">
                            <img 
                            src={generatedImages[suggestion]} 
                            alt={`Generated image for: ${suggestion}`} 
                            className="w-full h-full object-cover" 
                            />
                        </div>
                        )}
                    </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </ResultCard>

        <ResultCard title="Creative Content Suggestion" icon={<FilmIcon />}>
            <ModeSpecificContentDisplay content={idea.modeSpecificContent} mode={mode} />
        </ResultCard>

        <div className="md:col-span-2">
            <ResultCard title="Color Palette" icon={<PaintBrushIcon />}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {(idea.colorPalette || []).map((c) => <ColorSwatch key={c.hex} color={c} />)}
                </div>
            </ResultCard>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
