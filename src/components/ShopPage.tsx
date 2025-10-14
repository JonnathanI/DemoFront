import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/authStore';
import { fetchAllCosmetics, fetchAllAdvantages, buyCosmetic, buyAdvantage } from '../services/storeService';
// 💡 Mantenemos el nombre original de tu función
import { getUserPoints } from '../services/authService'; 
import { type Advantage, type Cosmetic, type UserPointsResponse } from '../types/store'; 
import { FaGem, FaRedo, FaTrash, FaStar } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';

const ShopPage: React.FC = () => {
    const { user, token } = useAuthStore();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'cosmetics' | 'advantages'>('cosmetics');
    const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
    const [advantages, setAdvantages] = useState<Advantage[]>([]);
    const [userPoints, setUserPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Carga de Datos y Puntos ---
    const loadStoreData = async () => {
        if (!user || !token) {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Carga simultánea de puntos y ítems
            const [pointsData, cosmeticsData, advantagesData] = await Promise.all([
                // 💡 Usamos getUserPoints y accedemos a .totalPoints
                getUserPoints(user.id, token), 
                fetchAllCosmetics(token),
                fetchAllAdvantages(token)
            ]);

            //setUserPoints(pointsData.);
            setCosmetics(cosmeticsData);
            setAdvantages(advantagesData);

        } catch (e: any) {
            console.error("Error al cargar la tienda:", e);
            setError("Fallo al cargar la tienda o tus puntos. Revisa tu conexión y permisos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStoreData();
    }, [user, token]);

    // --- Manejadores de Compra ---
    const handleBuy = async (itemId: number, cost: number, itemType: 'cosmetic' | 'advantage') => {
        if (!user || !token || loading) return;

        if (userPoints < cost) {
            alert("¡Puntos insuficientes! Necesitas más puntos para esta compra.");
            return;
        }

        setLoading(true);
        try {
            if (itemType === 'cosmetic') {
                await buyCosmetic(user.id, itemId, token);
            } else {
                await buyAdvantage(user.id, itemId, token);
            }

            // Recargar puntos y datos de la tienda para reflejar el cambio
            await loadStoreData();
            alert(`¡Compra exitosa! Has gastado ${cost} puntos.`);
            
        } catch (e: any) {
            console.error(`Error al comprar ${itemType}:`, e);
            alert(`Error al realizar la compra: ${e.message || 'Inténtalo de nuevo.'}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Componente de Tarjeta de Ítem (Cosméticos) ---
    const CosmeticCard: React.FC<{ item: Cosmetic }> = ({ item }) => (
        <div className="bg-white p-5 rounded-xl shadow-lg border-b-4 border-indigo-400 flex flex-col items-center transform hover:scale-[1.02] transition duration-300">
            <span className="text-5xl mb-3">
                {item.type === 'Avatar' ? '👤' : item.type === 'Fondo' ? '🖼️' : '🌟'}
            </span>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{item.type}</p>
            
            {/* Botón de Compra */}
            <button
                onClick={() => handleBuy(item.id, item.pointCost, 'cosmetic')}
                disabled={loading || userPoints < item.pointCost}
                className={`
                    mt-auto w-full py-2 rounded-full font-semibold transition duration-200
                    ${userPoints >= item.pointCost 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }
                `}
            >
                <div className="flex items-center justify-center">
                    <FaGem className="mr-2 text-yellow-300" />
                    {item.pointCost} Puntos
                </div>
            </button>
        </div>
    );

    // --- Componente de Tarjeta de Ítem (Ventajas) ---
    const AdvantageCard: React.FC<{ item: Advantage }> = ({ item }) => (
        <div className="bg-white p-5 rounded-xl shadow-lg border-b-4 border-teal-400 flex flex-col justify-between h-full transform hover:scale-[1.02] transition duration-300">
            <div>
                <span className="text-4xl mb-3 block">
                    {item.effect.includes('Time') ? <FaRedo className="text-teal-500" /> : <FaTrash className="text-orange-500" />}
                </span>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
            </div>
            
            {/* Botón de Compra */}
            <button
                onClick={() => handleBuy(item.id, item.pointCost, 'advantage')}
                disabled={loading || userPoints < item.pointCost}
                className={`
                    mt-4 w-full py-2 rounded-full font-semibold transition duration-200
                    ${userPoints >= item.pointCost 
                        ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }
                `}
            >
                 <div className="flex items-center justify-center">
                    <FaGem className="mr-2 text-yellow-300" />
                    {item.pointCost} Puntos
                </div>
            </button>
        </div>
    );

    // --- Renderizado de Contenido Principal ---
    
    if (!user) return null; 

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar /> 

            <main className="flex-grow p-6 sm:p-10 flex flex-col items-center">
                <div className="w-full max-w-5xl">
                    
                    {/* Header de la Tienda y Puntos */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-lg mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-800">
                            Tienda de Ítems 🛒
                        </h1>
                        <div className="flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold text-lg border-2 border-yellow-500">
                            <FaStar className="mr-2 text-yellow-500" />
                            Puntos: {userPoints.toLocaleString()}
                        </div>
                    </div>

                    {/* Manejo de Pestañas */}
                    <div className="flex border-b border-gray-200 mb-8">
                        <button
                            onClick={() => setActiveTab('cosmetics')}
                            className={`px-6 py-3 text-lg font-semibold transition-colors duration-200 ${
                                activeTab === 'cosmetics' 
                                ? 'border-b-4 border-indigo-600 text-indigo-600' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Cosméticos
                        </button>
                        <button
                            onClick={() => setActiveTab('advantages')}
                            className={`px-6 py-3 text-lg font-semibold transition-colors duration-200 ${
                                activeTab === 'advantages' 
                                ? 'border-b-4 border-teal-600 text-teal-600' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Ventajas
                        </button>
                    </div>

                    {/* Contenido de la Pestaña */}
                    {loading && (
                        <div className="text-center p-10 text-gray-500">
                            Cargando ítems...
                        </div>
                    )}
                    
                    {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                    {!loading && activeTab === 'cosmetics' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {cosmetics.map(item => <CosmeticCard key={item.id} item={item} />)}
                            {cosmetics.length === 0 && <p className="col-span-full text-center text-gray-500">No hay cosméticos disponibles en este momento.</p>}
                        </div>
                    )}

                    {!loading && activeTab === 'advantages' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {advantages.map(item => <AdvantageCard key={item.id} item={item} />)}
                            {advantages.length === 0 && <p className="col-span-full text-center text-gray-500">No hay ventajas disponibles en este momento.</p>}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ShopPage;