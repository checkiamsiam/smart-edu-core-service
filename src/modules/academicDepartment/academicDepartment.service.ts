import { AcademicDepartment, Prisma } from "@prisma/client";
import prismaHelper from "../../helpers/prisma.helper";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";

const create = async (payload: AcademicDepartment): Promise<AcademicDepartment> => {
  const newAd = await prisma.academicDepartment.create({
    data: payload,
  });
  return newAd;
};

const getAcademicDepartments = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<AcademicDepartment>> => {
  const whereConditions: Prisma.AcademicDepartmentWhereInput = prismaHelper.findManyQueryHelper<Prisma.AcademicDepartmentWhereInput>(queryFeatures, {
    searchFields: ["title"],
    relationalFields: { academicFacultyId: "academicFaculty" },
  });

  const query: Prisma.AcademicDepartmentFindManyArgs = {
    where: whereConditions,
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
  const [result, count] = await prisma.$transaction([
    prisma.academicDepartment.findMany(query),
    prisma.academicDepartment.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

const getSingleAcademicDepartment = async (id: string, queryFeatures: IQueryFeatures): Promise<Partial<AcademicDepartment> | null> => {
  const query: Prisma.AcademicDepartmentFindUniqueArgs = {
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

  const result: Partial<AcademicDepartment> | null = await prisma.academicDepartment.findUnique(query);

  return result;
};

const updateAcademicDepartment = async (id: string, payload: Partial<AcademicDepartment>): Promise<Partial<AcademicDepartment> | null> => {
  const result: Partial<AcademicDepartment> | null = await prisma.academicDepartment.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteAcademicDepartment = async (id: string) => {
  const result: Partial<AcademicDepartment> | null = await prisma.academicDepartment.delete({
    where: {
      id,
    },
  });

  return result;
};

const academicFacultyService = {
  create,
  getAcademicDepartments,
  getSingleAcademicDepartment,
  updateAcademicDepartment,
  deleteAcademicDepartment,
};

export default academicFacultyService;
