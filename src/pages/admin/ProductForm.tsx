import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import customFetch from '../../axios/custom';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';
import { HiPlus, HiX } from 'react-icons/hi';
import { Product, ProductColor, ProductImage, ProductSize } from '../../types/product';
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
  
  // Images
  const [images, setImages] = React.useState<ProductImage[]>([]);
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = React.useState(0);
  
  // Sizes
  const [sizes, setSizes] = React.useState<ProductSize[]>([
    { name: 'XS', available: false },
    { name: 'S', available: false },
    { name: 'M', available: false },
    { name: 'L', available: false },
    { name: 'XL', available: false },
    { name: 'XXL', available: false },
  ]);
  
  // Colors
  const [colors, setColors] = React.useState<ProductColor[]>([]);
  const [newColorName, setNewColorName] = React.useState('');
  const [newColorHex, setNewColorHex] = React.useState('#000000');
  
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
          
          // Set sizes if they exist
          if (product.sizes && Array.isArray(product.sizes)) {
            setSizes((prev: ProductSize[]) => {
              return prev.map((size: ProductSize) => {
                const foundSize = product.sizes.find((s: ProductSize) => s.name === size.name);
                return foundSize ? { ...foundSize } : size;
              });
            });
          }
          
          // Set colors if they exist
          if (product.colors && Array.isArray(product.colors)) {
            setColors(product.colors);
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
      const files = Array.from(e.target.files);
      setImageFiles((prev: File[]) => [...prev, ...files]);
      
      // Create preview URLs
      const newImages = files.map(file => ({
        id: nanoid(),
        url: URL.createObjectURL(file as Blob),
        isPrimary: false
      }));
      
      setImages((prev: ProductImage[]) => {
        const updatedImages = [...prev, ...newImages];
        // If this is the first image being added, make it primary
        if (prev.length === 0) {
          updatedImages[0].isPrimary = true;
          setPrimaryImageIndex(0);
        }
        return updatedImages;
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev: ProductImage[]) => prev.filter((_, i) => i !== index));
    setImageFiles((prev: File[]) => prev.filter((_, i) => i !== index));
    
    // Update primary image index if necessary
    if (index === primaryImageIndex) {
      if (images.length > 1) {
        setPrimaryImageIndex(0);
      }
    } else if (index < primaryImageIndex) {
      setPrimaryImageIndex((prev: number) => prev - 1);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
  };

  const handleSizeToggle = (index: number) => {
    setSizes((prev: ProductSize[]) => prev.map((size: ProductSize, i: number) => 
      i === index ? { ...size, available: !size.available } : size
    ));
  };

  const handleAddColor = () => {
    if (newColorName.trim() === '') {
      toast.error('Color name is required');
      return;
    }
    
    setColors((prev: ProductColor[]) => [
      ...prev, 
      { 
        name: newColorName, 
        hex: newColorHex,
        available: true
      }
    ]);
    
    setNewColorName('');
    setNewColorHex('#000000');
  };

  const handleRemoveColor = (index: number) => {
    setColors((prev: ProductColor[]) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!title || !category || !price || !stock) {
        toast.error('Please fill all required fields');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare product data
      const productData: Partial<Product> = {
        title,
        description,
        category,
        price: Number(price),
        stock: Number(stock),
        popularity: Number(popularity),
        featured,
        sizes: sizes.filter((size: ProductSize) => size.available),
        colors,
        updatedAt: new Date().toISOString()
      };
      
      // Add createdAt for new products
      if (!isEditMode) {
        Object.assign(productData, { 
          createdAt: new Date().toISOString(),
          id: nanoid()
        });
      }
      
      // Handle images
      if (images.length > 0) {
        if (isEditMode) {
          // For edit mode, use the existing image URLs and update primary status
          Object.assign(productData, { 
            images: images.map((img: ProductImage, index: number) => ({
              ...img,
              isPrimary: index === primaryImageIndex
            })),
            // Keep the legacy image field for backward compatibility
            image: images[primaryImageIndex]?.url || images[0]?.url
          });
        } else {
          // For new products, upload the images
          if (imageFiles.length > 0) {
            try {
              // Upload images and get back URLs
              const uploadedImageUrls = await uploadImages(imageFiles);
              
              const newImages = uploadedImageUrls.map((url: string, index: number) => ({
                id: nanoid(),
                url,
                isPrimary: index === primaryImageIndex
              }));
              
              Object.assign(productData, { 
                images: newImages,
                image: newImages[primaryImageIndex]?.url || newImages[0]?.url
              });
            } catch (error) {
              toast.error('Failed to upload images');
              setIsSubmitting(false);
              return;
            }
          } else {
            toast.error('At least one image is required');
            setIsSubmitting(false);
            return;
          }
        }
      } else {
        toast.error('At least one image is required');
        setIsSubmitting(false);
        return;
      }
      
      // Save to API
      if (isEditMode) {
        await customFetch.put(`/products/${id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await customFetch.post('/products', productData);
        toast.success('Product created successfully');
      }
      
      // Navigate back to products list
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(isEditMode ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loadingCategories) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-md p-6">
      <h2 className="text-2xl font-semibold mb-6">
        {isEditMode ? 'Edit Product' : 'Create New Product'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Title*
              </label>
              <input
                type="text"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                value={category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat: { id: string; slug: string; name: string }) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)*
              </label>
              <input
                type="number"
                value={price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock*
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStock(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Popularity (0-100)
              </label>
              <input
                type="number"
                value={popularity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPopularity(e.target.value)}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeatured(e.target.checked)}
                className="h-4 w-4 text-secondaryBrown border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Featured Product
              </label>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {/* Images Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Product Images</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Images*
            </label>
            <input
              type="file"
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-sm text-gray-500 mt-1">
              You can upload multiple images. The first image will be the primary image.
            </p>
          </div>
          
          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image: ProductImage, index: number) => (
                <div 
                  key={image.id}
                  className="relative group border border-gray-200 rounded-md overflow-hidden"
                >
                  <img 
                    src={image.url} 
                    alt={`Product ${index + 1}`}
                    className="w-full h-40 object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      console.error("Error loading image:", e.currentTarget.src);
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(index)}
                      className={`p-1 bg-white text-secondaryBrown rounded-full mx-1 ${
                        index === primaryImageIndex ? 'opacity-0' : ''
                      }`}
                      title="Set as primary image"
                    >
                      <HiPlus className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1 bg-white text-red-500 rounded-full"
                      title="Remove image"
                    >
                      <HiX className="h-5 w-5" />
                    </button>
                  </div>
                  {index === primaryImageIndex && (
                    <div className="absolute bottom-0 left-0 right-0 bg-secondaryBrown text-white text-xs py-1 text-center">
                      Primary
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Sizes Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Available Sizes</h3>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size: ProductSize, index: number) => (
              <button
                key={size.name}
                type="button"
                onClick={() => handleSizeToggle(index)}
                className={`px-4 py-2 rounded-md ${
                  size.available 
                    ? 'bg-secondaryBrown text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Colors Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Name
              </label>
              <input
                type="text"
                value={newColorName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewColorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Navy Blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Code
              </label>
              <input
                type="color"
                value={newColorHex}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewColorHex(e.target.value)}
                className="w-full h-10"
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleAddColor}
            className="mb-4 px-4 py-2 border border-secondaryBrown text-secondaryBrown rounded-md hover:bg-secondaryBrown hover:text-white transition-colors"
          >
            Add Color
          </button>
          
          {colors.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {colors.map((color: ProductColor, index: number) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full mr-2" 
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    className="text-red-500"
                  >
                    <HiX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 border border-gray-300 rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-secondaryBrown text-white px-6 py-2 rounded-md disabled:opacity-70"
          >
            {isSubmitting 
              ? (isEditMode ? 'Updating...' : 'Creating...') 
              : (isEditMode ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 