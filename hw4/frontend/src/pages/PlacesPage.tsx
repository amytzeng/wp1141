import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Place } from '../types';
import { getPlaces, deletePlace, updatePlace } from '../api/places';
import { Map, ArrowLeft, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PlaceForm from '../components/PlaceForm';

export default function PlacesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      const data = await getPlaces();
      setPlaces(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
      toast.error('載入地點失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('確定要刪除這個地點嗎？')) return;

    try {
      await deletePlace(id);
      setPlaces(places.filter(p => p.id !== id));
      toast.success('地點刪除成功！');
    } catch (error) {
      toast.error('刪除地點失敗');
    }
  };

  const handleUpdate = async (data: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingPlace) return;

    try {
      const updatedPlace = await updatePlace(editingPlace.id, data);
      setPlaces(places.map(p => p.id === editingPlace.id ? updatedPlace : p));
      setEditingPlace(null);
      toast.success('地點更新成功！');
    } catch (error) {
      toast.error('更新地點失敗');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">載入中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/map" className="text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">我的地點</h1>
          </div>
          <span className="text-gray-600">{user?.email}</span>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {places.length === 0 ? (
          <div className="text-center py-12">
            <Map className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">還沒有地點，去地圖上新增一些吧！</p>
            <Link
              to="/map"
              className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              前往地圖
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <div key={place.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{place.title}</h3>
                    {place.category && (
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {place.category}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPlace(place)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(place.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {place.description && (
                  <p className="text-gray-600 text-sm mb-3">{place.description}</p>
                )}
                {place.address && (
                  <p className="text-gray-500 text-xs mb-2">📍 {place.address}</p>
                )}
                <p className="text-gray-500 text-xs">
                  座標: {place.lat.toFixed(6)}, {place.lng.toFixed(6)}
                </p>
              </div>
            ))}
          </div>
        )}

        {editingPlace && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <PlaceForm
                place={editingPlace}
                onSubmit={handleUpdate}
                onCancel={() => setEditingPlace(null)}
                onDelete={() => {
                  handleDelete(editingPlace.id);
                  setEditingPlace(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
