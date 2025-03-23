import React from 'react';
import { NutritionalInfo } from '../types/product';

interface NutritionalTableProps {
  nutritionalInfo: NutritionalInfo;
}

const NutritionalTable: React.FC<NutritionalTableProps> = ({ nutritionalInfo }) => {
  // Função auxiliar para verificar se deve mostrar um valor
  const shouldShowValue = (value: number | undefined): boolean => {
    return value !== undefined && value !== null && !isNaN(Number(value));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-700">Tabela Nutricional</h3>
        <p className="text-xs text-gray-500">Valores por 100g/ml</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {shouldShowValue(nutritionalInfo.calories) && (
          <div className="flex justify-between px-4 py-3">
            <span className="text-gray-600">Calorias</span>
            <span className="font-medium text-gray-900">{nutritionalInfo.calories} kcal</span>
          </div>
        )}
        
        {shouldShowValue(nutritionalInfo.protein) && (
          <div className="flex justify-between px-4 py-3">
            <span className="text-gray-600">Proteínas</span>
            <span className="font-medium text-gray-900">{nutritionalInfo.protein}g</span>
          </div>
        )}
        
        {shouldShowValue(nutritionalInfo.carbs) && (
          <div className="flex justify-between px-4 py-3">
            <span className="text-gray-600">Carboidratos</span>
            <span className="font-medium text-gray-900">{nutritionalInfo.carbs}g</span>
          </div>
        )}
        
        {shouldShowValue(nutritionalInfo.fat) && (
          <div className="flex justify-between px-4 py-3">
            <span className="text-gray-600">Gorduras Totais</span>
            <span className="font-medium text-gray-900">{nutritionalInfo.fat}g</span>
          </div>
        )}
        
        {shouldShowValue(nutritionalInfo.fiber) && (
          <div className="flex justify-between px-4 py-3">
            <span className="text-gray-600">Fibras</span>
            <span className="font-medium text-gray-900">{nutritionalInfo.fiber}g</span>
          </div>
        )}
        
        {shouldShowValue(nutritionalInfo.sodium) && (
          <div className="flex justify-between px-4 py-3">
            <span className="text-gray-600">Sódio</span>
            <span className="font-medium text-gray-900">{nutritionalInfo.sodium}mg</span>
          </div>
        )}
        
        {shouldShowValue(nutritionalInfo.sugar) && (
          <div className="flex justify-between px-4 py-3">
            <span className="text-gray-600">Açúcares</span>
            <span className="font-medium text-gray-900">{nutritionalInfo.sugar}g</span>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
        * Valores Diários de referência com base em uma dieta de 2.000 kcal.
      </div>
    </div>
  );
};

export default NutritionalTable; 