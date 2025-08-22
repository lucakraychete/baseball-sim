import { useMemo } from 'react';
import pitcherSilhouette from '@/assets/pitcher-silhouette.png';

interface ArmAngleDiagramProps {
  armAngle: number; // degrees
}

export const ArmAngleDiagram: React.FC<ArmAngleDiagramProps> = ({ armAngle }) => {
  // Adjust for where the shoulder is visually placed in the silhouette image
  const viewBoxWidth = 150;
  const viewBoxHeight = 200;
  const shoulderX = 95; // horizontal center
  const shoulderY = 65; // adjust to match silhouette's shoulder height
  const armLength = 50;

  // Calculate endpoint of arm based on angle
  const { endX, endY } = useMemo(() => {
    const angleRad = (armAngle - 90) * (Math.PI / 180); // rotate clockwise from vertical
    return {
      endX: shoulderX + armLength * Math.cos(angleRad),
      endY: shoulderY + armLength * Math.sin(angleRad),
    };
  }, [armAngle]);

  return (
    <div className="relative w-[150px] h-[200px]">
      {/* Silhouette Image */}
      <img
        src={pitcherSilhouette}
        alt="Pitcher Silhouette"
        className="absolute inset-0 w-full h-full object-contain opacity-90"
        draggable={false}
      />

      {/* SVG Overlay */}
      <svg
        className="absolute inset-0"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Arm line */}
        <line
          x1={shoulderX}
          y1={shoulderY}
          x2={endX}
          y2={endY}
          stroke="white"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Shoulder dot */}
        <circle cx={shoulderX} cy={shoulderY} r={4} fill="red" />
        {/* Hand dot */}
        <circle cx={endX} cy={endY} r={4} fill="red" />
      </svg>

      {/* Label */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xs text-sky-500 font-semibold tracking-wide">ARM ANGLE</div>
        <div className="text-white text-lg font-bold">{armAngle.toFixed(1)}°</div>
      </div>
    </div>
  );
};
