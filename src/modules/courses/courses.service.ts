import { Course, Prisma } from "@prisma/client";
import prismaHelper from "../../helpers/prisma.helper";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import { ICourseCreateData } from "./course.interface";

const create = async (payload: ICourseCreateData): Promise<Course> => {
  const { preRequisiteCourses, ...data } = payload;
  const newCourse = await prisma.course.create({
    data,
  });
  if (preRequisiteCourses && preRequisiteCourses.length > 0) {
    const createManyData = preRequisiteCourses.map((el) => {
      return {
        courseId: newCourse.id,
        preRequisiteId: el.courseId,
      };
    });
    await prisma.courseToPrerequisite.createMany({
      data: createManyData,
    });
  }

  return newCourse;
};

const getCourses = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<Course>> => {
  const whereConditions: Prisma.CourseWhereInput = prismaHelper.findManyQueryHelper<Prisma.CourseWhereInput>(queryFeatures, {
    searchFields: ["title"],
  });

  const query: Prisma.CourseFindManyArgs = {
    include: {
      _count: true,
      preRequisite: {
        include: {
          preRequisite: true,
        },
      },
      preRequisiteFor: {
        include: {
          course: true,
        },
      },
    },
    where: whereConditions,
    skip: queryFeatures.skip,
    take: queryFeatures.limit,
    orderBy: queryFeatures.sort,
  };

  const [result, count] = await prisma.$transaction([prisma.course.findMany(query), prisma.course.count({ where: whereConditions })]);

  return {
    data: result,
    total: count,
  };
};

const getSingleCourse = async (id: string): Promise<Partial<Course> | null> => {
  const query: Prisma.CourseFindUniqueArgs = {
    include: {
      _count: true,
      preRequisite: {
        include: {
          preRequisite: true,
        },
      },
      preRequisiteFor: {
        include: {
          course: true,
        },
      },
    },
    where: {
      id,
    },
  };

  const result: Partial<Course> | null = await prisma.course.findUnique(query);

  return result;
};

const updateCourse = async (id: string, payload: Partial<Course>): Promise<Partial<Course> | null> => {
  const result: Partial<Course> | null = await prisma.course.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteCourse = async (id: string) => {
  const result: Partial<Course> | null = await prisma.course.delete({
    where: {
      id,
    },
  });

  return result;
};

const courseService = {
  create,
  getCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
};

export default courseService;
