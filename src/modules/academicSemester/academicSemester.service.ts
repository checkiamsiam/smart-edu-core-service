import { AcademicSemester, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import prismaHelper from "../../helpers/prisma.helper";
import {
  IQueryFeatures,
  IQueryResult,
} from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import AppError from "../../utils/customError.util";
import { redis } from "../../utils/redis.util";
import {
  EVENT_ACADEMIC_SEMESTER_CREATED,
  EVENT_ACADEMIC_SEMESTER_DELETED,
  EVENT_ACADEMIC_SEMESTER_UPDATED,
} from "./academicSemester.constant";

const create = async (payload: AcademicSemester): Promise<AcademicSemester> => {
  const isExist = await prisma.academicSemester.findFirst({
    where: payload,
  });
  if (isExist) {
    throw new AppError("Semester already exists", httpStatus.CONFLICT);
  }
  const newSemester = await prisma.academicSemester.create({
    data: payload,
  });

  if (newSemester) {
    await redis.publish(
      EVENT_ACADEMIC_SEMESTER_CREATED,
      JSON.stringify(newSemester)
    );
  }
  return newSemester;
};

const getAcademicSemesters = async (
  queryFeatures: IQueryFeatures
): Promise<IQueryResult<AcademicSemester>> => {
  const whereConditions: Prisma.AcademicSemesterWhereInput =
    prismaHelper.findManyQueryHelper<Prisma.AcademicSemesterWhereInput>(
      queryFeatures,
      {
        searchFields: ["title"],
      }
    );

  const query: Prisma.AcademicSemesterFindManyArgs = {
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
    prisma.academicSemester.findMany(query),
    prisma.academicSemester.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

const getSingleAcademicSemester = async (
  id: string,
  queryFeatures: IQueryFeatures
): Promise<Partial<AcademicSemester> | null> => {
  const query: Prisma.AcademicSemesterFindUniqueArgs = {
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

  const result: Partial<AcademicSemester> | null =
    await prisma.academicSemester.findUnique(query);

  return result;
};

const updateAcademicSemester = async (
  id: string,
  payload: Partial<AcademicSemester>
): Promise<Partial<AcademicSemester> | null> => {
  const result: Partial<AcademicSemester> | null =
    await prisma.academicSemester.update({
      where: {
        id,
      },
      data: payload,
    });

  if (result) {
    await redis.publish(
      EVENT_ACADEMIC_SEMESTER_UPDATED,
      JSON.stringify(result)
    );
  }

  return result;
};

const deleteAcademicSemester = async (id: string) => {
  const result: Partial<AcademicSemester> | null =
    await prisma.academicSemester.delete({
      where: {
        id,
      },
    });

  if (result) {
    await redis.publish(
      EVENT_ACADEMIC_SEMESTER_DELETED,
      JSON.stringify(result)
    );
  }

  return result;
};

const academicSemesterService = {
  create,
  getAcademicSemesters,
  getSingleAcademicSemester,
  updateAcademicSemester,
  deleteAcademicSemester,
};

export default academicSemesterService;
