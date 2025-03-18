import {
  Button,
  Dropdown,
  ProductItem,
  QuantityInput,
} from "../components";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { addProductToTheCart } from "../features/cart/cartSlice";
import { useAppDispatch } from "../hooks";
import WithNumberInputWrapper from "../utils/withNumberInputWrapper";
import { formatCategoryName } from "../utils/formatCategoryName";
import toast from "react-hot-toast";
import customFetch from "../utils/customFetch";

const SingleProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  // defining default values for input fields
  const [quantity, setQuantity] = useState<number>(1);
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  // defining HOC instances
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
          id: singleProduct.id,
          image: singleProduct.image,
          title: singleProduct.title,
          category: singleProduct.category,
          price: singleProduct.price,
          quantity,
          stock: singleProduct.stock,
          description: singleProduct.description,
          featured: singleProduct.featured,
          weight: singleProduct.weight,
          unit: singleProduct.unit
        })
      );
      toast.success("Produto adicionado ao carrinho");
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Format weight/volume with the unit
  const formatMeasurement = (weight?: number, unit?: string) => {
    if (!weight || !unit) return '';
    
    return `${weight} ${unit}`;
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
                alt={singleProduct.title}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-product.jpg';
                }}
              />
              {singleProduct.featured && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                  Oferta
                </div>
              )}
              {singleProduct.isOrganic && (
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                  Orgânico
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{singleProduct.title}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {singleProduct.brand && <span className="font-medium">Marca: {singleProduct.brand}</span>}
                  {singleProduct.origin && <span className="ml-2 font-medium">• Origem: {singleProduct.origin}</span>}
                </p>
                
                <div className="mt-4 flex items-baseline">
                  <span className="text-2xl font-bold text-green-700">{formatPrice(singleProduct.price)}</span>
                  {singleProduct.discount && singleProduct.discount > 0 && (
                    <span className="ml-3 text-sm text-gray-500 line-through">
                      {formatPrice(singleProduct.price * (1 + singleProduct.discount / 100))}
                    </span>
                  )}
                </div>
                
                {singleProduct.weight && singleProduct.unit && (
                  <p className="text-sm text-gray-600 mt-2">
                    {formatMeasurement(singleProduct.weight, singleProduct.unit)}
                    {' • '}
                    {formatPrice(singleProduct.price / singleProduct.weight)}/{singleProduct.unit === 'kg' ? 'kg' : singleProduct.unit === 'g' ? '100g' : singleProduct.unit === 'L' ? 'L' : singleProduct.unit === 'ml' ? '100ml' : singleProduct.unit}
                  </p>
                )}
                
                {singleProduct.expiryDate && (
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Validade: </span>
                    {new Date(singleProduct.expiryDate).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                <p className="text-gray-700">{singleProduct.description}</p>
              </div>
              
              {singleProduct.nutritionalInfo && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold mb-2">Informações Nutricionais</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    {singleProduct.nutritionalInfo.calories !== undefined && (
                      <div>
                        <p className="font-medium">Calorias</p>
                        <p>{singleProduct.nutritionalInfo.calories} kcal</p>
                      </div>
                    )}
                    {singleProduct.nutritionalInfo.protein !== undefined && (
                      <div>
                        <p className="font-medium">Proteínas</p>
                        <p>{singleProduct.nutritionalInfo.protein}g</p>
                      </div>
                    )}
                    {singleProduct.nutritionalInfo.carbs !== undefined && (
                      <div>
                        <p className="font-medium">Carboidratos</p>
                        <p>{singleProduct.nutritionalInfo.carbs}g</p>
                      </div>
                    )}
                    {singleProduct.nutritionalInfo.fat !== undefined && (
                      <div>
                        <p className="font-medium">Gorduras</p>
                        <p>{singleProduct.nutritionalInfo.fat}g</p>
                      </div>
                    )}
                    {singleProduct.nutritionalInfo.sodium !== undefined && (
                      <div>
                        <p className="font-medium">Sódio</p>
                        <p>{singleProduct.nutritionalInfo.sodium}mg</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-4">
                  <div className="mr-8">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade
                    </label>
                    <QuantityInputUpgrade
                      name="quantity"
                      value={quantity}
                      setValue={setQuantity}
                      min={1}
                      max={singleProduct.stock}
                    />
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Disponibilidade: </span>
                      {singleProduct.stock > 10
                        ? "Em Estoque"
                        : singleProduct.stock > 0
                        ? `Apenas ${singleProduct.stock} unidades`
                        : "Fora de Estoque"}
                    </p>
                  </div>
                </div>

                <Button
                  name="addToCart"
                  text="Adicionar ao Carrinho"
                  purpose="primary"
                  disabled={singleProduct.stock <= 0}
                  onClick={handleAddToCart}
                  styles="w-full md:w-auto"
                />
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Produtos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products
                .filter(
                  (product) =>
                    product.category === singleProduct.category &&
                    product.id !== singleProduct.id
                )
                .slice(0, 4)
                .map((product) => (
                  <ProductItem
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    category={product.category}
                    description={product.description}
                    stock={product.stock}
                    popularity={product.popularity}
                    image={product.image}
                    featured={product.featured}
                  />
                ))}
            </div>
          </div>
        </>
      ) : (
        <div className="h-96 flex items-center justify-center">
          <p className="text-xl">Carregando produto...</p>
        </div>
      )}
    </div>
  );
};

export default SingleProduct;
