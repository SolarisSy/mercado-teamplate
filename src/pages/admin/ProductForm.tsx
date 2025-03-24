import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import customFetch from '../../axios/custom';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';
import { HiPlus, HiX } from 'react-icons/hi';
import { Product, ProductImage } from '../../types/product';
import { uploadImages, validateImageUrl } from '../../services/imageService';
import { useCategories } from '../../context/CategoryContext';
import { isValidImageUrl, isImageUrl, isPlaceholderUrl } from '../../utils/imageHelpers';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const { categories, loading: loadingCategories } = useCategories();
  
  // Basic product info
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [stock, setStock] = React.useState('');
  const [popularity, setPopularity] = React.useState('0');
  const [featured, setFeatured] = React.useState(true);
  
  // Supermercado specific fields
  const [weight, setWeight] = React.useState('');
  const [unit, setUnit] = React.useState('unidade');
  const [brand, setBrand] = React.useState('');
  const [isOrganic, setIsOrganic] = React.useState(false);
  const [expiryDate, setExpiryDate] = React.useState('');
  const [origin, setOrigin] = React.useState('');
  const [discount, setDiscount] = React.useState('0');
  
  // Nutritional Info
  const [calories, setCalories] = React.useState('');
  const [protein, setProtein] = React.useState('');
  const [carbs, setCarbs] = React.useState('');
  const [fat, setFat] = React.useState('');
  const [sodium, setSodium] = React.useState('');
  
  // Images
  const [images, setImages] = React.useState<ProductImage[]>([]);
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = React.useState(0);
  const [imageUrl, setImageUrl] = React.useState('');
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch product data if in edit mode
  React.useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const response = await customFetch.get(`/products/${id}`);
          const product = response.data as Product;
          
          // Set basic info
          setTitle(product.title);
          setDescription(product.description || '');
          setCategory(product.category);
          setPrice(String(product.price));
          setStock(String(product.stock));
          setPopularity(String(product.popularity || 0));
          setFeatured(product.featured || false);
          
          // Set supermercado specific fields
          if (product.weight) setWeight(String(product.weight));
          if (product.unit) setUnit(product.unit);
          if (product.brand) setBrand(product.brand);
          if (product.isOrganic !== undefined) setIsOrganic(product.isOrganic);
          if (product.expiryDate) setExpiryDate(product.expiryDate);
          if (product.origin) setOrigin(product.origin);
          if (product.discount) setDiscount(String(product.discount));
          
          // Set nutritional info
          if (product.nutritionalInfo) {
            if (product.nutritionalInfo.calories !== undefined) 
              setCalories(String(product.nutritionalInfo.calories));
            if (product.nutritionalInfo.protein !== undefined) 
              setProtein(String(product.nutritionalInfo.protein));
            if (product.nutritionalInfo.carbs !== undefined) 
              setCarbs(String(product.nutritionalInfo.carbs));
            if (product.nutritionalInfo.fat !== undefined) 
              setFat(String(product.nutritionalInfo.fat));
            if (product.nutritionalInfo.sodium !== undefined) 
              setSodium(String(product.nutritionalInfo.sodium));
          }
          
          // Set images if they exist in the expanded format
          if (product.images && Array.isArray(product.images)) {
            setImages(product.images);
            setPrimaryImageIndex(product.images.findIndex((img: ProductImage) => img.isPrimary) || 0);
          } else if (product.image) {
            // Handle legacy format with single image
            setImages([{ 
              id: nanoid(), 
              url: product.image, 
              isPrimary: true 
            }]);
          }
        } catch (error) {
          toast.error('Failed to fetch product');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Create preview URLs for immediate display
      const newImages = newFiles.map(file => ({
        id: nanoid(),
        url: URL.createObjectURL(file),
        isPrimary: false
      }));
      
      if (images.length === 0 && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      
      setImages(prev => [...prev, ...newImages]);
      setImageFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleAddImageUrl = async () => {
    if (!imageUrl.trim()) {
      toast.error('Por favor, informe uma URL de imagem válida');
      return;
    }
    
    // Validar se parece ser uma URL
    try {
      new URL(imageUrl);
      
      // Adicionar indicador de carregamento
      const loadingToast = toast.loading('Verificando URL da imagem...');
      
      try {
        // Validar se a URL da imagem é acessível e válida
        await validateImageUrl(imageUrl);
        
        const newImage = {
          id: nanoid(),
          url: imageUrl,
          isPrimary: images.length === 0 // Se for a primeira imagem, será a principal
        };
        
        setImages(prev => [...prev, newImage]);
        setImageUrl(''); // Limpar o campo após adicionar
        toast.dismiss(loadingToast);
        toast.success('Imagem adicionada com sucesso');
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('URL de imagem inacessível ou inválida. Verifique se a URL leva diretamente a uma imagem.');
      }
    } catch (e) {
      toast.error('URL inválida. Por favor, forneça uma URL completa (começando com http:// ou https://)');
    }
  };

  const handleRemoveImage = (index: number) => {
    // If removing the primary image, set another one as primary
    if (images[index].isPrimary && images.length > 1) {
      const newImages = [...images];
      newImages.splice(index, 1);
      newImages[0].isPrimary = true;
      setImages(newImages);
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
    
    // Also remove from files array if it exists
    if (index < imageFiles.length) {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({ 
      ...img, 
      isPrimary: i === index 
    }));
    setImages(newImages);
    setPrimaryImageIndex(index);
    toast.success('Imagem principal definida com sucesso');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validar campos obrigatórios
      if (!title.trim()) {
        toast.error('O título do produto é obrigatório');
        return;
      }
      
      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        toast.error('O preço deve ser um número válido maior que zero');
        return;
      }
      
      if (!category.trim()) {
        toast.error('A categoria é obrigatória');
        return;
      }
      
      // Validar imagens
      if (images.length === 0) {
        toast.error('É necessário pelo menos uma imagem para o produto');
        return;
      }
      
      // Verificar se há uma imagem primária definida
      const hasPrimaryImage = images.some(img => img.isPrimary);
      if (!hasPrimaryImage) {
        // Se não houver imagem primária, definir a primeira como primária
        const updatedImages = [...images];
        updatedImages[0].isPrimary = true;
        setImages(updatedImages);
      }
      
      // Validar URLs das imagens
      const invalidImages = images.filter(img => !img.url || !isValidImageUrl(img.url) || !isImageUrl(img.url));
      if (invalidImages.length > 0) {
        toast.error('Uma ou mais URLs de imagem são inválidas');
        return;
      }
      
      // Build the product object
      const productData = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        popularity: parseInt(popularity, 10) || 0,
        featured,
        image: images.find(img => img.isPrimary)?.url || images[0].url,
        images: images.map(img => ({
          url: img.url,
          isPrimary: img.isPrimary
        })),
        weight: weight ? parseFloat(weight) : undefined,
        unit: unit.trim(),
        brand: brand.trim() || undefined,
        isOrganic,
        expiryDate: expiryDate || undefined,
        origin: origin.trim() || undefined,
        discount: discount ? parseFloat(discount) : undefined,
        nutritionalInfo: {
          calories: calories ? parseFloat(calories) : undefined,
          protein: protein ? parseFloat(protein) : undefined,
          carbs: carbs ? parseFloat(carbs) : undefined,
          fat: fat ? parseFloat(fat) : undefined,
          sodium: sodium ? parseFloat(sodium) : undefined
        }
      };
      
      // Remover campos undefined
      Object.keys(productData).forEach(key => {
        if (productData[key] === undefined) {
          delete productData[key];
        }
      });
      
      if (productData.nutritionalInfo) {
        Object.keys(productData.nutritionalInfo).forEach(key => {
          if (productData.nutritionalInfo[key] === undefined) {
            delete productData.nutritionalInfo[key];
          }
        });
        
        // Se não houver informações nutricionais, remover o objeto
        if (Object.keys(productData.nutritionalInfo).length === 0) {
          delete productData.nutritionalInfo;
        }
      }
      
      let response;
      if (isEditMode) {
        response = await customFetch.put(`/products/${id}`, productData);
        if (response.status === 200) {
          toast.success('Produto atualizado com sucesso');
        } else {
          throw new Error('Falha ao atualizar produto');
        }
      } else {
        response = await customFetch.post('/products', productData);
        if (response.status === 201) {
          toast.success('Produto criado com sucesso');
        } else {
          throw new Error('Falha ao criar produto');
        }
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      
      if (error.response) {
        // Erro da API
        const message = error.response.data?.message || 'Erro desconhecido do servidor';
        toast.error(`Falha ao ${isEditMode ? 'atualizar' : 'criar'} produto: ${message}`);
      } else if (error.request) {
        // Erro de rede
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        // Outros erros
        toast.error(error.message || 'Erro desconhecido ao processar sua requisição');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="title">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="category">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {!loadingCategories && categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="price">
                Price (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="stock">
                Stock Quantity
              </label>
              <input
                type="number"
                id="stock"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="popularity">
                Popularity (0-100)
              </label>
              <input
                type="number"
                id="popularity"
                min="0"
                max="100"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={popularity}
                onChange={(e) => setPopularity(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="discount">
                Discount (%)
              </label>
              <input
                type="number"
                id="discount"
                min="0"
                max="100"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            
            <div className="flex items-center mt-5">
              <input
                type="checkbox"
                id="featured"
                className="mr-2"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <label htmlFor="featured">Featured Product</label>
            </div>
            
            <div className="flex items-center mt-5">
              <input
                type="checkbox"
                id="isOrganic"
                className="mr-2"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
              />
              <label htmlFor="isOrganic">Organic Product</label>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-gray-700 mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="weight">
                Weight/Volume
              </label>
              <input
                type="number"
                id="weight"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="unit">
                Unit
              </label>
              <select
                id="unit"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                {["unidade", "kg", "g", "ml", "l", "pacote", "caixa"].map((unitOption) => (
                  <option key={unitOption} value={unitOption}>
                    {unitOption}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="brand">
                Brand
              </label>
              <input
                type="text"
                id="brand"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="origin">
                Origin
              </label>
              <input
                type="text"
                id="origin"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="expiryDate">
                Expiry Date
              </label>
              <input
                type="date"
                id="expiryDate"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Nutritional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="calories">
                Calories (kcal)
              </label>
              <input
                type="number"
                id="calories"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="protein">
                Protein (g)
              </label>
              <input
                type="number"
                id="protein"
                step="0.1"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="carbs">
                Carbs (g)
              </label>
              <input
                type="number"
                id="carbs"
                step="0.1"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="fat">
                Fat (g)
              </label>
              <input
                type="number"
                id="fat"
                step="0.1"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="sodium">
                Sodium (mg)
              </label>
              <input
                type="number"
                id="sodium"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={sodium}
                onChange={(e) => setSodium(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Product Images</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">
              Upload de Imagem <span className="text-gray-500">(A primeira imagem será a principal)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
              onChange={handleImageUpload}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">
              Adicionar Imagem por URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                className="border border-gray-300 rounded-md px-3 py-2 flex-grow"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <HiPlus className="inline mr-1" /> Adicionar
              </button>
            </div>
          </div>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {images.map((img, index) => (
                <div key={img.id} className="relative group bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={img.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      // Tratamento para imagens quebradas
                      (e.target as HTMLImageElement).src = '/img/placeholder-product.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className={`p-2 rounded-full ${
                        img.isPrimary ? 'bg-green-500' : 'bg-gray-700'
                      } text-white`}
                      onClick={() => handleSetPrimaryImage(index)}
                      title={img.isPrimary ? 'Imagem Principal' : 'Definir como Principal'}
                    >
                      {img.isPrimary ? 'Principal' : 'Definir como Principal'}
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full bg-red-600 text-white"
                      onClick={() => handleRemoveImage(index)}
                      title="Remover Imagem"
                    >
                      <HiX />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 bg-gray-300 rounded-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : isEditMode ? 'Atualizar Produto' : 'Criar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 