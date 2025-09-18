
import React, { useState, useCallback, useEffect } from 'react';
import { AiResponse, DesignIdea, DesignMode, ToolMode, OutputFormat, StructuredContent, HistoryItem, HistoryPrompt, HistoryResult } from './types';
import { generateFlyerIdeas, regenerateContentAndVisuals, structureContent } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import Welcome from './components/Welcome';
import { LightbulbIcon, PencilSquareIcon } from './components/IconComponents';
import StructuredContentDisplay from './components/StructuredContentDisplay';
import History from './components/History';

type Theme = 'dark' | 'light';
const DAILY_USAGE_LIMIT = 5;
const HISTORY_STORAGE_KEY = 'flyerSparkHistory';
const MAX_HISTORY_ITEMS = 20;

const getInitialTheme = (): Theme => {
  try {
    const storedValue = localStorage.getItem('flyerTheme');
    if (storedValue) {
      const parsedTheme = JSON.parse(storedValue);
      if (parsedTheme === 'light' || parsedTheme === 'dark') {
        return parsedTheme;
      }
    }
  } catch (error) {
    console.error(`Error reading theme from localStorage:`, error);
  }
  return 'dark';
};


function App() {
  const [toolName, setToolName] = useState<string>('FlyerSpark AI');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [draftExists, setDraftExists] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  
  // Daily usage limit state
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isLimitExceeded, setIsLimitExceeded] = useState<boolean>(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);

  // Tool mode state
  const [toolMode, setToolMode] = useState<ToolMode>('ideaGenerator');

  // Idea Generator State
  const [designIdea, setDesignIdea] = useState<DesignIdea | null>(null);
  const [context, setContext] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [mode, setMode] = useState<DesignMode>('Standard Flyer');
  
  // Content Structurer State
  const [structuredContent, setStructuredContent] = useState<StructuredContent | null>(null);
  const [rawContent, setRawContent] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('Flyer / Poster');

  // Shared State
  const [logo, setLogo] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState<string>('#0808F5');

  // History management
  const addToHistory = (prompt: HistoryPrompt, result: HistoryResult) => {
    setHistory(prevHistory => {
        const newHistoryItem: HistoryItem = {
            id: Date.now(),
            date: new Date().toISOString(),
            prompt,
            result
        };
        const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
        } catch(err) {
            console.error("Failed to save history:", err);
        }
        return updatedHistory;
    });
  };
  
  const handleLoadHistoryItem = (item: HistoryItem) => {
    setError(null);
    setToolMode(item.prompt.toolMode);
    setDesignIdea(item.result.designIdea || null);
    setStructuredContent(item.result.structuredContent || null);
    setLogo(item.prompt.logo);
    setBrandColor(item.prompt.brandColor);

    if (item.prompt.toolMode === 'ideaGenerator') {
      setContext(item.prompt.context);
      setCaption(item.prompt.caption);
      setMode(item.prompt.mode);
      setRawContent(''); // Clear other tool's content
    } else {
      setRawContent(item.prompt.rawContent);
      setOutputFormat(item.prompt.outputFormat);
      setContext(''); // Clear other tool's content
      setCaption('');
    }
    setIsHistoryVisible(false);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire generation history? This action cannot be undone.")) {
        setHistory([]);
        try {
            localStorage.removeItem(HISTORY_STORAGE_KEY);
        } catch(err) {
            console.error("Failed to clear history from storage:", err);
        }
    }
  };

  const loadDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem('flyerSparkDraft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        setToolMode(draft.toolMode || 'ideaGenerator');
        setContext(draft.context || '');
        setCaption(draft.caption || '');
        setMode(draft.mode || 'Standard Flyer');
        setRawContent(draft.rawContent || '');
        setOutputFormat(draft.outputFormat || 'Flyer / Poster');
        setLogo(draft.logo || null);
        setBrandColor(draft.brandColor || '#0808F5');
        setDraftExists(true);
      }
    } catch (err) {
      console.error("Failed to load draft:", err);
      // If parsing fails, remove the corrupted draft
      localStorage.removeItem('flyerSparkDraft');
      setDraftExists(false);
    }
  }, []);

  const handleSaveDraft = useCallback(() => {
    const draft = {
      toolMode,
      context,
      caption,
      mode,
      rawContent,
      outputFormat,
      logo,
      brandColor,
    };
    try {
      localStorage.setItem('flyerSparkDraft', JSON.stringify(draft));
      setDraftExists(true);
      setSaveMessage('Draft saved!');
      setTimeout(() => setSaveMessage(''), 2500);
    } catch (err) {
      console.error("Failed to save draft:", err);
      setSaveMessage('Error saving!');
      setTimeout(() => setSaveMessage(''), 2500);
    }
  }, [toolMode, context, caption, mode, rawContent, outputFormat, logo, brandColor]);


  // Effect for theme management
  useEffect(() => {
    const root = window.document.documentElement;
    const oldTheme = theme === 'dark' ? 'light' : 'dark';
    root.classList.remove(oldTheme);
    root.classList.add(theme);
    localStorage.setItem('flyerTheme', JSON.stringify(theme));
  }, [theme]);
  
  // Effect to load draft and history on initial app load
  useEffect(() => {
    loadDraft();
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch(err) {
      console.error("Failed to load history:", err);
    }
  }, [loadDraft]);

  // Effect for daily usage limit
  useEffect(() => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const lastResetDate = localStorage.getItem('flyerSparkLastResetDate');
        
        if (lastResetDate !== today) {
            localStorage.setItem('flyerSparkUsageCount', '0');
            localStorage.setItem('flyerSparkLastResetDate', today);
            setUsageCount(0);
            setIsLimitExceeded(false);
        } else {
            const currentCount = parseInt(localStorage.getItem('flyerSparkUsageCount') || '0', 10);
            setUsageCount(currentCount);
            if (currentCount >= DAILY_USAGE_LIMIT) {
                setIsLimitExceeded(true);
            }
        }
    } catch (err) {
        console.error("Failed to process usage limit:", err);
    }
  }, []);

  const handleToolModeChange = (newMode: ToolMode) => {
    if (toolMode === newMode) return;
    if (newMode === 'ideaGenerator') {
        setStructuredContent(null);
    } else {
        setDesignIdea(null);
    }
    setError(null);
    setToolMode(newMode);
  };

  const handleGenerateIdeas = useCallback(async () => {
    if (usageCount >= DAILY_USAGE_LIMIT) {
        setError(`You have reached the daily usage limit of ${DAILY_USAGE_LIMIT} generations. Please try again tomorrow.`);
        setIsLimitExceeded(true);
        return;
    }

    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('flyerSparkUsageCount', String(newCount));
    if (newCount >= DAILY_USAGE_LIMIT) setIsLimitExceeded(true);

    setIsLoading(true);
    setError(null);
    setDesignIdea(null);
    setStructuredContent(null);
    
    try {
      const result: AiResponse = await generateFlyerIdeas(context, caption, logo, brandColor, mode);
      if (result.toolName) {
        setToolName(result.toolName);
      }
      setDesignIdea(result.designIdea);
      addToHistory(
        { toolMode: 'ideaGenerator', context, caption, mode, logo, brandColor },
        { designIdea: result.designIdea }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [context, caption, logo, brandColor, mode, usageCount]);
  
  const handleStructureContent = useCallback(async () => {
    if (usageCount >= DAILY_USAGE_LIMIT) {
        setError(`You have reached the daily usage limit of ${DAILY_USAGE_LIMIT} generations. Please try again tomorrow.`);
        setIsLimitExceeded(true);
        return;
    }
    
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('flyerSparkUsageCount', String(newCount));
    if (newCount >= DAILY_USAGE_LIMIT) setIsLimitExceeded(true);

    setIsLoading(true);
    setError(null);
    setDesignIdea(null);
    setStructuredContent(null);

    try {
      const result = await structureContent(rawContent, outputFormat);
      setStructuredContent(result);
      addToHistory(
        { toolMode: 'contentStructurer', rawContent, outputFormat, logo, brandColor },
        { structuredContent: result }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [rawContent, outputFormat, logo, brandColor, usageCount]);


  const handleRegenerate = useCallback(async () => {
    if (!context || !designIdea) return;
    
    setIsRegenerating(true);
    setError(null);

    try {
        const { visuals, suggestedContent } = await regenerateContentAndVisuals(context);
        setDesignIdea(prevIdea => {
            if (!prevIdea) return null;
            return { ...prevIdea, visuals, suggestedContent };
        });
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not regenerate ideas.');
        console.error(err);
    } finally {
        setIsRegenerating(false);
    }
  }, [context, designIdea]);

  const hasResults = designIdea || structuredContent;

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-[#0A0A22] text-gray-800 dark:text-white selection:bg-[#FF3366] selection:text-white transition-colors duration-300">
      <Header 
        toolName={toolName} 
        theme={theme} 
        setTheme={setTheme}
        onShowHistory={() => setIsHistoryVisible(true)}
      />
      
      {isHistoryVisible && (
        <History 
          history={history}
          onClose={() => setIsHistoryVisible(false)}
          onLoadItem={handleLoadHistoryItem}
          onClearHistory={handleClearHistory}
        />
      )}

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        
        <div className="flex justify-center mb-8">
          <div className="bg-gray-200 dark:bg-white/5 rounded-full p-1 flex items-center space-x-1 border border-gray-300 dark:border-white/10 shadow-inner">
            <button
              onClick={() => handleToolModeChange('ideaGenerator')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${toolMode === 'ideaGenerator' ? 'bg-[#FF3366] text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-white/10'}`}
              aria-pressed={toolMode === 'ideaGenerator'}
            >
              <LightbulbIcon className="w-5 h-5" />
              <span>Idea Generator</span>
            </button>
            <button
              onClick={() => handleToolModeChange('contentStructurer')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${toolMode === 'contentStructurer' ? 'bg-[#FF3366] text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-white/10'}`}
              aria-pressed={toolMode === 'contentStructurer'}
            >
              <PencilSquareIcon className="w-5 h-5" />
              <span>Content Structurer</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <InputForm 
              onSubmit={toolMode === 'ideaGenerator' ? handleGenerateIdeas : handleStructureContent} 
              isLoading={isLoading}
              toolMode={toolMode}
              context={context}
              onContextChange={setContext}
              caption={caption}
              onCaptionChange={setCaption}
              logo={logo}
              onLogoChange={setLogo}
              brandColor={brandColor}
              onBrandColorChange={setBrandColor}
              mode={mode}
              onModeChange={setMode}
              rawContent={rawContent}
              onRawContentChange={setRawContent}
              outputFormat={outputFormat}
              onOutputFormatChange={setOutputFormat}
              onSaveDraft={handleSaveDraft}
              onLoadDraft={loadDraft}
              draftExists={draftExists}
              saveMessage={saveMessage}
              isLimitExceeded={isLimitExceeded}
            />
          </div>
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-white/5 p-4 sm:p-6 rounded-2xl min-h-[500px] border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-2xl dark:shadow-black/20">
              {isLoading && <LoadingSpinner />}
              {error && <ErrorDisplay message={error} />}
              {!isLoading && !error && hasResults && (
                <>
                  {designIdea && toolMode === 'ideaGenerator' && (
                    <ResultsDisplay 
                        idea={designIdea}
                        onRegenerate={handleRegenerate}
                        isRegenerating={isRegenerating}
                        mode={mode}
                    />
                  )}
                  {structuredContent && toolMode === 'contentStructurer' && (
                    <StructuredContentDisplay content={structuredContent} format={outputFormat} />
                  )}
                </>
              )}
              {!isLoading && !error && !hasResults && <Welcome toolMode={toolMode} />}
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-gray-200 dark:border-white/10 mt-12 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4">
          <img src="https://lemmaiot.com.ng/assets/images/logo.png" alt="LemmaIoT Logo" className="h-10" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Product of LemmaIoT Cloud Solution to aid Nigerian Business.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
