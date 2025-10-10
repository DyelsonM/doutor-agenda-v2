/**
 * Configurações padrão de paginação
 */
export const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [20, 50, 100, 200];

/**
 * Calcular offset para paginação
 */
export function calculatePagination(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const offset = (page - 1) * pageSize;
  return {
    offset,
    limit: pageSize,
  };
}

/**
 * Calcular metadados de paginação
 */
export function getPaginationMetadata(
  total: number,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}
