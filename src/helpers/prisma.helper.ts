import { IQueryFeatures } from "../interfaces/queryFeatures.interface";

interface IOptions {
  searchFields: string[];
  relationalFields?: { [key: string]: string };
}

const findManyQueryHelper = <T>(
  queryFeatures: IQueryFeatures,
  options: IOptions
): T => {
  const andConditions = [];

  if (queryFeatures.searchKey) {
    andConditions.push({
      OR: options.searchFields.map((field) => ({
        [field]: {
          contains: queryFeatures.searchKey,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(queryFeatures.filters).length > 0) {
    andConditions.push({
      AND: Object.keys(queryFeatures.filters).map((key) => {
        if (options.relationalFields && options.relationalFields[key]) {
          return {
            [options.relationalFields[key]]: {
              id: (queryFeatures.filters as any)[key],
            },
          };
        } else {
          return {
            [key]: {
              equals: (queryFeatures.filters as any)[key],
            },
          };
        }
      }),
    });
  }

  const whereConditions: T = (
    andConditions.length > 0 ? { AND: andConditions } : {}
  ) as T;

  return whereConditions;
};

const prismaHelper = {
  findManyQueryHelper,
};

export default prismaHelper;
