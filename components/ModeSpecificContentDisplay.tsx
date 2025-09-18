import React from 'react';
import { DesignMode } from '../types';

interface ModeSpecificContentDisplayProps {
  content: string;
  mode: DesignMode;
}

const ContentBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-black/5 dark:bg-black/20 p-3 rounded-lg">
        <h4 className="font-bold text-sm text-[#0808F5] dark:text-[#FF3366] mb-1">{title}</h4>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{children}</p>
    </div>
);

const ModeSpecificContentDisplay: React.FC<ModeSpecificContentDisplayProps> = ({ content, mode }) => {
  const renderDefault = () => (
    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{content}</p>
  );

  const renderCarouselContent = () => {
    const slides = content.split(/Slide \d+:/i).filter(s => s.trim() !== '');
    if (slides.length < 1 && !content.match(/Slide \d+:/i)) return renderDefault();
    return (
      <div className="space-y-4">
        {slides.map((slide, index) => (
          <ContentBlock key={index} title={`Slide ${index + 1}`}>
            {slide.trim()}
          </ContentBlock>
        ))}
      </div>
    );
  };
  
  const renderQuizContent = () => {
    const questions = content.split(/Q\d+:|Question \d+:/i).filter(q => q.trim() !== '');
    if (questions.length < 1 && !content.match(/Q\d+:|Question \d+:/i)) return renderDefault();
    return (
       <div className="space-y-4">
        {questions.map((q, index) => (
          <ContentBlock key={index} title={`Question ${index + 1}`}>
            {q.trim()}
          </ContentBlock>
        ))}
      </div>
    );
  };

  const renderVideoReelContent = () => {
    const scenes = content.split(/Scene \d+:/i).filter(s => s.trim() !== '');
    if (scenes.length < 1 && !content.match(/Scene \d+:/i)) return renderDefault();
    return (
      <div className="space-y-4">
        {scenes.map((scene, index) => (
          <ContentBlock key={index} title={`Scene ${index + 1}`}>
            {scene.trim()}
          </ContentBlock>
        ))}
      </div>
    );
  };

  const renderInfographicContent = () => {
    const sections = content.split(/Section \d+:/i).filter(s => s.trim() !== '');
    if (sections.length < 1 && !content.match(/Section \d+:/i)) return renderDefault();
     return (
      <div className="space-y-4">
        {sections.map((section, index) => (
          <ContentBlock key={index} title={`Section ${index + 1}`}>
            {section.trim()}
          </ContentBlock>
        ))}
      </div>
    );
  };

  switch (mode) {
    case 'Carousel':
      return renderCarouselContent();
    case 'Quiz':
        return renderQuizContent();
    case 'Video/Animation':
    case 'Reel':
        return renderVideoReelContent();
    case 'Infographic':
        return renderInfographicContent();
    default:
      return renderDefault();
  }
};

export default ModeSpecificContentDisplay;
