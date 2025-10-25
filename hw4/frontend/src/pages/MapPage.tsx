import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Place } from '../types';
import { getPlaces, createPlace, updatePlace, deletePlace } from '../api/places';
import MapView from '../components/MapView';
import { MapPin, List, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function MapPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleAddPlace = async (placeData: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPlace = await createPlace(placeData);
      setPlaces([...places, newPlace]);
      toast.success('地點新增成功！');
    } catch (error) {
      toast.error('新增地點失敗');
    }
  };

  const handleUpdatePlace = async (id: string, placeData: Partial<Place>) => {
    try {
      const updatedPlace = await updatePlace(id, placeData);
      setPlaces(places.map(p => p.id === id ? updatedPlace : p));
      toast.success('地點更新成功！');
    } catch (error) {
      toast.error('更新地點失敗');
    }
  };

  const handleDeletePlace = async (id: string) => {
    try {
      await deletePlace(id);
      setPlaces(places.filter(p => p.id !== id));
      toast.success('地點刪除成功！');
    } catch (error) {
      toast.error('刪除地點失敗');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col">
      <header className="bg-white shadow-md flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <MapPin className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">我的地圖</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{user?.email}</span>
          <Link
            to="/places"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <List className="w-5 h-5" />
            <span>地點清單</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>登出</span>
          </button>
        </div>
      </header>
      <div className="flex-1 relative">
        <MapView
          places={places}
          onAddPlace={handleAddPlace}
          onUpdatePlace={handleUpdatePlace}
          onDeletePlace={handleDeletePlace}
        />
      </div>
    </div>
  );
}
