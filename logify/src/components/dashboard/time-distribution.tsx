import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface TimeDistributionProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export function TimeDistribution({ data }: TimeDistributionProps) {
  console.log('Rendering with data:', data);
  
  return (
    <div className="w-full min-h-[400px] border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Time Distribution</h2>
      <div className="flex justify-center">
        <PieChart width={400} height={300}>
          <Pie
            data={data}
            cx={200}
            cy={150}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}