import { CourseFaculty, Faculty, Prisma } from "@prisma/client";
import prismaHelper from "../../helpers/prisma.helper";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";

const create = async (payload: Faculty): Promise<Faculty> => {
  const newFaculty = await prisma.faculty.create({
    data: payload,
  });
  return newFaculty;
};

const getFaculties = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<Faculty>> => {
  const whereConditions: Prisma.FacultyWhereInput = prismaHelper.findManyQueryHelper<Prisma.FacultyWhereInput>(queryFeatures, {
    searchFields: ["id", "email", "contactNo", "firstName", "middleName", "lastName"],
  });

  const query: Prisma.FacultyFindManyArgs = {
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

  const [result, count] = await prisma.$transaction([prisma.faculty.findMany(query), prisma.faculty.count({ where: whereConditions })]);

  return {
    data: result,
    total: count,
  };
};

const getSingleFaculty = async (id: string, queryFeatures: IQueryFeatures): Promise<Partial<Faculty> | null> => {
  const query: Prisma.FacultyFindUniqueArgs = {
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

  const result: Partial<Faculty> | null = await prisma.faculty.findUnique(query);

  return result;
};

const updateFaculty = async (id: string, payload: Partial<Faculty>): Promise<Partial<Faculty> | null> => {
  const result: Partial<Faculty> | null = await prisma.faculty.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteFaculty = async (id: string) => {
  const result: Partial<Faculty> | null = await prisma.faculty.delete({
    where: {
      id,
    },
  });

  return result;
};

const assignCourses = async (id: string, payload: string[]): Promise<CourseFaculty[]> => {
  await prisma.courseFaculty.createMany({
    data: payload.map((courseId) => ({
      facultyId: id,
      courseId: courseId,
    })),
  });

  const assignCoursesData = await prisma.courseFaculty.findMany({
    where: {
      facultyId: id,
    },
    include: {
      course: true,
    },
  });

  return assignCoursesData;
};

const removeCourses = async (id: string, payload: string[]): Promise<CourseFaculty[] | null> => {
  await prisma.courseFaculty.deleteMany({
    where: {
      facultyId: id,
      courseId: {
        in: payload,
      },
    },
  });

  const assignCoursesData = await prisma.courseFaculty.findMany({
    where: {
      facultyId: id,
    },
    include: {
      course: true,
    },
  });

  return assignCoursesData;
};

const facultyService = {
  create,
  getFaculties,
  getSingleFaculty,
  updateFaculty,
  deleteFaculty,
  assignCourses,
  removeCourses,
};

export default facultyService;
