import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import customFetch from '../../axios/custom';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';
import { HiPlus, HiX } from 'react-icons/hi';
import { Product, ProductImage } from '../../types/product';
import { uploadImages } from '../../services/imageService';
import { useCategories } from '../../context/CategoryContext';

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
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === index })));
    setPrimaryImageIndex(index);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title || !price || !category) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process and upload images if any new ones are added
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await uploadImages(imageFiles);
      }
      
      // Combine existing images with newly uploaded ones
      const allImages = [
        ...images.filter(img => !img.url.startsWith('blob:')), // Keep existing remote images
        ...uploadedImageUrls.map((url, i) => ({
          id: nanoid(),
          url,
          isPrimary: images.length === 0 && i === 0 // Set as primary if it's the first image
        }))
      ];
      
      // Make sure there's a primary image
      if (allImages.length > 0 && !allImages.some(img => img.isPrimary)) {
        allImages[0].isPrimary = true;
      }
      
      // Build the product object
      const productData = {
        title,
        description,
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        popularity: parseInt(popularity, 10),
        featured,
        image: allImages.find(img => img.isPrimary)?.url || (allImages[0]?.url || ''),
        images: allImages.length > 0 ? allImages : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        unit,
        brand: brand || undefined,
        isOrganic,
        expiryDate: expiryDate || undefined,
        origin: origin || undefined,
        discount: discount ? parseFloat(discount) : undefined,
        nutritionalInfo: {
          calories: calories ? parseFloat(calories) : undefined,
          protein: protein ? parseFloat(protein) : undefined,
          carbs: carbs ? parseFloat(carbs) : undefined,
          fat: fat ? parseFloat(fat) : undefined,
          sodium: sodium ? parseFloat(sodium) : undefined
        }
      };
      
      if (isEditMode) {
        await customFetch.put(`/products/${id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await customFetch.post('/products', productData);
        toast.success('Product created successfully');
      }
      
      navigate('/admin/products');
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update product' : 'Failed to create product');
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
                  <option key={cat.id} value={cat.id}>
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
                <option value="unidade">Unidade</option>
                <option value="kg">Quilograma (kg)</option>
                <option value="g">Grama (g)</option>
                <option value="L">Litro (L)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="pct">Pacote</option>
                <option value="cx">Caixa</option>
                <option value="dz">Dúzia</option>
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
              Product Images <span className="text-gray-500">(First image will be the main image)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
              onChange={handleImageUpload}
            />
          </div>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {images.map((img, index) => (
                <div key={img.id} className="relative group bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={img.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className={`p-2 rounded-full ${
                        img.isPrimary ? 'bg-green-500' : 'bg-gray-700'
                      } text-white`}
                      onClick={() => handleSetPrimaryImage(index)}
                      title={img.isPrimary ? 'Primary Image' : 'Set as Primary'}
                    >
                      {img.isPrimary ? 'Primary' : 'Set as Primary'}
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full bg-red-600 text-white"
                      onClick={() => handleRemoveImage(index)}
                      title="Remove Image"
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
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 