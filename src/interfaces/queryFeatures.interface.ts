export interface IQueryFeatures {
  page: number;
  limit: number;
  skip: number;
  fields: { [key: string]: boolean };
  filters: object;
  populate: { [key: string]: boolean };
  sort: { [key: string]: "asc" | "desc" };
  searchKey?: string;
}

export interface IQueryResult<T> {
  data: Partial<T>[];
  total: number;
}
