"use client";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer } from "recharts";

interface Props {
  data: number[];
  type?: "area" | "bar";
  color?: string;
}

export function MiniChart({ data, type = "area", color = "#0e8a5b" }: Props) {
  const d = data.map((v) => ({ v }));
  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={36}>
        <BarChart data={d} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Bar dataKey="v" fill={color} radius={[2, 2, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={d} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Area type="monotone" dataKey="v" stroke={color} fill={`${color}20`} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
