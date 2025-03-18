import {
  Button,
  Dropdown,
  ProductItem,
  QuantityInput,
  StandardSelectInput,
} from "../components";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { addProductToTheCart } from "../features/cart/cartSlice";
import { useAppDispatch } from "../hooks";
import WithSelectInputWrapper from "../utils/withSelectInputWrapper";
import WithNumberInputWrapper from "../utils/withNumberInputWrapper";
import { formatCategoryName } from "../utils/formatCategoryName";
import toast from "react-hot-toast";
import customFetch from "../utils/customFetch";

const SingleProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  // defining default values for input fields
  const [size, setSize] = useState<string>("xs");
  const [color, setColor] = useState<string>("black");
  const [quantity, setQuantity] = useState<number>(1);
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  // defining HOC instances
  const SelectInputUpgrade = WithSelectInputWrapper(StandardSelectInput);
  const QuantityInputUpgrade = WithNumberInputWrapper(QuantityInput);

  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const response = await customFetch.get(`/products/${params.id}`);
        setSingleProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await customFetch.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchSingleProduct();
    fetchProducts();
  }, [params.id]);

  useEffect(() => {
    console.log("Product data:", singleProduct);
    console.log("Product images:", singleProduct?.images);
  }, [singleProduct]);

  const handleAddToCart = () => {
    if (singleProduct) {
      dispatch(
        addProductToTheCart({
          id: singleProduct.id + size + color,
          image: singleProduct.image,
          title: singleProduct.title,
          category: singleProduct.category,
          price: singleProduct.price,
          quantity,
          size,
          color,
          popularity: singleProduct.popularity,
          stock: singleProduct.stock,
          description: singleProduct.description,
          featured: singleProduct.featured
        })
      );
      toast.success("Product added to the cart");
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 sm:py-16">
      {singleProduct ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative aspect-square w-full">
              <img
                src={singleProduct.image}
                alt={singleProduct.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{singleProduct.name}</h1>
                <p className="mt-2 text-xl text-gray-900">${singleProduct.price}</p>
              </div>

              <div className="space-y-4">
                {/* Size Selector */}
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                    Size
                  </label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {["xs", "s", "m", "l", "xl"].map((sizeOption) => (
                      <button
                        key={sizeOption}
                        onClick={() => setSize(sizeOption)}
                        className={`flex items-center justify-center h-12 text-sm uppercase font-medium rounded-md touch-manipulation
                          ${size === sizeOption
                            ? 'bg-secondaryBrown text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                      >
                        {sizeOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {["black", "white", "gray", "red"].map((colorOption) => (
                      <button
                        key={colorOption}
                        onClick={() => setColor(colorOption)}
                        className={`flex items-center justify-center h-12 text-sm capitalize font-medium rounded-md touch-manipulation
                          ${color === colorOption
                            ? 'bg-secondaryBrown text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                      >
                        {colorOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <div className="mt-2 flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 touch-manipulation"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 touch-manipulation"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => {
                    dispatch(
                      addProductToTheCart({
                        ...singleProduct,
                        size,
                        color,
                        quantity,
                      })
                    );
                    toast.success("Product added to cart");
                  }}
                  className="w-full py-4 bg-secondaryBrown text-white text-lg font-medium rounded-md hover:bg-opacity-90 transition duration-300 touch-manipulation"
                >
                  Add to Cart
                </button>
              </div>

              {/* Product Description */}
              <div className="prose prose-sm mt-4">
                <h3 className="text-lg font-medium text-gray-900">Description</h3>
                <p className="text-gray-700">{singleProduct.description}</p>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products
                .filter(
                  (product) =>
                    product.category === singleProduct.category &&
                    product.id !== singleProduct.id
                )
                .slice(0, 4)
                .map((product) => (
                  <ProductItem key={product.id} product={product} />
                ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      )}
    </div>
  );
};
export default SingleProduct;
