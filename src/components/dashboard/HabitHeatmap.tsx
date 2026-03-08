'use client';

import { useMemo } from 'react';

interface HabitHeatmapProps {
  data: { date: string; rate: number }[];
  onDayClick?: (date: string) => void;
}

function getColor(rate: number): string {
  if (rate === 0) return '#f0eef5';
  if (rate <= 25) return '#ddd6fe';
  if (rate <= 50) return '#c4b5fd';
  if (rate <= 75) return '#a78bfa';
  return '#0d9488';
}

export default function HabitHeatmap({ data, onDayClick }: HabitHeatmapProps) {
  // Organize data into 12 weeks x 7 days grid
  // Grid is column-major: each column is a week, rows are days (Mon-Sun)
  const grid = useMemo(() => {
    // Pad data to start on a Monday
    const firstDate = data.length > 0 ? new Date(data[0].date + 'T12:00:00') : new Date();
    const dayOfWeek = firstDate.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // We need to fill a 12-week grid (84 cells)
    const cells: { date: string; rate: number; isEmpty: boolean }[] = [];

    // Add empty cells for padding before first date
    for (let i = 0; i < mondayOffset; i++) {
      cells.push({ date: '', rate: 0, isEmpty: true });
    }

    // Add actual data
    for (const d of data) {
      cells.push({ date: d.date, rate: d.rate, isEmpty: false });
    }

    // Pad to fill last week
    while (cells.length % 7 !== 0) {
      cells.push({ date: '', rate: 0, isEmpty: true });
    }

    return cells;
  }, [data]);

  const weeks = useMemo(() => {
    const w: typeof grid[] = [];
    for (let i = 0; i < grid.length; i += 7) {
      w.push(grid.slice(i, i + 7));
    }
    return w;
  }, [grid]);

  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-1">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="flex h-3.5 w-4 items-center justify-center text-[9px] text-ofira-text-secondary"
            >
              {i % 2 === 0 ? label : ''}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell, di) => (
              <button
                key={di}
                type="button"
                disabled={cell.isEmpty}
                onClick={() => !cell.isEmpty && onDayClick?.(cell.date)}
                className={`h-3.5 w-3.5 rounded-sm transition-all ${
                  cell.isEmpty
                    ? 'cursor-default'
                    : 'cursor-pointer hover:ring-2 hover:ring-ofira-violet/30 hover:ring-offset-1'
                }`}
                style={{
                  backgroundColor: cell.isEmpty ? 'transparent' : getColor(cell.rate),
                }}
                title={cell.isEmpty ? '' : `${cell.date}: ${cell.rate}%`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <span className="text-[10px] text-ofira-text-secondary">Menos</span>
        {[0, 25, 50, 75, 100].map((rate) => (
          <div
            key={rate}
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: getColor(rate) }}
          />
        ))}
        <span className="text-[10px] text-ofira-text-secondary">Mas</span>
      </div>
    </div>
  );
}
