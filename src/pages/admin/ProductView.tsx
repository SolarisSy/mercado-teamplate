import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import customFetch from '../../axios/custom';
import toast from 'react-hot-toast';
import { HiPencil, HiArrowLeft } from 'react-icons/hi';
import { Product } from '../../types/product';

const ProductView = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await customFetch.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        toast.error('Failed to fetch product details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return <div className="text-center py-10">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">Product not found</p>
        <Link to="/admin/products" className="text-secondaryBrown hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/admin/products" className="mr-4">
            <HiArrowLeft className="text-xl" />
          </Link>
          <h2 className="text-2xl font-semibold">Product Details</h2>
        </div>
        <Link 
          to={`/admin/products/edit/${id}`} 
          className="bg-secondaryBrown text-white px-4 py-2 rounded-md flex items-center"
        >
          <HiPencil className="mr-2" /> Edit Product
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <h3 className="text-lg font-medium mb-4">Product Images</h3>
            <div className="grid grid-cols-2 gap-4">
              {product.images && product.images.length > 0 ? (
                product.images.map((image) => (
                  <div 
                    key={image.id} 
                    className={`border rounded-md overflow-hidden ${
                      image.isPrimary ? 'col-span-2 border-secondaryBrown' : ''
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={product.title} 
                      className="w-full h-auto object-cover max-h-64"
                      onError={(e) => {
                        console.error("Error loading image in view:", e.currentTarget.src);
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
                    {image.isPrimary && (
                      <div className="bg-secondaryBrown text-white text-xs py-1 text-center">
                        Primary Image
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 border rounded-md p-4 text-center text-gray-500">
                  No images available
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h3 className="text-lg font-medium mb-4">Product Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="text-lg">{product.title}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-lg">{product.category}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-lg">${product.price}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Stock</p>
                <p className="text-lg">{product.stock}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Popularity</p>
                <p className="text-lg">{product.popularity}/100</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Featured</p>
                <p className="text-lg">{product.featured ? 'Yes' : 'No'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-lg">{product.description || 'No description available'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sizes and Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Sizes */}
          <div>
            <h3 className="text-lg font-medium mb-4">Available Sizes</h3>
            {product.sizes && product.sizes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span 
                    key={size.name} 
                    className="px-3 py-1 bg-secondaryBrown text-white rounded-md"
                  >
                    {size.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No sizes available</p>
            )}
          </div>

          {/* Colors */}
          <div>
            <h3 className="text-lg font-medium mb-4">Available Colors</h3>
            {product.colors && product.colors.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color, index) => (
                  <div 
                    key={index}
                    className="flex items-center p-2 border rounded-md"
                  >
                    <div 
                      className="w-6 h-6 rounded-full mr-2" 
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No colors available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView; 