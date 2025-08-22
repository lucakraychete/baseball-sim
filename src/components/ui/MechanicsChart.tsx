import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface MechanicsChartProps {
  releaseHeight: number;
  extension: number;
  attackAngle: number;
  releaseConsistency: number;
  releaseDifferential: number;
  armSlotVariance: number;
}

export const MechanicsChart = ({
  releaseHeight,
  extension,
  attackAngle,
  releaseConsistency,
  releaseDifferential,
  armSlotVariance,
}: MechanicsChartProps) => {
  const data = [
    { stat: 'Rel. Height', value: releaseHeight, max: 7.5 },
    { stat: 'Extension', value: extension, max: 7.5 },
    { stat: 'Atk. Angle', value: attackAngle, max: 10 },
    { stat: 'Rel. Consist.', value: releaseConsistency, max: 80 },
    { stat: 'Rel. Diff.', value: releaseDifferential, max: 4.5 },
    { stat: 'Slot Var.', value: armSlotVariance, max: 6.5 },
  ];

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="#aaa" />
          <PolarAngleAxis dataKey="stat" />
          <Radar
            name="Mechanics"
            dataKey="value"
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
