import { useState, useEffect } from 'react';
import type { Place } from '../types';

interface PlaceFormProps {
  place?: Place;
  initialPosition?: { lat: number; lng: number } | null;
  onSubmit: (data: Omit<Place, 'id' | 'createdAt' | 'updatedAt'> | Partial<Place>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function PlaceForm({ place, initialPosition, onSubmit, onCancel, onDelete }: PlaceFormProps) {
  const [title, setTitle] = useState(place?.title || '');
  const [description, setDescription] = useState(place?.description || '');
  const [category, setCategory] = useState(place?.category || '');
  const [lat, setLat] = useState(place?.lat || initialPosition?.lat || 0);
  const [lng, setLng] = useState(place?.lng || initialPosition?.lng || 0);
  const [address, setAddress] = useState(place?.address || '');

  useEffect(() => {
    if (initialPosition) {
      setLat(initialPosition.lat);
      setLng(initialPosition.lng);
    }
  }, [initialPosition]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      category,
      lat,
      lng,
      address,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">{place ? '編輯地點' : '新增地點'}</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">標題 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="地點名稱"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="地點描述"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選擇分類</option>
          <option value="餐廳">餐廳</option>
          <option value="景點">景點</option>
          <option value="住宿">住宿</option>
          <option value="購物">購物</option>
          <option value="其他">其他</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">緯度</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(parseFloat(e.target.value))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">經度</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(parseFloat(e.target.value))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="地址"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {place ? '更新' : '新增'}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            刪除
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
        >
          取消
        </button>
      </div>
    </form>
  );
}
