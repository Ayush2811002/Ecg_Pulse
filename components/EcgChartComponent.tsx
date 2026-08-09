"use client";

import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface ECGChartProps {
  data: number[];
  sampleRate?: number; // samples per second
  windowSeconds?: number; // width of sliding window in seconds
}

export default function ECGChart({
  data,
  sampleRate = 250,
  windowSeconds = 10,
}: ECGChartProps) {
  // If incoming data length is less than full window, stretch it across
  // the horizontal axis so the trace doesn't stick to the right side.
  const chartData = data.length
    ? data.map((value, index) => {
        const seconds =
          data.length > 1
            ? (index / (data.length - 1)) * windowSeconds
            : windowSeconds; // single point placed at the right edge
        return { seconds, value };
      })
    : [];

  const values = chartData.map((item) => item.value);
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 1000;
  const range = Math.max(50, maxValue - minValue);
  const padding = range * 0.1;
  const gridStyle: React.CSSProperties = {
    // ECG-like pink paper: fine grid (1mm) and thicker 5mm lines
    backgroundImage: `
      linear-gradient(to right, rgba(220,38,38,0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(220,38,38,0.06) 1px, transparent 1px),
      linear-gradient(to right, rgba(220,38,38,0.14) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(220,38,38,0.14) 1px, transparent 1px)
    `,
    backgroundSize: "6px 6px, 6px 6px, 30px 30px, 30px 30px",
    backgroundPosition: "0 0, 0 0, 0 0, 0 0",
  };

  return (
    <div className="w-full h-full" style={gridStyle}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 44, bottom: 8 }}
        >
          <XAxis
            dataKey="seconds"
            type="number"
            domain={[0, windowSeconds]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickFormatter={(v) => `${Math.round(Number(v))}`}
            interval={0}
            allowDataOverflow
          />
          <YAxis
            width={44}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            domain={[minValue - padding, maxValue + padding]}
            tickCount={5}
            allowDataOverflow
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#16a34a"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
