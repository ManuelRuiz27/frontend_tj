import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from '../../lib/apiClient';

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
  pageSize?: number;
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

interface CatalogItemDto {
  id: string;
  nombre: string;
  categoria: string;
  municipio: string;
  descuento: string;
  direccion?: string | null;
  horario?: string | null;
  descripcion?: string | null;
  lat?: number | null;
  lng?: number | null;
}

interface CatalogListDto {
  items?: CatalogItemDto[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface CatalogQueryArgs {
  categoria?: string;
  municipio?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

const mapCatalogItemToBenefit = (item: CatalogItemDto): Benefit => ({
  id: item.id,
  name: item.nombre,
  category: item.categoria,
  municipality: item.municipio,
  discount: item.descuento,
  address: item.direccion ?? undefined,
  schedule: item.horario ?? undefined,
  description: item.descripcion ?? undefined,
  latitude: typeof item.lat === 'number' ? item.lat : undefined,
  longitude: typeof item.lng === 'number' ? item.lng : undefined,
});

const uniqueValues = (values: Array<string | undefined>): string[] =>
  Array.from(
    new Set(values.filter((value): value is string => typeof value === 'string' && value.length > 0)),
  );

export const catalogApi = createApi({
  reducerPath: 'catalogApi',
  baseQuery: apiBaseQuery,
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

        if (args?.pageSize) {
          searchParams.set('pageSize', String(args.pageSize));
        }

        return {
          url: `catalog${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
        };
      },
      transformResponse: (response: CatalogListDto): CatalogResponse => {
        const items = response.items ?? [];
        const benefits = items.map(mapCatalogItemToBenefit);

        const page = response.page ?? 1;
        const totalPages = response.totalPages ?? 1;
        const total = response.total ?? benefits.length;
        const pageSize = response.pageSize;

        const categories = uniqueValues(benefits.map((benefit) => benefit.category));
        const municipalities = uniqueValues(benefits.map((benefit) => benefit.municipality));

        const nextPage = page < totalPages ? page + 1 : null;
        const prevPage = page > 1 ? page - 1 : null;

        return {
          data: benefits,
          meta: {
            page,
            totalPages,
            total,
            pageSize,
            nextPage,
            prevPage,
            filters: {
              categories,
              municipalities,
            },
          },
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
