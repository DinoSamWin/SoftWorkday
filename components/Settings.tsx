import React, { useState, useEffect } from 'react';
import { NotificationSchedule } from '../types';
import { getSchedule, saveSchedule, resetSchedule } from '../services/storage';
import { trackEvent } from '../services/analytics';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [schedule, setSchedule] = useState<NotificationSchedule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    getSchedule().then(setSchedule);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule) return;
    
    setIsSaving(true);
    await saveSchedule(schedule);
    setIsSaving(false);
    setShowToast(true);
    trackEvent('settings_saved', { schedule });
    
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleReset = async () => {
    const fresh = await resetSchedule();
    setSchedule(fresh);
    setShowToast(true);
    trackEvent('settings_reset');
    setTimeout(() => setShowToast(false), 3000);
  };

  const updateTime = (key: keyof NotificationSchedule, value: string) => {
    if (schedule) {
      setSchedule({ ...schedule, [key]: value });
    }
  };

  if (!schedule) return <div className="p-12 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="animate-fade-in w-full max-w-md mx-auto space-y-12 pb-12">
      <div>
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">App Preferences</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="space-y-6">
            <TimeInput 
              label="Morning Arrival" 
              value={schedule.morning} 
              onChange={(v) => updateTime('morning', v)} 
              description="Start your day with a steady baseline."
            />
            <TimeInput 
              label="Midday Re-center" 
              value={schedule.midday} 
              onChange={(v) => updateTime('midday', v)} 
              description="A pause before the afternoon noise."
            />
            <TimeInput 
              label="Evening Transition" 
              value={schedule.evening} 
              onChange={(v) => updateTime('evening', v)} 
              description="Leave the desk behind. Shed the stress."
            />
          </div>

          <div className="pt-6 space-y-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.99] disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              className="w-full text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest transition-colors py-2"
            >
              Reset to Defaults
            </button>
          </div>
        </form>
      </div>

      {showToast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-medium shadow-2xl animate-fade-in z-50">
          Preferences updated successfully
        </div>
      )}
    </div>
  );
};

const TimeInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; description: string }> = ({ label, value, onChange, description }) => (
  <div className="bg-slate-50 p-6 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
    <div className="flex items-center justify-between mb-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input 
        type="time" 
        required
        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
    <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export default Settings;