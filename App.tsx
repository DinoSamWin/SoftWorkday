
import React, { useState, useEffect, useCallback } from 'react';
import { Mood, TimeOfDay, ViewState, StoredMessage } from './types';
import { generateContextualMessage } from './services/gemini';
import { trackEvent, trackPageView } from './services/analytics';
import { archiveMessage, getMessageById } from './services/storage';
import MoodSelector from './components/MoodSelector';
import TimeSelector from './components/TimeSelector';
import ShareCard from './components/ShareCard';
import Settings from './components/Settings';
import BackgroundInteractions from './components/BackgroundInteractions';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('main');
  const [mood, setMood] = useState<Mood>(Mood.NEUTRAL);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(TimeOfDay.MORNING);
  const [context, setContext] = useState('');
  const [reflection, setReflection] = useState('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showQA, setShowQA] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  // Router logic to handle detail page via URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get('m');
    const source = params.get('utm_source') === 'notification' ? 'notification' : 'direct';

    if (messageId) {
      handleDetailView(messageId);
    } else {
      trackPageView(source === 'notification' ? 'notification' : 'icon');
    }
  }, []);

  const handleDetailView = async (id: string) => {
    setLoading(true);
    setView('detail');
    
    // Check if it's already archived
    let stored = await getMessageById(id);
    
    if (stored) {
      setMessage(stored.text);
      setTimeOfDay(stored.timeOfDay);
      setMood(stored.mood);
      setReflection(stored.reflection || '');
      setHasGenerated(true);
      setActiveMessageId(id);
    } else if (id.startsWith('note_')) {
      // If it's a new notification trigger, generate it now
      const parts = id.split('_');
      const type = parts[1] as TimeOfDay || TimeOfDay.MORNING;
      const text = await generateContextualMessage(Mood.NEUTRAL, type, "Checking in from notification");
      
      const newMessage: StoredMessage = {
        id,
        text,
        mood: Mood.NEUTRAL,
        timeOfDay: type,
        timestamp: Date.now()
      };
      
      await archiveMessage(newMessage);
      setMessage(text);
      setTimeOfDay(type);
      setHasGenerated(true);
      setActiveMessageId(id);
    }
    
    setLoading(false);
    trackEvent('detail_view_loaded', { message_id: id });
  };

  const fetchMessage = useCallback(async (isRegeneration = false) => {
    setLoading(true);
    const newMessageText = await generateContextualMessage(mood, timeOfDay, context);
    
    const id = isRegeneration && activeMessageId ? activeMessageId : `gen_${Date.now()}`;
    const stored: StoredMessage = {
      id,
      text: newMessageText,
      mood,
      timeOfDay,
      timestamp: Date.now(),
      reflection: ''
    };
    
    await archiveMessage(stored);
    setMessage(newMessageText);
    setActiveMessageId(id);
    setLoading(false);
    setHasGenerated(true);

    trackEvent(isRegeneration ? 'message_regeneration' : 'message_generation', {
      mood,
      time_of_day: timeOfDay,
      has_context: context.length > 0
    });
  }, [mood, timeOfDay, context, activeMessageId]);

  // Sync reflection to storage
  useEffect(() => {
    if (activeMessageId && hasGenerated && reflection !== '') {
      const update = async () => {
        const existing = await getMessageById(activeMessageId);
        if (existing) {
          await archiveMessage({ ...existing, reflection });
        }
      };
      const timeout = setTimeout(update, 1000);
      return () => clearTimeout(timeout);
    }
  }, [reflection, activeMessageId, hasGenerated]);

  // Initial greeting
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('m')) return; // Don't show greeting if in detail view

    const hours = new Date().getHours();
    if (hours < 12) setTimeOfDay(TimeOfDay.MORNING);
    else if (hours < 17) setTimeOfDay(TimeOfDay.MIDDAY);
    else setTimeOfDay(TimeOfDay.END_OF_DAY);
    
    setMessage("Welcome. How are you approaching things today?");
  }, []);

  const toggleSettings = () => {
    const nextView = view === 'settings' ? 'main' : 'settings';
    setView(nextView);
    trackEvent('view_changed', { view: nextView });
  };

  const goHome = () => {
    window.history.replaceState({}, '', window.location.pathname);
    setView('main');
    setHasGenerated(false);
    setActiveMessageId(null);
    setMessage("Welcome. How are you approaching things today?");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-6 scrollbar-hide relative overflow-x-hidden">
      <BackgroundInteractions />

      <div className="max-w-xl md:max-w-2xl w-full relative z-10">
        
        {/* Brand Identity */}
        <header className="flex items-center justify-between mb-12 px-4">
          <div className="w-10">
            {view !== 'main' && (
               <button onClick={goHome} className="text-slate-300 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path></svg>
               </button>
            )}
          </div>
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 cursor-pointer" onClick={goHome}>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-800 pt-1">SoftWorkday</h1>
          </div>

          <button 
            onClick={toggleSettings}
            className={`p-2 rounded-full transition-all ${view === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
              <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM136,32V44a8,8,0,0,1-16,0V32a8,8,0,0,1,16,0Zm0,192v12a8,8,0,0,1-16,0V224a8,8,0,0,1,16,0ZM32,120H44a8,8,0,0,1,0,16H32a8,8,0,0,1,0-16Zm192,0h12a8,8,0,0,1,0,16H224a8,8,0,0,1,0-16ZM62.34,51a8,8,0,0,1,0,11.32L53.86,70.83a8,8,0,1,1-11.32-11.32l8.49-8.49A8,8,0,0,1,62.34,51Zm149.8,149.8a8,8,0,0,1,0,11.32l-8.49,8.49a8,8,0,0,1-11.32-11.32l8.49-8.49A8,8,0,0,1,212.14,200.86ZM62.34,204.86a8,8,0,0,1-11.32,0l-8.49-8.49a8,8,0,0,1,11.32-11.32l8.49,8.49A8,8,0,0,1,62.34,204.86ZM212.14,51a8,8,0,0,1,11.32,11.32l-8.49,8.49a8,8,0,0,1-11.32-11.32l8.49-8.49A8,8,0,0,1,212.14,51Z"></path>
            </svg>
          </button>
        </header>

        {/* Main Interface */}
        <main className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-12 md:p-16 relative transition-all min-h-[500px] flex flex-col justify-center">
          {view === 'settings' ? (
            <Settings onBack={goHome} />
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              
              <div className={`transition-all duration-700 w-full text-center ${loading ? 'opacity-20 scale-[0.98]' : 'opacity-100 scale-100'}`}>
                <blockquote className="text-2xl md:text-4xl font-serif text-slate-800 leading-[1.9] md:leading-[2.1] mb-16 italic font-normal tracking-tight">
                  “{message}”
                </blockquote>
              </div>

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 border-2 border-slate-100 border-t-slate-800 rounded-full animate-spin"></div>
                </div>
              )}

              {(!hasGenerated && view !== 'detail') ? (
                <div className="space-y-12 w-full animate-fade-in max-w-md mx-auto">
                  <div className="text-center">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-8">Current State</p>
                    <MoodSelector currentMood={mood} onSelect={setMood} />
                  </div>
                  
                  <div className="space-y-6">
                    <input 
                      type="text" 
                      placeholder="One word on your mind? (optional)"
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all text-slate-600 text-sm placeholder:text-slate-300"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchMessage(false)}
                    />
                    <button
                      onClick={() => fetchMessage(false)}
                      disabled={loading}
                      className="w-full bg-slate-900 text-white py-5 rounded-2xl font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.99] disabled:opacity-50"
                    >
                      Set Perspective
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full animate-fade-in pt-8 border-t border-slate-50 space-y-8">
                  <div className="w-full max-w-md mx-auto">
                    <textarea
                      placeholder="Jot down a quick reflection..."
                      className="w-full p-6 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all text-slate-600 text-sm resize-none h-24 placeholder:text-slate-300 italic"
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
                    {view !== 'detail' && (
                       <button
                         onClick={() => fetchMessage(true)}
                         disabled={loading}
                         className="w-full bg-slate-900 text-white py-5 rounded-2xl font-semibold hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-50"
                       >
                         Another Perspective
                       </button>
                    )}
                    
                    <div className="flex items-center justify-center gap-6 pt-4">
                      <button
                        onClick={goHome}
                        className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
                      >
                        {view === 'detail' ? 'Go Home' : 'Start Over'}
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

        <footer className="mt-20 text-center space-y-8 relative z-10">
          <p className="text-slate-300 text-[10px] uppercase tracking-[0.3em] font-medium">
            SoftWorkday • Built for the modern workday
          </p>

          <div className="flex flex-col items-center">
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
