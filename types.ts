
export enum Mood {
  CALM = 'calm',
  ANXIOUS = 'anxious',
  TIRED = 'tired',
  NEUTRAL = 'neutral'
}

export enum TimeOfDay {
  MORNING = 'morning',
  MIDDAY = 'midday',
  END_OF_DAY = 'end of day'
}

export interface MessageResponse {
  text: string;
  isError?: boolean;
}

export interface UserPreferences {
  mood: Mood;
  context?: string;
  timeOfDay: TimeOfDay;
}

export interface NotificationSchedule {
  morning: string; // HH:MM
  midday: string;  // HH:MM
  evening: string; // HH:MM
}

export type ViewState = 'main' | 'settings';
