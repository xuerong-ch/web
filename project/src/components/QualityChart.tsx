import { PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CarListing, qualityMapping, qualityColors } from '../types';

interface QualityChartProps {
  data: CarListing[];
}

export function QualityChart({ data }: QualityChartProps) {
  const qualityCount = data.reduce((acc, item) => {
    if (!item.CALIDAD) return acc;
    const mappedQuality = qualityMapping[item.CALIDAD] || item.CALIDAD;
    acc[mappedQuality] = (acc[mappedQuality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(qualityCount)
    .filter(([quality]) => quality !== 'No especificado')
    .map(([name, value]) => ({
      name,
      value
    }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Distribución de Calidad (Gráfico Circular)</h2>
        <PieChart width={400} height={300}>
          <Pie
            data={chartData}
            cx={200}
            cy={150}
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell 
                key={`cell-${entry.name}`} 
                fill={qualityColors[entry.name]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Distribución de Calidad (Gráfico de Barras)</h2>
        <BarChart width={400} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value">
            {chartData.map((entry) => (
              <Cell 
                key={`cell-${entry.name}`} 
                fill={qualityColors[entry.name]}
              />
            ))}
          </Bar>
        </BarChart>
      </div>
    </div>
  );
}