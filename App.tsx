import React, { useState, useEffect, useCallback } from 'react';
import { Mood, TimeOfDay, ViewState } from './types';
import { generateContextualMessage } from './services/gemini';
import { trackEvent, trackPageView } from './services/analytics';
import MoodSelector from './components/MoodSelector';
import TimeSelector from './components/TimeSelector';
import ShareCard from './components/ShareCard';
import Settings from './components/Settings';
import BackgroundInteractions from './components/BackgroundInteractions';
import AppIcon from './components/AppIcon';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('main');
  const [mood, setMood] = useState<Mood>(Mood.NEUTRAL);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(TimeOfDay.MORNING);
  const [context, setContext] = useState('');
  const [message, setMessage] = useState<string>('Welcome. How are you approaching things today?');
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showQA, setShowQA] = useState(false);

  // Router logic with safety for sandboxed environments (blob URLs)
  useEffect(() => {
    try {
      if (window.location.protocol === 'blob:') return;
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('utm_source') === 'notification' ? 'notification' : 'icon';
      trackPageView(source);
    } catch (e) {
      console.warn("URL parameters inaccessible in this environment");
    }
  }, []);

  const fetchMessage = useCallback(async (isRegeneration = false) => {
    setLoading(true);
    try {
      const newMessage = await generateContextualMessage(mood, timeOfDay, context);
      setMessage(newMessage);
      setHasGenerated(true);
      trackEvent(isRegeneration ? 'message_regeneration' : 'message_generation', {
        mood,
        time_of_day: timeOfDay,
        has_context: context.length > 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mood, timeOfDay, context]);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setTimeOfDay(TimeOfDay.MORNING);
    else if (hours < 17) setTimeOfDay(TimeOfDay.MIDDAY);
    else setTimeOfDay(TimeOfDay.END_OF_DAY);
  }, []);

  const toggleSettings = () => {
    const nextView = view === 'main' ? 'settings' : 'main';
    setView(nextView);
    trackEvent('view_changed', { view: nextView });
  };

  const goHome = () => {
    try {
      if (window.location.protocol !== 'blob:') {
        const url = new URL(window.location.href);
        url.searchParams.delete('m');
        window.history.replaceState({}, '', url.toString());
      }
    } catch (e) {}
    setView('main');
    setHasGenerated(false);
    setMessage("Welcome. How are you approaching things today?");
    setContext('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-6 scrollbar-hide relative overflow-x-hidden selection:bg-slate-200">
      <BackgroundInteractions />

      <div className="max-w-xl md:max-w-2xl w-full relative z-10">
        <header className="flex items-center justify-between mb-12 px-4">
          <div className="w-10">
            {view !== 'main' && (
               <button onClick={goHome} className="text-slate-300 hover:text-slate-600 transition-colors p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path></svg>
               </button>
            )}
          </div>
          
          <div className="flex flex-col items-center text-center space-y-2 cursor-pointer group" onClick={goHome}>
            <div className="relative">
              <AppIcon variant="glow" size={42} className="shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform duration-300 rounded-[12px]" />
            </div>
            <h1 className="text-xl font-serif font-semibold tracking-tight text-slate-800 pt-1">SoftWorkday</h1>
          </div>

          <button 
            onClick={toggleSettings}
            className={`p-2 rounded-full transition-all ${view === 'settings' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
              <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM136,32V44a8,8,0,0,1-16,0V32a8,8,0,0,1,16,0Zm0,192v12a8,8,0,0,1-16,0V224a8,8,0,0,1,16,0ZM32,120H44a8,8,0,0,1,0,16H32a8,8,0,0,1,0-16Zm192,0h12a8,8,0,0,1,0,16H224a8,8,0,0,1,0-16ZM62.34,51a8,8,0,0,1,0,11.32L53.86,70.83a8,8,0,1,1-11.32-11.32l8.49-8.49A8,8,0,0,1,62.34,51Zm149.8,149.8a8,8,0,0,1,0,11.32l-8.49,8.49a8,8,0,0,1-11.32-11.32l8.49-8.49A8,8,0,0,1,212.14,200.86ZM62.34,204.86a8,8,0,0,1-11.32,0l-8.49-8.49a8,8,0,0,1,11.32-11.32l8.49,8.49A8,8,0,0,1,62.34,204.86ZM212.14,51a8,8,0,0,1,11.32,11.32l-8.49,8.49a8,8,0,0,1-11.32-11.32l8.49-8.49A8,8,0,0,1,212.14,51Z"></path>
            </svg>
          </button>
        </header>

        <main className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] px-12 md:px-16 py-8 relative transition-all min-h-[500px] flex flex-col justify-center overflow-hidden">
          {view === 'settings' ? (
            <div className="py-8">
              <Settings onBack={() => setView('main')} />
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center min-h-[400px] justify-center">
              
              {/* Top-Layer Loading Indicator Overlay */}
              {loading && (
                <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-center animate-fade-in">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center animate-breathe shadow-2xl shadow-slate-200">
                      <span className="loading-emoji text-3xl"></span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-slate-900 text-xs font-bold uppercase tracking-[0.6em] animate-pulse">Finding your perspective</p>
                    <p className="text-slate-400 text-sm font-medium italic">Taking a quiet moment...</p>
                  </div>
                </div>
              )}

              {/* Quote Display Area - Fine-tuned with Source Serif 4 */}
              <div className={`transition-all duration-700 w-full text-center py-16 ${loading ? 'opacity-0 scale-[0.98] blur-sm' : 'opacity-100 scale-100'}`}>
                <blockquote className="text-2xl md:text-[2.2rem] font-serif text-slate-800 leading-[1.6] italic font-light tracking-tight max-w-[88%] mx-auto antialiased">
                  “{message}”
                </blockquote>
              </div>

              {/* Interaction Block */}
              {!hasGenerated ? (
                <div className={`space-y-12 w-full animate-fade-in max-w-md mx-auto pb-8 transition-all duration-500 ${loading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                  <div className="text-center">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">Current State</p>
                    <MoodSelector currentMood={mood} onSelect={setMood} />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="Context? (e.g. busy morning)"
                        className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all text-slate-600 text-sm placeholder:text-slate-300 group-hover:bg-slate-100"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchMessage(false)}
                      />
                    </div>
                    <button
                      onClick={() => fetchMessage(false)}
                      disabled={loading}
                      className="w-full bg-slate-900 text-white py-5 rounded-2xl font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.99] disabled:opacity-50 h-14"
                    >
                      Set Perspective
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`flex flex-col items-center w-full animate-fade-in pt-8 pb-8 space-y-8 transition-all duration-500 ${loading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                  <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
                    <button
                      onClick={() => fetchMessage(true)}
                      disabled={loading}
                      className="w-full bg-slate-900 text-white py-5 rounded-2xl font-semibold hover:bg-slate-800 transition-all active:scale-[0.99] h-14"
                    >
                      Another Perspective
                    </button>
                    
                    <div className="flex items-center justify-center gap-6 pt-4">
                      <button
                        onClick={goHome}
                        className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
                      >
                        Start Over
                      </button>
                      <div className="w-px h-3 bg-slate-200"></div>
                      <ShareCard message={message} timeOfDay={timeOfDay} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="mt-20 text-center pb-12">
          <p className="text-slate-300 text-[9px] uppercase tracking-[0.3em] font-medium">
            SoftWorkday • Built for the modern workday
          </p>
          <div className="mt-8 flex flex-col items-center">
            <button 
              onClick={() => setShowQA(!showQA)}
              className="text-slate-200 hover:text-slate-300 transition-colors text-[9px] uppercase tracking-widest font-bold"
            >
              {showQA ? 'Hide Testing' : 'QA Menu'}
            </button>
            {showQA && (
              <div className="mt-4 animate-fade-in">
                <TimeSelector currentTime={timeOfDay} onSelect={setTimeOfDay} />
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;