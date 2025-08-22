interface RatingRingProps {
  value: number; // 20–80, step 5
  size?: number; // px size of the ring (optional)
  fontSize?: string; // 👈 NEW: optional text size, like '0.8rem'
}

const getColor = (value: number) => {
  if (value >= 70) return 'stroke-green-600 text-green-600';
  if (value >= 60) return 'stroke-green-500 text-green-500';
  if (value >= 50) return 'stroke-yellow-500 text-yellow-500';
  if (value >= 40) return 'stroke-orange-400 text-orange-400';
  return 'stroke-red-500 text-red-500';
};

export const RatingRing = ({
  value,
  size = 54,
  fontSize = '1.3rem', // 👈 Default value if not passed
}: RatingRingProps) => {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.max(0, Math.min(1, (value - 20) / 60)); // 0 to 1
  const offset = circumference * (1 - percent);
  const color = getColor(value);

  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth="4"
        className="stroke-neutral-300 dark:stroke-neutral-700"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth="4"
        className={`${color} transition-all duration-300`}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize }} // 👈 Use fontSize prop
        className={`font-semibold ${color}`}
        fill="currentColor"
      >
        {value}
      </text>
    </svg>
  );
};
