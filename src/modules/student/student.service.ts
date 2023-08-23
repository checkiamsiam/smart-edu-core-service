import { Prisma, Student } from "@prisma/client";
import prismaHelper from "../../helpers/prisma.helper";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";

const create = async (payload: Student): Promise<Student> => {
  const newStudent = await prisma.student.create({
    data: payload,
  });
  return newStudent;
};

const getStudents = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<Student>> => {
  const whereConditions: Prisma.StudentWhereInput = prismaHelper.findManyQueryHelper<Prisma.StudentWhereInput>(queryFeatures, {
    searchFields: ["id", "email", "contactNo", "firstName", "middleName", "lastName"],
  });

  const query: Prisma.StudentFindManyArgs = {
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

  const [result, count] = await prisma.$transaction([prisma.student.findMany(query), prisma.student.count({ where: whereConditions })]);

  return {
    data: result,
    total: count,
  };
};

const getSingleStudent = async (id: string, queryFeatures: IQueryFeatures): Promise<Partial<Student> | null> => {
  const query: Prisma.StudentFindUniqueArgs = {
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

  const result: Partial<Student> | null = await prisma.student.findUnique(query);

  return result;
};

const updateStudent = async (id: string, payload: Partial<Student>): Promise<Partial<Student> | null> => {
  const result: Partial<Student> | null = await prisma.student.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteStudent = async (id: string) => {
  const result: Partial<Student> | null = await prisma.student.delete({
    where: {
      id,
    },
  });

  return result;
};

const studentService = {
  create,
  getStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
};

export default studentService;
