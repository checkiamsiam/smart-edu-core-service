import { OfferedCourseSection, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import AppError from "../../utils/customError.util";
import { ICreateOfferedCourseSection } from "./offeredCourseSection.interface";

const create = async (payload: ICreateOfferedCourseSection): Promise<OfferedCourseSection> => {
  const isExistOfferedCourseSection = await prisma.offeredCourse.findFirst({
    where: {
      id: payload.offeredCourseId,
    },
  });

  if (!isExistOfferedCourseSection) {
    throw new AppError("Offered Course does not exist!", httpStatus.BAD_REQUEST);
  }

  const result = await prisma.offeredCourseSection.create({
    data: {
      ...payload,
      semesterRegistrationId: isExistOfferedCourseSection.semesterRegistrationId,
    },
  });

  return result;
};

const getOfferedCourseSection = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<OfferedCourseSection>> => {
  const query: Prisma.OfferedCourseSectionFindManyArgs = {
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

  const [result, count] = await prisma.$transaction([prisma.offeredCourseSection.findMany(query), prisma.offeredCourseSection.count()]);

  return {
    data: result,
    total: count,
  };
};

const getSingleOfferedCourseSection = async (id: string, queryFeatures: IQueryFeatures): Promise<Partial<OfferedCourseSection> | null> => {
  const query: Prisma.OfferedCourseSectionFindUniqueArgs = {
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

  const result: Partial<OfferedCourseSection> | null = await prisma.offeredCourseSection.findUnique(query);

  return result;
};

const updateOfferedCourseSection = async (id: string, payload: Partial<OfferedCourseSection>): Promise<Partial<OfferedCourseSection> | null> => {
  const result: Partial<OfferedCourseSection> | null = await prisma.offeredCourseSection.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteOfferedCourseSection = async (id: string) => {
  const result: Partial<OfferedCourseSection> | null = await prisma.offeredCourseSection.delete({
    where: {
      id,
    },
  });

  return result;
};

const offeredCourseSectionService = {
  create,
  getOfferedCourseSection,
  getSingleOfferedCourseSection,
  updateOfferedCourseSection,
  deleteOfferedCourseSection,
};

export default offeredCourseSectionService;
