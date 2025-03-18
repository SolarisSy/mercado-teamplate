import { Link } from 'react-router-dom';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

const Pagination = ({ currentPage, totalPages, baseUrl }: PaginationProps) => {
  // Não mostrar paginação se houver apenas uma página
  if (totalPages <= 1) return null;
  
  // Determinar quais páginas mostrar
  const pageNumbers = [];
  const maxPagesToShow = 5;
  
  if (totalPages <= maxPagesToShow) {
    // Mostrar todas as páginas se o total for menor que o máximo
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Lógica para mostrar páginas com elipses
    if (currentPage <= 3) {
      // Caso 1: Página atual próxima ao início
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Caso 2: Página atual próxima ao fim
      pageNumbers.push(1);
      pageNumbers.push('ellipsis');
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Caso 3: Página atual no meio
      pageNumbers.push(1);
      pageNumbers.push('ellipsis');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    }
  }
  
  return (
    <div className="flex justify-center items-center space-x-2">
      {/* Botão Anterior */}
      {currentPage > 1 && (
        <Link
          to={`${baseUrl}?page=${currentPage - 1}`}
          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          &laquo; Prev
        </Link>
      )}
      
      {/* Números de página */}
      {pageNumbers.map((page, index) => {
        if (page === 'ellipsis') {
          return <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>;
        }
        
        return (
          <Link
            key={`page-${page}`}
            to={`${baseUrl}?page=${page}`}
            className={`px-3 py-1 border rounded-md ${
              currentPage === page
                ? 'bg-secondaryBrown text-white border-secondaryBrown'
                : 'border-gray-300 hover:bg-gray-100'
            }`}
          >
            {page}
          </Link>
        );
      })}
      
      {/* Botão Próximo */}
      {currentPage < totalPages && (
        <Link
          to={`${baseUrl}?page=${currentPage + 1}`}
          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Next &raquo;
        </Link>
      )}
    </div>
  );
};

export default Pagination; 