import React, { useState, useCallback } from 'react';
import { StructuredContent, OutputFormat, BrochurePanel, ArticleSection } from '../types';
import { ClipboardIcon, CheckIcon, MegaphoneIcon, DocumentTextIcon, SparklesIcon, HashtagIcon, IdentificationIcon, LightbulbIcon, QuestionMarkCircleIcon, ChatBubbleBottomCenterTextIcon } from './IconComponents';

const useCopyToClipboard = (): [(text: string, id: string | number) => void, string | number | null] => {
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const copy = useCallback((text: string, id: string | number) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  }, []);

  return [copy, copiedId];
};

const CopyButton: React.FC<{ text: string, id: string | number, copiedId: string | number | null, onCopy: (text: string, id: string | number) => void }> = ({ text, id, copiedId, onCopy }) => (
    <button
        onClick={() => onCopy(text, id)}
        className="flex-shrink-0 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-500 dark:text-gray-300"
        aria-label={`Copy text`}
    >
        {copiedId === id ? (
            <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
        ) : (
            <ClipboardIcon className="w-5 h-5" />
        )}
    </button>
);

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string; }> = ({ title, icon, children, className }) => (
    <div className={`bg-gradient-to-br from-blue-50 to-transparent dark:from-[#0808F5]/15 dark:to-transparent p-4 rounded-xl border border-blue-200 dark:border-[#FF3366]/30 shadow-lg dark:shadow-black/25 backdrop-blur-sm ${className || ''}`}>
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-[#0808F5] dark:text-[#FF3366] mb-3">
            {icon}
            {title}
        </h3>
        <div className="text-gray-700 dark:text-gray-200 space-y-2 text-sm sm:text-base">{children}</div>
    </div>
);

interface StructuredContentDisplayProps {
  content: StructuredContent;
  format: OutputFormat;
}

const StructuredContentDisplay: React.FC<StructuredContentDisplayProps> = ({ content, format }) => {
    const [copy, copiedId] = useCopyToClipboard();

    const renderList = (items: string[] | undefined, idPrefix: string) => (
        <ul className="list-disc list-inside space-y-2">
            {(items || []).map((item, index) => (
                <li key={`${idPrefix}-${index}`} className="flex items-start justify-between gap-2">
                    <span className="flex-grow">{item}</span>
                    <CopyButton text={item} id={`${idPrefix}-${index}`} copiedId={copiedId} onCopy={copy} />
                </li>
            ))}
        </ul>
    );

    const renderText = (text: string, id: string) => (
         <div className="flex items-start justify-between gap-2">
            <p className="flex-grow whitespace-pre-line">{text}</p>
            <CopyButton text={text} id={id} copiedId={copiedId} onCopy={copy} />
        </div>
    );
    
    const renderFlyerPoster = () => {
        const c = content as import('../types').FlyerPosterContent;
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResultCard title="Headlines" icon={<MegaphoneIcon />}>{renderList(c.headlines, 'headline')}</ResultCard>
                <ResultCard title="Calls to Action" icon={<ChatBubbleBottomCenterTextIcon />}>{renderList(c.ctas, 'cta')}</ResultCard>
                <ResultCard title="Body Content" icon={<DocumentTextIcon />} className="md:col-span-2">{renderText(c.body || '', 'body')}</ResultCard>
                <ResultCard title="Key Features" icon={<SparklesIcon />} className="md:col-span-2">{renderList(c.keyFeatures, 'feature')}</ResultCard>
            </div>
        );
    }
    
    const renderBrochure = () => {
        const c = content as import('../types').BrochureContent;
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <ResultCard title="Front Panel" icon={<LightbulbIcon />} className="md:col-span-2">
                    <div className="space-y-2">
                        <div className="p-2 bg-black/5 dark:bg-black/10 rounded-md">{renderText(c.frontPanel?.headline || '', 'fp-headline')}</div>
                        <div className="p-2 bg-black/5 dark:bg-black/10 rounded-md">{renderText(c.frontPanel?.tagline || '', 'fp-tagline')}</div>
                    </div>
                </ResultCard>
                {(c.innerPanels || []).map((panel: BrochurePanel, i) => (
                     <ResultCard key={i} title={panel.title || 'Inner Panel'} icon={<DocumentTextIcon />}>
                        {renderText(panel.content || '', `ip-${i}`)}
                    </ResultCard>
                ))}
                <ResultCard title="Back Panel" icon={<IdentificationIcon />} className="md:col-span-2">
                     <div className="space-y-2">
                        <div className="p-2 bg-black/5 dark:bg-black/10 rounded-md">{renderText(c.backPanel?.cta || '', 'bp-cta')}</div>
                        <div className="p-2 bg-black/5 dark:bg-black/10 rounded-md">{renderText(c.backPanel?.contactInfo || '', 'bp-contact')}</div>
                    </div>
                </ResultCard>
            </div>
        )
    }

    const renderSocialMedia = () => {
        const c = content as import('../types').SocialMediaPostContent;
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <ResultCard title="Hook" icon={<QuestionMarkCircleIcon />}>{renderText(c.hook || '', 'hook')}</ResultCard>
                 <ResultCard title="Call to Action" icon={<ChatBubbleBottomCenterTextIcon />}>{renderText(c.cta || '', 'cta')}</ResultCard>
                 <ResultCard title="Body" icon={<DocumentTextIcon />} className="md:col-span-2">{renderText(c.body || '', 'body')}</ResultCard>
                 <ResultCard title="Hashtags" icon={<HashtagIcon />} className="md:col-span-2">{renderList(c.hashtags, 'hashtag')}</ResultCard>
            </div>
        )
    }

    const renderArticle = () => {
        const c = content as import('../types').ArticleContent;
        return (
             <div className="space-y-6">
                <ResultCard title="Title Suggestions" icon={<LightbulbIcon />}>{renderList(c.titleSuggestions, 'title')}</ResultCard>
                <ResultCard title="Introduction" icon={<DocumentTextIcon />}>{renderText(c.introduction || '', 'intro')}</ResultCard>
                {(c.sections || []).map((section: ArticleSection, i) => (
                     <ResultCard key={i} title={section.title || 'Section'} icon={<DocumentTextIcon />}>
                        {renderText(section.content || '', `section-${i}`)}
                    </ResultCard>
                ))}
                <ResultCard title="Conclusion" icon={<DocumentTextIcon />}>{renderText(c.conclusion || '', 'conclusion')}</ResultCard>
            </div>
        )
    }

    const renderContent = () => {
        switch (format) {
            case 'Flyer / Poster': return renderFlyerPoster();
            case 'Brochure': return renderBrochure();
            case 'Social Media Post': return renderSocialMedia();
            case 'Article / Blog Post': return renderArticle();
            default: return <p>Could not display content for the selected format.</p>
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Structured Content for: <span className="text-[#FF3366]">{format}</span></h2>
            {renderContent()}
        </div>
    );
};

export default StructuredContentDisplay;