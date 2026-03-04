"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";

const COLORS = {
  up: "#4fd3ff",
  down: "#ff6a2d",
};

export type CryptoChartPoint = {
  name: string;
  change: number;
  price: number;
};

export default function CryptoChart({ data }: { data: CryptoChartPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={32} margin={{ left: 8, right: 16 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.6)"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.4)"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value.toFixed(0)}%`}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "rgba(9,12,24,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "#fff",
            }}
            formatter={(value: number) => `${value.toFixed(2)}%`}
          />
          <Bar
            dataKey="change"
            radius={[10, 10, 10, 10]}
            isAnimationActive
            animationDuration={800}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.change >= 0 ? COLORS.up : COLORS.down}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
