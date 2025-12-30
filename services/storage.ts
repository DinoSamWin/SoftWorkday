
declare const chrome: any;

import { NotificationSchedule } from '../types';

const DEFAULT_SCHEDULE: NotificationSchedule = {
  morning: '09:10',
  midday: '11:50',
  evening: '17:50'
};

const STORAGE_KEY = 'softworkday_notification_schedule';

/**
 * Checks if running as a Chrome Extension.
 */
const isExtension = () => typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

/**
 * Persist schedule and reschedule alarms if in extension mode.
 */
export const saveSchedule = async (schedule: NotificationSchedule): Promise<void> => {
  if (isExtension()) {
    await chrome.storage.local.set({ [STORAGE_KEY]: schedule });
    await rescheduleAlarms(schedule);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  }
};

/**
 * Retrieve schedule from storage.
 */
export const getSchedule = async (): Promise<NotificationSchedule> => {
  if (isExtension()) {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || DEFAULT_SCHEDULE;
  } else {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE;
  }
};

/**
 * Reset to defaults.
 */
export const resetSchedule = async (): Promise<NotificationSchedule> => {
  await saveSchedule(DEFAULT_SCHEDULE);
  return DEFAULT_SCHEDULE;
};

/**
 * Reschedule Chrome Alarms.
 */
const rescheduleAlarms = async (schedule: NotificationSchedule) => {
  if (!isExtension() || !chrome.alarms) return;

  await chrome.alarms.clearAll();

  const createAlarm = (id: string, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);

    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const when = alarmTime.getTime();
    chrome.alarms.create(id, { when, periodInMinutes: 1440 });
  };

  createAlarm('morning_steady', schedule.morning);
  createAlarm('midday_steady', schedule.midday);
  createAlarm('evening_steady', schedule.evening);
};
