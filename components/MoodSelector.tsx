import React from 'react';
import { Mood } from '../types';

interface MoodSelectorProps {
  currentMood: Mood;
  onSelect: (mood: Mood) => void;
}

const moodEmojis: Record<Mood, string> = {
  [Mood.CALM]: '🌊',
  [Mood.ANXIOUS]: '🌪️',
  [Mood.TIRED]: '☕',
  [Mood.NEUTRAL]: '🌥️',
};

const MoodSelector: React.FC<MoodSelectorProps> = ({ currentMood, onSelect }) => {
  return (
    <div className="flex flex-wrap md:flex-nowrap justify-center items-center gap-3 mb-8 w-full">
      {Object.values(Mood).map((mood) => (
        <button
          key={mood}
          onClick={() => onSelect(mood)}
          className={`
            flex-1 md:flex-none px-5 py-2.5 rounded-full border transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap
            ${currentMood === mood 
              ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'}
          `}
        >
          <span className="text-lg leading-none">{moodEmojis[mood]}</span>
          <span className="capitalize text-sm font-medium">{mood}</span>
        </button>
      ))}
    </div>
  );
};

export default MoodSelector;