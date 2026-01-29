
import React, { useState, useEffect } from 'react';
import { MovementData } from '../types';
import { fetchMovements } from '../services/geminiService';
import { Loader2 } from 'lucide-react';

const MovementSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState<MovementData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMovements();
        setMovements(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-2" />
        <p className="text-gray-500 font-medium">Đang tải danh sách phong trào...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {movements.map((m, idx) => (
        <div key={idx} className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm hover:border-green-300 transition-colors">
          <h3 className="text-xl font-bold text-green-800 mb-2">{m.name}</h3>
          <p className="text-gray-600 mb-3">{m.description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {m.activities.map((a, i) => (
              <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded">
                {a}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500 italic"><span className="font-bold">Ý nghĩa:</span> {m.impact}</p>
        </div>
      ))}
    </div>
  );
};

export default MovementSection;
