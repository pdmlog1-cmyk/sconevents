'use client';

import { useState } from 'react';
import { conf } from '@/lib/config';

type Row = [start: string, end: string, type: string, title: string, speaker: string];

const TYPE_LABELS: Record<string, string> = {
  registration: 'Registration', ceremony: 'Ceremony', keynote: 'Keynote', plenary: 'Plenary',
  session: 'Technical Session', panel: 'Panel', workshop: 'Workshop', break: 'Break',
  lunch: 'Lunch', poster: 'Poster Session', reception: 'Reception', gala: 'Gala',
  award: 'Awards', networking: 'Networking',
};

const PROGRAM: Record<number, Row[]> = {
  1: [
    ['08:00', '09:00', 'registration', 'Registration & Welcome Coffee', ''],
    ['09:00', '09:30', 'ceremony',     'Opening Ceremony',              ''],
    ['09:30', '10:30', 'keynote',      'Opening Keynote',               ''],
    ['10:30', '11:00', 'break',        'Coffee & Networking Break',     ''],
    ['11:00', '12:30', 'session',      'Parallel Technical Sessions',   ''],
    ['12:30', '14:00', 'lunch',        'Lunch & Networking',            ''],
    ['14:00', '15:00', 'plenary',      'Plenary Session',               ''],
    ['15:00', '17:00', 'session',      'Parallel Technical Sessions',   ''],
    ['17:00', '19:00', 'poster',       'Poster Session',                ''],
    ['19:00', '21:00', 'reception',    'Welcome Reception',             ''],
  ],
  2: [
    ['08:30', '09:00', 'registration', 'Registration continues',        ''],
    ['09:00', '10:00', 'keynote',      'Morning Keynote',               ''],
    ['10:00', '11:30', 'session',      'Parallel Technical Sessions',   ''],
    ['11:30', '12:00', 'break',        'Coffee & Networking',           ''],
    ['12:00', '13:00', 'panel',        'Industry Panel Discussion',     ''],
    ['13:00', '14:30', 'lunch',        'Lunch',                         ''],
    ['14:30', '15:30', 'plenary',      'Plenary Session',               ''],
    ['15:30', '16:30', 'session',      'Closing Technical Sessions',    ''],
    ['16:30', '17:30', 'award',        'Awards Ceremony',               ''],
    ['17:30', '18:00', 'ceremony',     'Closing Ceremony',              ''],
    ['18:30', '21:30', 'gala',         'Conference Gala Dinner',        ''],
  ],
};

function deriveDayInfo(): Record<number, { weekday: string; date: string; month: string }> {
  // Pull two consecutive dates from conf.dates (e.g. "March 15-16, 2027").
  const m = conf.dates.match(/(\w+)\s+(\d+)-(\d+),\s*(\d+)/);
  const month = m?.[1] ?? 'March';
  const d1 = m?.[2] ?? '15';
  const d2 = m?.[3] ?? '16';
  const yr = parseInt(m?.[4] ?? '2027', 10);
  const weekday = (date: string) => {
    try {
      const monthIdx = ['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(month);
      if (monthIdx < 0) return '';
      return new Date(yr, monthIdx, parseInt(date, 10)).toLocaleDateString('en-US', { weekday: 'long' });
    } catch { return ''; }
  };
  return {
    1: { weekday: weekday(d1), date: d1, month },
    2: { weekday: weekday(d2), date: d2, month },
  };
}

export default function ProgramSchedule() {
  const [day, setDay] = useState<1 | 2>(1);
  const items = PROGRAM[day];
  const DAY_INFO = deriveDayInfo();

  const keyPlen = items.filter(r => r[2] === 'keynote' || r[2] === 'plenary').length;
  const tech = items.filter(r => r[2] === 'session').length;
  const other = items.filter(r => ['poster', 'workshop', 'panel', 'award'].includes(r[2])).length;

  return (
    <>
      <div className="day-tabs">
        {([1, 2] as const).map(d => {
          const info = DAY_INFO[d];
          return (
            <button key={d} className={`day-tab${day === d ? ' active' : ''}`} onClick={() => setDay(d)}>
              <span className="day-tab-weekday">{info.weekday}</span>
              <span className="day-tab-date">{info.date}</span>
              <span className="day-tab-month">{info.month} · Day {d}</span>
            </button>
          );
        })}
      </div>

      <div className="program-day">
        <div className="program-day-summary">
          <div><strong>{keyPlen}</strong> keynote / plenary</div>
          <div><strong>{tech}</strong> technical sessions</div>
          <div><strong>{other}</strong> other events</div>
        </div>
        <div className="schedule-list">
          {items.map((row, i) => (
            <div key={i} className={`sched-row sched-${row[2]}`}>
              <div className="sched-time">
                <strong>{row[0]}</strong>
                <span>→ {row[1]}</span>
              </div>
              <div className="sched-body">
                <span className={`sched-type sched-type-${row[2]}`}>{TYPE_LABELS[row[2]]}</span>
                <h4>{row[3]}</h4>
                {row[4] && <div className="sched-speaker">{row[4]}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
