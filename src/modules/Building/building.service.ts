import { Building, Prisma } from "@prisma/client";
import prismaHelper from "../../helpers/prisma.helper";
import {
  IQueryFeatures,
  IQueryResult,
} from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";

const create = async (payload: Building): Promise<Building> => {
  const newb = await prisma.building.create({
    data: payload,
  });
  return newb;
};

const getBuildings = async (
  queryFeatures: IQueryFeatures
): Promise<IQueryResult<Building>> => {
  const whereConditions: Prisma.BuildingWhereInput =
    prismaHelper.findManyQueryHelper<Prisma.BuildingWhereInput>(queryFeatures, {
      searchFields: ["title"],
    });

  const query: Prisma.BuildingFindManyArgs = {
    where: whereConditions,
    skip: queryFeatures.skip,
    take: queryFeatures.limit,
    orderBy: queryFeatures.sort,
  };

  if (
    queryFeatures.populate &&
    Object.keys(queryFeatures.populate).length > 0
  ) {
    query.include = {
      _count: true,
      ...queryFeatures.populate,
    };
  } else {
    if (queryFeatures.fields && Object.keys(queryFeatures.fields).length > 0) {
      query.select = { id: true, ...queryFeatures.fields };
    }
  }
  const [result, count] = await prisma.$transaction([
    prisma.building.findMany(query),
    prisma.building.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

const getSingleBuilding = async (
  id: string,
  queryFeatures: IQueryFeatures
): Promise<Partial<Building> | null> => {
  const query: Prisma.BuildingFindUniqueArgs = {
    where: {
      id,
    },
  };

  if (
    queryFeatures.populate &&
    Object.keys(queryFeatures.populate).length > 0
  ) {
    query.include = {
      _count: true,
      ...queryFeatures.populate,
    };
  } else {
    if (queryFeatures.fields && Object.keys(queryFeatures.fields).length > 0) {
      query.select = { id: true, ...queryFeatures.fields };
    }
  }

  const result: Partial<Building> | null = await prisma.building.findUnique(
    query
  );

  return result;
};

const updateBuilding = async (
  id: string,
  payload: Partial<Building>
): Promise<Partial<Building> | null> => {
  const result: Partial<Building> | null = await prisma.building.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteBuilding = async (id: string) => {
  const result: Partial<Building> | null = await prisma.building.delete({
    where: {
      id,
    },
  });

  return result;
};

const buildingServices = {
  create,
  getBuildings,
  getSingleBuilding,
  updateBuilding,
  deleteBuilding,
};

export default buildingServices;
