import React, { useState, useCallback } from 'react';
import { UploadIcon, ChevronDownIcon, XCircleIcon, SaveIcon, MagnifyingGlassIcon, LinkIcon } from './IconComponents';
import { DesignMode, ToolMode, OutputFormat, SearchResult } from '../types';
import { fetchRealTimeInfo } from '../services/geminiService';

interface InputFormProps {
  onSubmit: () => void;
  isLoading: boolean;
  toolMode: ToolMode;
  isLimitExceeded: boolean;

  // Shared props
  logo: string | null;
  onLogoChange: (logoBase64: string | null) => void;
  brandColor: string;
  onBrandColorChange: (color: string) => void;
  
  // Idea Generator props
  context: string;
  onContextChange: (value: string) => void;
  caption: string;
  onCaptionChange: (value: string) => void;
  mode: DesignMode;
  onModeChange: (mode: DesignMode) => void;

  // Content Structurer props
  rawContent: string;
  onRawContentChange: (value: string) => void;
  outputFormat: OutputFormat;
  onOutputFormatChange: (format: OutputFormat) => void;
  
  // Draft props
  onSaveDraft: () => void;
  onLoadDraft: () => void;
  draftExists: boolean;
  saveMessage: string;
}

const designModes: DesignMode[] = ['Standard Flyer', 'Carousel', 'Quiz', 'Video/Animation', 'Reel', 'Infographic'];
const outputFormats: OutputFormat[] = ['Flyer / Poster', 'Brochure', 'Social Media Post', 'Article / Blog Post'];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const InputForm: React.FC<InputFormProps> = ({ 
  onSubmit, 
  isLoading,
  toolMode,
  isLimitExceeded,
  logo, 
  onLogoChange, 
  brandColor, 
  onBrandColorChange,
  context, 
  onContextChange, 
  caption, 
  onCaptionChange,
  mode,
  onModeChange,
  rawContent,
  onRawContentChange,
  outputFormat,
  onOutputFormatChange,
  onSaveDraft,
  onLoadDraft,
  draftExists,
  saveMessage
}) => {
  const [isBrandSectionOpen, setIsBrandSectionOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleLogoUpload = useCallback(async (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for inline data
        alert("File is too large. Please select a file smaller than 4MB.");
        return;
      }
      const base64 = await fileToBase64(file);
      onLogoChange(base64);
    }
  }, [onLogoChange]);

  const handleRemoveLogo = () => {
    onLogoChange(null);
  }
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBrandColorChange(e.target.value);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const isGenerator = toolMode === 'ideaGenerator';
  const isGeneratorFormValid = context.trim() && caption.trim();
  const isStructurerFormValid = rawContent.trim();
  const isSubmitDisabled = isLoading || isLimitExceeded || (isGenerator ? !isGeneratorFormValid : !isStructurerFormValid);

  const handleClearContent = () => {
    if (isGenerator) {
      onContextChange('');
      onCaptionChange('');
    } else {
      onRawContentChange('');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const result = await fetchRealTimeInfo(searchQuery);
      setSearchResult(result);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSearching(false);
    }
  };

  const hasContentToClear = isGenerator ? (context || caption) : rawContent;

  return (
    <div className="bg-white dark:bg-white/5 p-6 rounded-2xl shadow-lg lg:sticky lg:top-8 border border-gray-200 dark:border-white/10">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{isGenerator ? 'Flyer Details' : 'Content Details'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {isGenerator && (
           <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-lg">
               <button 
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="w-full flex justify-between items-center text-left"
                aria-expanded={isSearchOpen}
                aria-controls="search-section"
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">AI Research Assistant</h3>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isSearchOpen ? 'rotate-180' : ''}`} />
              </button>
               <div 
                id="search-section"
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isSearchOpen ? 'max-h-[1000px] opacity-100 pt-4 mt-2 border-t border-gray-200 dark:border-white/10' : 'max-h-0 opacity-0'}`}
              >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Get up-to-date info to inspire your content.</p>
                  <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., summer music festivals 2024"
                        className="flex-grow w-full bg-white dark:bg-gray-800/50 rounded-md p-2.5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#FF3366] focus:outline-none transition duration-200 border border-gray-300 dark:border-gray-700"
                        onKeyDown={(e) => e.key === 'Enter' && !isSearching && handleSearch()}
                      />
                      <button
                        type="button"
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        className="flex-shrink-0 p-2.5 bg-[#FF3366] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        aria-label="Search with AI"
                      >
                          {isSearching ? (
                            <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                          ) : (
                            <MagnifyingGlassIcon className="w-5 h-5" />
                          )}
                      </button>
                  </div>

                  {isSearching && (
                    <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">Searching the web...</div>
                  )}
                  {searchError && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 text-red-300 rounded-lg text-sm">
                          {searchError}
                      </div>
                  )}
                  {searchResult && (
                      <div className="mt-4 space-y-4 animate-fade-in">
                          <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">AI-Generated Summary</h4>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-black/30 p-3 rounded-md whitespace-pre-line">
                                  {searchResult.summary}
                              </p>
                              <button 
                                  type="button"
                                  onClick={() => {
                                      onContextChange(searchResult.summary);
                                      setIsSearchOpen(false);
                                  }}
                                  className="mt-2 text-sm font-semibold text-white bg-[#0808F5] px-3 py-1.5 rounded-md hover:bg-opacity-90 transition-colors"
                              >
                                  Use as Context
                              </button>
                          </div>
                          {searchResult.sources.length > 0 && (
                              <div>
                                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Sources</h4>
                                  <ul className="mt-2 space-y-1">
                                      {searchResult.sources.map((source, index) => (
                                          <li key={index}>
                                              <a 
                                                  href={source.web.uri} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer" 
                                                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                  title={source.web.uri}
                                              >
                                                  <LinkIcon className="w-4 h-4 flex-shrink-0" />
                                                  <span className="truncate">{source.web.title || source.web.uri}</span>
                                              </a>
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          )}
                      </div>
                  )}
              </div>
            </div>
        )}

        <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-lg">
           <button 
            type="button"
            onClick={() => setIsBrandSectionOpen(!isBrandSectionOpen)}
            className="w-full flex justify-between items-center text-left"
            aria-expanded={isBrandSectionOpen}
            aria-controls="brand-identity-section"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Brand Identity (Optional)</h3>
            <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isBrandSectionOpen ? 'rotate-180' : ''}`} />
          </button>
           <div 
            id="brand-identity-section"
            className={`overflow-hidden transition-all duration-500 ease-in-out ${isBrandSectionOpen ? 'max-h-[500px] opacity-100 pt-4 mt-2 border-t border-gray-200 dark:border-white/10' : 'max-h-0 opacity-0'}`}
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo
                </label>
                {logo ? (
                  <div className="relative group bg-gray-200 dark:bg-black/20 rounded-md p-2">
                      <img src={logo} alt="Logo preview" className="max-h-24 mx-auto object-contain" />
                      <button 
                        type="button" 
                        onClick={handleRemoveLogo} 
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove logo"
                      >
                        &times;
                      </button>
                  </div>
                ) : (
                  <div 
                    className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#FF3366] transition-colors cursor-pointer bg-white dark:bg-transparent"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    onDrop={(e) => { e.preventDefault(); handleLogoUpload(e.dataTransfer.files); }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <UploadIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Click to upload or drag & drop
                    </p>
                    <input 
                      id="logo-upload" 
                      type="file" 
                      className="sr-only" 
                      accept="image/png, image/jpeg, image/webp, image/svg+xml" 
                      onChange={(e) => handleLogoUpload(e.target.files)}
                    />
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="brand-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand Color
                </label>
                <div className="flex items-center gap-3 bg-white dark:bg-black/20 rounded-md p-2 focus-within:ring-2 focus-within:ring-[#FF3366] border border-gray-200 dark:border-gray-700">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <input
                      id="brand-color"
                      type="color"
                      value={brandColor}
                      onChange={handleColorChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div 
                      className="w-full h-full rounded-md border-2 border-gray-300 dark:border-white/20"
                      style={{ backgroundColor: brandColor }}
                      aria-hidden="true"
                    ></div>
                  </div>
                  <input
                    type="text"
                    value={brandColor.toUpperCase()}
                    onChange={handleColorChange}
                    className="w-full bg-transparent font-mono text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none"
                    aria-label="Brand color hex code"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
           <div className="flex justify-between items-center border-b border-gray-200 dark:border-white/10 pb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{isGenerator ? 'Flyer Content' : 'Your Content'}</h3>
                <div className="flex items-center gap-2">
                  {hasContentToClear && (
                    <button
                        type="button"
                        onClick={handleClearContent}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
                        aria-label="Clear content fields"
                    >
                        <XCircleIcon className="w-4 h-4" />
                        Clear
                    </button>
                  )}
                </div>
            </div>
            {isGenerator ? (
              <>
                <div>
                  <label htmlFor="context" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Main Context
                  </label>
                  <textarea
                    id="context"
                    rows={4}
                    className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-md p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#FF3366] focus:outline-none transition duration-200 border border-gray-300 dark:border-gray-700"
                    placeholder="e.g., Grand opening for a new coffee shop"
                    value={context}
                    onChange={(e) => onContextChange(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="caption" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Caption / CTA
                  </label>
                  <textarea
                    id="caption"
                    rows={3}
                    className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-md p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#FF3366] focus:outline-none transition duration-200 border border-gray-300 dark:border-gray-700"
                    placeholder="e.g., Freshly brewed happiness, one cup at a time."
                    value={caption}
                    onChange={(e) => onCaptionChange(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="design-mode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Design Mode
                  </label>
                  <div className="relative">
                    <select
                      id="design-mode"
                      value={mode}
                      onChange={(e) => onModeChange(e.target.value as DesignMode)}
                      className="w-full bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-md p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF3366] focus:outline-none transition-colors duration-200 appearance-none border border-gray-300 dark:border-gray-700"
                      required
                    >
                      {designModes.map(m => ( <option key={m} value={m} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium">{m}</option>))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 dark:text-gray-300"><ChevronDownIcon className="w-5 h-5" /></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="raw-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paste your content here
                  </label>
                  <textarea
                    id="raw-content"
                    rows={8}
                    className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-md p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#FF3366] focus:outline-none transition duration-200 border border-gray-300 dark:border-gray-700"
                    placeholder="e.g., A draft of your product description, event details, or article..."
                    value={rawContent}
                    onChange={(e) => onRawContentChange(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="output-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Output Format
                  </label>
                  <div className="relative">
                    <select
                      id="output-format"
                      value={outputFormat}
                      onChange={(e) => onOutputFormatChange(e.target.value as OutputFormat)}
                      className="w-full bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-md p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF3366] focus:outline-none transition-colors duration-200 appearance-none border border-gray-300 dark:border-gray-700"
                      required
                    >
                      {outputFormats.map(f => ( <option key={f} value={f} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium">{f}</option>))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 dark:text-gray-300"><ChevronDownIcon className="w-5 h-5" /></div>
                  </div>
                </div>
              </>
            )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={onSaveDraft}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-4 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              aria-label="Save current inputs as a draft"
            >
              <SaveIcon className="w-5 h-5" />
              <span>{saveMessage || 'Save Draft'}</span>
            </button>
            <button
              type="button"
              onClick={onLoadDraft}
              disabled={!draftExists}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-4 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Load saved draft"
            >
              <UploadIcon className="w-5 h-5" />
              <span>Load Draft</span>
            </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full bg-[#FF3366] text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-[#FF3366] transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100"
        >
          {isLoading ? 'Processing...' : isLimitExceeded ? 'Daily Limit Reached' : (isGenerator ? 'Spark Ideas' : 'Structure Content')}
        </button>
      </form>
    </div>
  );
};

export default InputForm;