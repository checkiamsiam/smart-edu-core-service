import { OfferedCourse, Prisma } from "@prisma/client";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import { ICreateOfferedCourse } from "./offeredCourse.interface";

const create = async (payload: ICreateOfferedCourse): Promise<OfferedCourse[]> => {
  const { academicDepartmentId, semesterRegistrationId, courseIds } = payload;

  await prisma.offeredCourse.createMany({
    data: courseIds.map((courseId) => ({
      academicDepartmentId,
      semesterRegistrationId,
      courseId,
    })),
    skipDuplicates: true,
  });

  const insertOfferedCourse = await prisma.offeredCourse.findMany({
    where: {
      academicDepartmentId,
      semesterRegistrationId,
    },
    include: {
      academicDepartment: true,
      semesterRegistration: true,
      course: true,
    },
  });

  return insertOfferedCourse;
};

const getOfferedCourse = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<OfferedCourse>> => {
  const query: Prisma.OfferedCourseFindManyArgs = {
    skip: queryFeatures.skip,
    take: queryFeatures.limit,
    orderBy: queryFeatures.sort,
  };

  if (queryFeatures.populate && Object.keys(queryFeatures.populate).length > 0) {
    query.include = {
      _count: true,
      ...queryFeatures.populate,
    };
  } else {
    if (queryFeatures.fields && Object.keys(queryFeatures.fields).length > 0) {
      query.select = { id: true, ...queryFeatures.fields };
    }
  }

  const [result, count] = await prisma.$transaction([prisma.offeredCourse.findMany(query), prisma.offeredCourse.count()]);

  return {
    data: result,
    total: count,
  };
};

const getSingleOfferedCourse = async (id: string, queryFeatures: IQueryFeatures): Promise<Partial<OfferedCourse> | null> => {
  const query: Prisma.OfferedCourseFindUniqueArgs = {
    where: {
      id,
    },
  };

  if (queryFeatures.populate && Object.keys(queryFeatures.populate).length > 0) {
    query.include = {
      _count: true,
      ...queryFeatures.populate,
    };
  } else {
    if (queryFeatures.fields && Object.keys(queryFeatures.fields).length > 0) {
      query.select = { id: true, ...queryFeatures.fields };
    }
  }

  const result: Partial<OfferedCourse> | null = await prisma.offeredCourse.findUnique(query);

  return result;
};

const updateOfferedCourse = async (id: string, payload: Partial<OfferedCourse>): Promise<Partial<OfferedCourse> | null> => {
  const result: Partial<OfferedCourse> | null = await prisma.offeredCourse.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteOfferedCourse = async (id: string) => {
  const result: Partial<OfferedCourse> | null = await prisma.offeredCourse.delete({
    where: {
      id,
    },
  });

  return result;
};

const offeredCourseService = {
  create,
  getOfferedCourse,
  getSingleOfferedCourse,
  updateOfferedCourse,
  deleteOfferedCourse,
};

export default offeredCourseService;
