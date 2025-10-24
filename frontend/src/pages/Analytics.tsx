import { useParams } from 'react-router-dom';

export default function Analytics() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Repository Analytics</h1>
      <p className="text-slate-400">Repository ID: {id}</p>
    </div>
  );
}
