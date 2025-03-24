import React from "react";
import ProductItem from "./ProductItem";
import { nanoid } from "nanoid";
import { Product } from "../typings";

const ProductGrid = ({ products }: { products?: Product[] }) => {
  return (
    <div
      id="gridTop"
      className="max-w-screen-2xl flex flex-wrap justify-between items-center gap-y-8 mx-auto mt-12 max-xl:justify-start max-xl:gap-5 px-5 max-[400px]:px-3"
    >
      {products &&
        products.map((product: Product) => {
          // Detect if image is from apoioentrega by checking the URL
          const isApoioEntregaImage = 
            product.source === 'apoioentrega' || 
            (product.image && product.image.includes('apoioentrega.vteximg.com.br'));
          
          return (
            <ProductItem
              key={nanoid()}
              product={product}
              // Fallback para propriedades individuais para compatibilidade
              id={product.id}
              title={product.title}
              description={product.description || ''}
              category={product.category}
              price={product.price}
              imageUrl={product.image}
              stock={product.stock}
              featured={product.featured}
              isApoioEntregaImage={isApoioEntregaImage}
            />
          );
        })}
    </div>
  );
};
// Memoize the component to prevent unnecessary re-renders because of React.cloneElement
export default React.memo(ProductGrid);
