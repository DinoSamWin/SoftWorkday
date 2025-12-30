
import React, { useRef } from 'react';
import { trackEvent } from '../services/analytics';

interface ShareCardProps {
  message: string;
  timeOfDay: string;
}

const ShareCard: React.FC<ShareCardProps> = ({ message, timeOfDay }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    trackEvent('share_button_click', { time_of_day: timeOfDay });
    
    if (!cardRef.current) return;
    try {
      // @ts-ignore
      const canvas = await window.html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 3, 
        useCORS: true,
        logging: false,
        width: 1080,
        height: 1080,
      });
      
      const link = document.createElement('a');
      link.download = `SoftWorkday-${timeOfDay.replace(/\s+/g, '-')}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0); 
      link.click();

      trackEvent('share_card_generated', { time_of_day: timeOfDay });
    } catch (err) {
      console.error('Failed to capture card', err);
    }
  };

  return (
    <>
      {/* Hidden container for card generation */}
      <div className="fixed -left-[4000px] top-0 pointer-events-none">
        <div 
          ref={cardRef}
          className="w-[1080px] h-[1080px] bg-white flex flex-col items-center justify-between p-24 text-center font-serif relative"
        >
          <div className="absolute top-0 left-0 w-4 h-full bg-slate-900"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-50 rounded-full -mr-[200px] -mt-[200px]"></div>
          
          <div className="z-10 mt-12 flex flex-col items-center gap-4">
             <div className="text-slate-400 uppercase tracking-[0.5em] text-2xl font-sans font-bold">
               {timeOfDay} baseline
             </div>
             <div className="w-12 h-px bg-slate-200"></div>
          </div>
          
          <div className="z-10 flex-grow flex items-center justify-center px-16 max-w-[900px]">
            <blockquote className="text-[64px] text-slate-900 leading-[1.6] font-normal italic">
              “{message}”
            </blockquote>
          </div>
          
          <div className="z-10 mb-12 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-slate-900 rounded-[1.25rem] flex items-center justify-center shadow-2xl">
                  <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
               </div>
               <div className="text-left">
                  <div className="text-3xl font-sans font-bold tracking-tight text-slate-900">SoftWorkday</div>
                  <div className="text-lg font-sans text-slate-400 tracking-wide">A mindful baseline for your workday</div>
               </div>
            </div>
          </div>

          <div className="absolute bottom-10 right-20 text-slate-100 font-sans text-[100px] font-bold select-none">
            SoftWorkday
          </div>
        </div>
      </div>

      <button
        onClick={downloadCard}
        className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
          <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V40a8,8,0,0,0-16,0v84.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"></path>
        </svg>
        Share
      </button>
    </>
  );
};

export default ShareCard;
