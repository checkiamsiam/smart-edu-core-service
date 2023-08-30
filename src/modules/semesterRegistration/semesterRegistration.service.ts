import { Prisma, SemesterRegistration, SemesterRegistrationStatus } from "@prisma/client";
import httpStatus from "http-status";
import prismaHelper from "../../helpers/prisma.helper";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import AppError from "../../utils/customError.util";

const create = async (data: SemesterRegistration): Promise<SemesterRegistration> => {
  const isAnySemesterRegUpcomingOrOngoing = await prisma.semesterRegistration.findFirst({
    where: {
      OR: [
        {
          status: SemesterRegistrationStatus.upcoming,
        },
        {
          status: SemesterRegistrationStatus.ongoing,
        },
      ],
    },
  });

  if (isAnySemesterRegUpcomingOrOngoing) {
    throw new AppError(`There is already an ${isAnySemesterRegUpcomingOrOngoing.status} registration.`, httpStatus.BAD_REQUEST);
  }

  const result = await prisma.semesterRegistration.create({
    data,
  });

  return result;
};

const getSemesterRegistrations = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<SemesterRegistration>> => {
  const whereConditions: Prisma.SemesterRegistrationWhereInput = prismaHelper.findManyQueryHelper<Prisma.SemesterRegistrationWhereInput>(
    queryFeatures,
    {
      searchFields: ["academicSemesterId", "status"],
      relationalFields: {
        academicSemesterId: "academicSemester",
      },
    }
  );

  const query: Prisma.SemesterRegistrationFindManyArgs = {
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

  const [result, count] = await prisma.$transaction([
    prisma.semesterRegistration.findMany(query),
    prisma.semesterRegistration.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

const getSingleSemesterRegistration = async (id: string, queryFeatures: IQueryFeatures): Promise<Partial<SemesterRegistration> | null> => {
  const query: Prisma.SemesterRegistrationFindUniqueArgs = {
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

  const result: Partial<SemesterRegistration> | null = await prisma.semesterRegistration.findUnique(query);

  return result;
};

const update = async (id: string, payload: Partial<SemesterRegistration>): Promise<SemesterRegistration> => {
  const isExist = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new AppError("Data not found!", httpStatus.BAD_REQUEST);
  }

  if (payload.status && isExist.status === SemesterRegistrationStatus.upcoming && payload.status !== SemesterRegistrationStatus.ongoing) {
    throw new AppError("Can only move from UPCOMING to ONGOING", httpStatus.BAD_REQUEST);
  }

  if (payload.status && isExist.status === SemesterRegistrationStatus.ongoing && payload.status !== SemesterRegistrationStatus.ended) {
    throw new AppError("Can only move from ONGOING to ENDED", httpStatus.BAD_REQUEST);
  }

  const result = await prisma.semesterRegistration.update({
    where: {
      id,
    },
    data: payload,
    include: {
      academicSemester: true,
    },
  });

  return result;
};

const deleteSemesterRegistration = async (id: string): Promise<SemesterRegistration> => {
  const result = await prisma.semesterRegistration.delete({
    where: {
      id,
    },
    include: {
      academicSemester: true,
    },
  });
  return result;
};

export const semesterRegistrationService = {
  create,
  getSemesterRegistrations,
  getSingleSemesterRegistration,
  update,
  deleteSemesterRegistration,
};