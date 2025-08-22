interface RatingBarProps {
  value: number; // 20–80
}

const getColor = (value: number) => {
  if (value >= 70) return 'bg-green-600';
  if (value >= 60) return 'bg-green-500';
  if (value >= 50) return 'bg-yellow-400';
  if (value >= 40) return 'bg-orange-400';
  return 'bg-red-500';
};

export const RatingBar = ({ value }: RatingBarProps) => {
  const width = ((value - 20) / 60) * 100; // map 20–80 to 0–100%

  return (
    <div className="w-full h-4 bg-neutral-200 dark:bg-neutral-800 rounded">
      <div
        className={`h-full rounded ${getColor(value)}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};
