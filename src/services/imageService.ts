import { compressImage } from '../utils/imageCompression';

// Função para converter uma imagem File em uma string base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Função para salvar imagens em arquivos separados em vez de base64 no db.json
export const uploadImages = async (files: File[]): Promise<string[]> => {
  try {
    console.log("Uploading images:", files);
    
    // Comprimir imagens antes de converter para base64
    const compressedFiles = await Promise.all(files.map(file => compressImage(file)));
    
    // Converter para base64
    const base64Images = await Promise.all(compressedFiles.map(file => fileToBase64(file)));
    console.log("Converted to base64, first image length:", base64Images[0]?.length);
    
    return base64Images;
  } catch (error) {
    console.error("Error in image upload:", error);
    throw error;
  }
};

// Simula a exclusão de uma imagem do serviço de armazenamento
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  // Em um ambiente real, aqui você faria a exclusão da imagem do serviço
  console.log("Deleting image:", imageUrl);
  return Promise.resolve(true);
}; 