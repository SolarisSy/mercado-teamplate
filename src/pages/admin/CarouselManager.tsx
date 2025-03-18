import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import customFetch from "../../utils/customFetch";

const CarouselManager = () => {
  const [banners, setBanners] = useState<CarouselBanner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentBanner, setCurrentBanner] = useState<CarouselBanner | null>(null);
  const [formData, setFormData] = useState<Omit<CarouselBanner, 'id' | 'createdAt' | 'updatedAt'>>({
    title: "",
    description: "",
    image: "",
    link: "",
    active: true,
    order: 0
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await customFetch.get("/carousel");
      setBanners(response.data || []);
    } catch (error) {
      toast.error("Erro ao carregar banners");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentBanner) {
        await customFetch.put(`/carousel/${currentBanner.id}`, formData);
        toast.success("Banner atualizado com sucesso!");
      } else {
        await customFetch.post("/carousel", formData);
        toast.success("Banner adicionado com sucesso!");
      }
      resetForm();
      fetchBanners();
    } catch (error) {
      toast.error("Erro ao salvar banner");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este banner?")) {
      try {
        await customFetch.delete(`/carousel/${id}`);
        toast.success("Banner removido com sucesso!");
        fetchBanners();
      } catch (error) {
        toast.error("Erro ao remover banner");
        console.error(error);
      }
    }
  };

  const toggleBannerStatus = async (banner: CarouselBanner) => {
    try {
      await customFetch.put(`/carousel/${banner.id}`, { 
        ...banner, 
        active: !banner.active 
      });
      toast.success(banner.active 
        ? "Banner desativado com sucesso!" 
        : "Banner ativado com sucesso!"
      );
      fetchBanners();
    } catch (error) {
      toast.error("Erro ao alterar status do banner");
      console.error(error);
    }
  };

  const editBanner = (banner: CarouselBanner) => {
    setCurrentBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      image: banner.image,
      link: banner.link,
      active: banner.active,
      order: banner.order || 0
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setCurrentBanner(null);
    setFormData({
      title: "",
      description: "",
      image: "",
      link: "",
      active: true,
      order: 0
    });
    setModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Gerenciar Banners do Carrossel</h1>
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center"
          onClick={() => setModalOpen(true)}
        >
          <FaPlus className="mr-2" /> Novo Banner
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="spinner"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-600">Nenhum banner cadastrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left">Imagem</th>
                <th className="py-3 px-4 text-left">Título</th>
                <th className="py-3 px-4 text-left">Link</th>
                <th className="py-3 px-4 text-left">Ordem</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <img 
                      src={banner.image} 
                      alt={banner.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="py-3 px-4">{banner.title}</td>
                  <td className="py-3 px-4">{banner.link}</td>
                  <td className="py-3 px-4">{banner.order || 0}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${banner.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                      {banner.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-3">
                      <button 
                        className="text-blue-600 hover:text-blue-800 bg-blue-100 p-2 rounded-full"
                        onClick={() => editBanner(banner)}
                        title="Editar"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 bg-red-100 p-2 rounded-full"
                        onClick={() => handleDelete(banner.id)}
                        title="Excluir"
                      >
                        <FaTrash size={16} />
                      </button>
                      <button 
                        className={`${banner.active ? 'text-yellow-600 hover:text-yellow-800 bg-yellow-100' : 'text-green-600 hover:text-green-800 bg-green-100'} p-2 rounded-full`}
                        onClick={() => toggleBannerStatus(banner)}
                        title={banner.active ? "Desativar" : "Ativar"}
                      >
                        {banner.active ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {currentBanner ? "Editar Banner" : "Novo Banner"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-1">Título</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Link (URL)</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Descrição</label>
                <textarea 
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-1">URL da Imagem</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Ordem</label>
                  <input 
                    type="number"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox"
                    className="mr-2"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  />
                  <span>Banner ativo</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarouselManager; 