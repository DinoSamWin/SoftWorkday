
/**
 * Background Service Worker for SoftWorkday
 * Manages daily alarms and user notifications.
 */

declare const chrome: any;

const STORAGE_KEY = 'softworkday_notification_schedule';

const NOTIFICATION_CONTENT = {
  morning_steady: {
    title: "Good Morning, SoftWorkday.",
    message: "Start your day with a grounding perspective."
  },
  midday_steady: {
    title: "SoftWorkday Pause.",
    message: "A moment to re-center before the afternoon."
  },
  evening_steady: {
    title: "End of Day, SoftWorkday.",
    message: "Leave the desk behind. Transition home."
  }
};

chrome.runtime.onInstalled.addListener(async () => {
  console.log('SoftWorkday Extension Installed');
  const schedule = await chrome.storage.local.get(STORAGE_KEY);
  if (!schedule[STORAGE_KEY]) {
    const defaults = { morning: '09:10', midday: '11:50', evening: '17:50' };
    await chrome.storage.local.set({ [STORAGE_KEY]: defaults });
    rescheduleAlarms(defaults);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  const content = NOTIFICATION_CONTENT[alarm.name as keyof typeof NOTIFICATION_CONTENT];
  if (content) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: content.title,
      message: content.message,
      priority: 2
    });
  }
});

chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'index.html?utm_source=notification' });
});

async function rescheduleAlarms(schedule: any) {
  await chrome.alarms.clearAll();

  const createAlarm = (id: string, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);

    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    chrome.alarms.create(id, { 
      when: alarmTime.getTime(), 
      periodInMinutes: 1440 
    });
  };

  createAlarm('morning_steady', schedule.morning);
  createAlarm('midday_steady', schedule.midday);
  createAlarm('evening_steady', schedule.evening);
}
