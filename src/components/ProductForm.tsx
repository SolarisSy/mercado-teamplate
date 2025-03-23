import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/Button';
import { Product, ProductFormData } from '../types/product';
import { uploadImages } from '../services/imageUploadService';
import { createProduct, updateProduct } from '../services/productService';
import { toast } from 'react-hot-toast';

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProductFormData>({
    defaultValues: product ? {
      ...product,
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
    } : {
      title: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      images: [],
      weight: 0,
      unit: 'kg',
      brand: '',
      isOrganic: false,
      nutritionalInfo: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
      expiryDate: '',
      origin: '',
      discount: 0,
    }
  });

  useEffect(() => {
    if (product) {
      // Converter as datas para o formato esperado pelo input date
      if (product.expiryDate) {
        setValue('expiryDate', new Date(product.expiryDate).toISOString().split('T')[0]);
      }
      
      // Se o produto já tem imagens, mostrar os previews
      if (product.images && product.images.length > 0) {
        setImagePreviewUrls(product.images);
      }
    }
  }, [product, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Atualizar a lista de arquivos
      setImageFiles(prev => [...prev, ...files]);
      
      // Criar URLs de preview para as imagens
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    
    // Remover a URL de preview e liberar o recurso
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);
      
      // Processar as imagens se houver novas
      let imageUrls = product?.images || [];
      
      if (imageFiles.length > 0) {
        const uploadedImageUrls = await uploadImages(imageFiles);
        imageUrls = [...imageUrls, ...uploadedImageUrls];
      }
      
      // Preparar os dados do produto com as URLs das imagens
      const productData: ProductFormData = {
        ...data,
        images: imageUrls,
        // Converter string para date para os campos de data
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      };
      
      if (product?.id) {
        // Atualizar produto existente
        await updateProduct(product.id, productData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Criar novo produto
        await createProduct(productData);
        toast.success('Produto criado com sucesso!');
        reset();
        setImageFiles([]);
        setImagePreviewUrls([]);
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar o produto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações básicas */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              {...register('title', { required: 'Título é obrigatório' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              rows={3}
              {...register('description', { required: 'Descrição é obrigatória' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price', { 
                  required: 'Preço é obrigatório',
                  min: { value: 0, message: 'Preço não pode ser negativo' },
                  valueAsNumber: true
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estoque
              </label>
              <input
                type="number"
                min="0"
                {...register('stock', { 
                  required: 'Estoque é obrigatório',
                  min: { value: 0, message: 'Estoque não pode ser negativo' },
                  valueAsNumber: true
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categoria
            </label>
            <select
              {...register('category', { required: 'Categoria é obrigatória' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">Selecione uma categoria</option>
              <option value="frutas">Frutas</option>
              <option value="verduras">Verduras e Legumes</option>
              <option value="carnes">Carnes</option>
              <option value="laticinios">Laticínios</option>
              <option value="padaria">Padaria</option>
              <option value="mercearia">Mercearia</option>
              <option value="bebidas">Bebidas</option>
              <option value="congelados">Congelados</option>
              <option value="higiene">Higiene e Limpeza</option>
              <option value="outros">Outros</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
        </div>
        
        {/* Informações específicas de supermercado */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Peso
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('weight', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unidade
              </label>
              <select
                {...register('unit')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="L">L</option>
                <option value="unid">unidade</option>
                <option value="dz">dúzia</option>
                <option value="pct">pacote</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Marca
            </label>
            <input
              type="text"
              {...register('brand')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isOrganic"
              {...register('isOrganic')}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isOrganic" className="ml-2 block text-sm text-gray-700">
              Produto Orgânico
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data de Validade
            </label>
            <input
              type="date"
              {...register('expiryDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              País/Região de Origem
            </label>
            <input
              type="text"
              {...register('origin')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Desconto (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              {...register('discount', { 
                min: { value: 0, message: 'Desconto não pode ser negativo' },
                max: { value: 100, message: 'Desconto não pode ser maior que 100%' },
                valueAsNumber: true
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
            {errors.discount && (
              <p className="mt-1 text-sm text-red-600">{errors.discount.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Seção Informações Nutricionais */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Nutricionais</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Calorias
            </label>
            <input
              type="number"
              min="0"
              {...register('nutritionalInfo.calories', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Proteínas (g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              {...register('nutritionalInfo.protein', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Carboidratos (g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              {...register('nutritionalInfo.carbs', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gorduras (g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              {...register('nutritionalInfo.fat', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fibras (g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              {...register('nutritionalInfo.fiber', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sódio (mg)
            </label>
            <input
              type="number"
              min="0"
              {...register('nutritionalInfo.sodium', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Açúcar (g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              {...register('nutritionalInfo.sugar', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Imagens */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Imagens do Produto</h3>
        
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary-dark"
          />
        </div>
        
        {imagePreviewUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            reset();
            setImageFiles([]);
            setImagePreviewUrls([]);
          }}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {product ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm; 