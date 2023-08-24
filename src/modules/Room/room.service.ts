import { Room, Prisma } from "@prisma/client";
import prismaHelper from "../../helpers/prisma.helper";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";

const create = async (payload: Room): Promise<Room> => {
  const newr = await prisma.room.create({
    data: payload,
  });
  return newr;
};

const getRooms = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<Room>> => {
  const whereConditions: Prisma.RoomWhereInput = prismaHelper.findManyQueryHelper<Prisma.RoomWhereInput>(queryFeatures, {
    searchFields: ['roomNumber', 'floor'],
    relationalFields: {
      buildingId: "building"
    }
  });

  const query: Prisma.RoomFindManyArgs = {
    where: whereConditions,
    skip: queryFeatures.skip,
    take: queryFeatures.limit,
    orderBy: queryFeatures.sort,
  };

  if (queryFeatures.populate && Object.keys(queryFeatures.populate).length > 0) {
    query.include = {
      ...queryFeatures.populate,
    };
  } else {
    if (queryFeatures.fields && Object.keys(queryFeatures.fields).length > 0) {
      query.select = { id: true, ...queryFeatures.fields };
    }
  }
  const [result, count] = await prisma.$transaction([prisma.room.findMany(query), prisma.room.count({ where: whereConditions })]);

  return {
    data: result,
    total: count,
  };
};

const getSingleRoom = async (id: string, queryFeatures: IQueryFeatures): Promise<Partial<Room> | null> => {
  const query: Prisma.RoomFindUniqueArgs = {
    where: {
      id,
    },
  };

  if (queryFeatures.populate && Object.keys(queryFeatures.populate).length > 0) {
    query.include = {
      ...queryFeatures.populate,
    };
  } else {
    if (queryFeatures.fields && Object.keys(queryFeatures.fields).length > 0) {
      query.select = { id: true, ...queryFeatures.fields };
    }
  }

  const result: Partial<Room> | null = await prisma.room.findUnique(query);

  return result;
};

const updateRoom = async (id: string, payload: Partial<Room>): Promise<Partial<Room> | null> => {
  const result: Partial<Room> | null = await prisma.room.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteRoom = async (id: string) => {
  const result: Partial<Room> | null = await prisma.room.delete({
    where: {
      id,
    },
  });

  return result;
};

const roomServices = {
  create,
  getRooms,
  getSingleRoom,
  updateRoom,
  deleteRoom,
};

export default roomServices;
