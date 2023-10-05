import { AcademicFaculty, Prisma } from "@prisma/client";
import prismaHelper from "../../helpers/prisma.helper";
import {
  IQueryFeatures,
  IQueryResult,
} from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import { redis } from "../../utils/redis.util";
import {
  EVENT_ACADEMIC_FACULTY_CREATED,
  EVENT_ACADEMIC_FACULTY_DELETED,
  EVENT_ACADEMIC_FACULTY_UPDATED,
} from "./academicFaculty.constant";

const create = async (payload: AcademicFaculty): Promise<AcademicFaculty> => {
  const newAf = await prisma.academicFaculty.create({
    data: payload,
  });
  if (newAf) {
    await redis.publish(EVENT_ACADEMIC_FACULTY_CREATED, JSON.stringify(newAf));
  }
  return newAf;
};

const getAcademicFaculties = async (
  queryFeatures: IQueryFeatures
): Promise<IQueryResult<AcademicFaculty>> => {
  const whereConditions: Prisma.AcademicFacultyWhereInput =
    prismaHelper.findManyQueryHelper<Prisma.AcademicFacultyWhereInput>(
      queryFeatures,
      {
        searchFields: ["title"],
      }
    );

  const query: Prisma.AcademicFacultyFindManyArgs = {
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
    prisma.academicFaculty.findMany(query),
    prisma.academicFaculty.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

const getSingleAcademicFaculty = async (
  id: string,
  queryFeatures: IQueryFeatures
): Promise<Partial<AcademicFaculty> | null> => {
  const query: Prisma.AcademicFacultyFindUniqueArgs = {
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
  const result: Partial<AcademicFaculty> | null =
    await prisma.academicFaculty.findUnique(query);

  return result;
};

const updateAcademicFaculty = async (
  id: string,
  payload: Partial<AcademicFaculty>
): Promise<Partial<AcademicFaculty> | null> => {
  const result: Partial<AcademicFaculty> | null =
    await prisma.academicFaculty.update({
      where: {
        id,
      },
      data: payload,
    });

  if (result) {
    await redis.publish(EVENT_ACADEMIC_FACULTY_UPDATED, JSON.stringify(result));
  }

  return result;
};

const deleteAcademicFaculty = async (id: string) => {
  const result: Partial<AcademicFaculty> | null =
    await prisma.academicFaculty.delete({
      where: {
        id,
      },
    });

  if (result) {
    await redis.publish(EVENT_ACADEMIC_FACULTY_DELETED, JSON.stringify(result));
  }

  return result;
};

const academicFacultyService = {
  create,
  getAcademicFaculties,
  getSingleAcademicFaculty,
  updateAcademicFaculty,
  deleteAcademicFaculty,
};

export default academicFacultyService;
