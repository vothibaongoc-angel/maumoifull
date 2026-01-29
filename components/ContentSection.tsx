
import React, { useState, useEffect } from 'react';
import { CategoryType, ContentData } from '../types';
import { fetchEducationalContent, generateImage } from '../services/geminiService';
import { Loader2 } from 'lucide-react';

interface Props {
  type: CategoryType;
}

const ContentSection: React.FC<Props> = ({ type }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ContentData | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchEducationalContent(type);
        setData(result);
        const img = await generateImage(result.imagePrompt);
        setImageUrl(img);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [type]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {imageUrl && <img src={imageUrl} alt={data?.title} className="w-full h-48 sm:h-64 object-cover" />}
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-4 text-gray-900">{data?.title}</h3>
        <p className="text-gray-600 italic mb-6 leading-relaxed border-l-4 border-blue-200 pl-4">{data?.summary}</p>
        <div className="text-gray-800 leading-relaxed whitespace-pre-line text-lg mb-8">
          {data?.content}
        </div>
        {data?.lessons && data.lessons.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold text-blue-800 mb-2">Bài học:</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {data.lessons.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentSection;
