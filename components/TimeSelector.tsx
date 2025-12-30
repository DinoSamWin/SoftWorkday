
import React from 'react';
import { TimeOfDay } from '../types';

interface TimeSelectorProps {
  currentTime: TimeOfDay;
  onSelect: (time: TimeOfDay) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ currentTime, onSelect }) => {
  return (
    <div className="inline-flex p-1 bg-slate-100 rounded-lg mb-6 border border-slate-200">
      {Object.values(TimeOfDay).map((time) => (
        <button
          key={time}
          onClick={() => onSelect(time)}
          className={`
            px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 capitalize
            ${currentTime === time 
              ? 'bg-white text-slate-800 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'}
          `}
        >
          {time}
        </button>
      ))}
    </div>
  );
};

export default TimeSelector;
