import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Benefit {
  id: string;
  name: string;
  category: string;
  municipality: string;
  discount: string;
  address?: string;
  schedule?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface CatalogMeta {
  page: number;
  totalPages: number;
  total: number;
  nextPage?: number | null;
  prevPage?: number | null;
  filters?: {
    categories?: string[];
    municipalities?: string[];
  };
}

export interface CatalogResponse {
  data: Benefit[];
  meta: CatalogMeta;
}

export interface CatalogQueryArgs {
  categoria?: string;
  municipio?: string;
  q?: string;
  page?: number;
}

export const catalogApi = createApi({
  reducerPath: 'catalogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
  }),
  tagTypes: ['Catalog'],
  endpoints: (builder) => ({
    getCatalog: builder.query<CatalogResponse, CatalogQueryArgs | void>({
      query: (args) => {
        const searchParams = new URLSearchParams();

        if (args?.categoria) {
          searchParams.set('categoria', args.categoria);
        }

        if (args?.municipio) {
          searchParams.set('municipio', args.municipio);
        }

        if (args?.q) {
          searchParams.set('q', args.q);
        }

        if (args?.page) {
          searchParams.set('page', String(args.page));
        }

        return {
          url: `catalog${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((benefit) => ({ type: 'Catalog' as const, id: benefit.id })),
              { type: 'Catalog' as const, id: 'LIST' },
            ]
          : [{ type: 'Catalog' as const, id: 'LIST' }],
    }),
  }),
});

export const { useGetCatalogQuery, useLazyGetCatalogQuery } = catalogApi;
