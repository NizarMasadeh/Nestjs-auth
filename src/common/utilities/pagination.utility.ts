export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  meta: PaginationMeta;
  items: T[];
}

export function paginate<T>(
  data: T[],
  count: number,
  page: number = 1,
  limit: number = 20,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(count / limit);

  return {
    meta: {
      currentPage: page,
      totalPages,
      limit,
      total: count,
    },
    items: data,
  };
}
