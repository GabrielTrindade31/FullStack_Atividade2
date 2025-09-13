import React from "react";

type Props = {
  value: number | string;
  unit: string;
};

export default function ResultRow({ value, unit }: Props) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-5xl font-extrabold text-indigo-600">{value}</span>
      <span className="text-xl font-medium text-gray-700">{unit}</span>
    </div>
  );
}
