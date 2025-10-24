import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">GitFlow AI Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Conflicts Avoided" value="127" change="+12%" positive />
        <MetricCard title="Time Saved" value="38.5 hrs" change="+8%" positive />
        <MetricCard title="Cost Savings" value="$2,887" change="+15%" positive />
        <MetricCard title="Prediction Accuracy" value="87.3%" change="+2%" positive />
      </div>

      <div className="bg-slate-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">ROI Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Legend />
            <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="conflicts" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Identified Bottlenecks</h2>
        <div className="space-y-4">
          <BottleneckItem
            title="Long PR Review Times"
            impact="high"
            cost="$1,245/mo"
            description="Average PR review time is 6.2 hours"
          />
          <BottleneckItem
            title="Merge Conflicts"
            impact="medium"
            cost="$892/mo"
            description="18% of PRs encounter merge conflicts"
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, positive }: any) {
  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className={`text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {change} from last month
      </p>
    </div>
  );
}

function BottleneckItem({ title, impact, cost, description }: any) {
  const impactColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className="border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-mono">{cost}</span>
          <span className={`px-2 py-1 rounded text-xs ${impactColors[impact as keyof typeof impactColors]} text-white`}>
            {impact.toUpperCase()}
          </span>
        </div>
      </div>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

const mockData = [
  { date: 'Jan', savings: 2400, conflicts: 45 },
  { date: 'Feb', savings: 3200, conflicts: 38 },
  { date: 'Mar', savings: 2800, conflicts: 42 },
  { date: 'Apr', savings: 3600, conflicts: 32 },
  { date: 'May', savings: 4200, conflicts: 28 },
  { date: 'Jun', savings: 3800, conflicts: 35 },
];
