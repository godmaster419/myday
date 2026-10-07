import { Task } from '../types';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatICSDate(dateStr: string, timeStr?: string): string {
  const cleanDate = dateStr.replace(/-/g, '');
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':');
    return `${cleanDate}T${pad(Number(hours))}${pad(Number(minutes))}00`;
  }
  return cleanDate;
}

export function generateICS(task: Task, durationMinutes: number = 60, reminderMinutes: number = 15): string {
  const now = new Date();
  const uid = `${task.id}-${Date.now()}@myday.app`;
  const created = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  let dtStart: string;
  let dtEnd: string;

  if (task.time) {
    dtStart = `DTSTART:${formatICSDate(task.date, task.time)}`;
    const [h, m] = task.time.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationMinutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    dtEnd = `DTEND:${formatICSDate(task.date, `${pad(endH)}:${pad(endM)}`)}`;
  } else {
    dtStart = `DTSTART;VALUE=DATE:${formatICSDate(task.date)}`;
    dtEnd = `DTEND;VALUE=DATE:${formatICSDate(task.date)}`;
  }

  let alarm = '';
  if (task.reminder && task.time) {
    alarm = `BEGIN:VALARM
TRIGGER:-PT${reminderMinutes}M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${task.title}
END:VALARM`;
  }

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//My Day//Personal Productivity//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
${dtStart}
${dtEnd}
DTSTAMP:${created}
SUMMARY:${task.title}
DESCRIPTION:${task.description ? task.description.replace(/\n/g, '\\n') : task.title}
STATUS:CONFIRMED
${alarm}
END:VEVENT
END:VCALENDAR`;

  return ics.trim();
}

export function downloadICS(task: Task, durationMinutes: number = 60, reminderMinutes: number = 15): boolean {
  try {
    const ics = generateICS(task, durationMinutes, reminderMinutes);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = task.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30) || 'task';
    a.download = `${safeTitle}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Failed to generate ICS:', err);
    return false;
  }
}
