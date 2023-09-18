import { Prisma, PrismaClient, StudentSemesterPayment } from "@prisma/client";
import { DefaultArgs, PrismaClientOptions } from "@prisma/client/runtime/library";
import prismaHelper from "../../helpers/prisma.helper";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";

const createSemesterPayment = async (
  prismaClient: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  payload: {
    studentId: string;
    academicSemesterId: string;
    totalPaymentAmount: number;
  }
) => {
  const isExist = await prismaClient.studentSemesterPayment.findFirst({
    where: {
      student: {
        id: payload.studentId,
      },
      academicSemester: {
        id: payload.academicSemesterId,
      },
    },
  });

  if (!isExist) {
    const dataToInsert = {
      studentId: payload.studentId,
      academicSemesterId: payload.academicSemesterId,
      fullPaymentAmount: payload.totalPaymentAmount,
      partialPaymentAmount: payload.totalPaymentAmount * 0.5,
      totalDueAmount: payload.totalPaymentAmount,
      totalPaidAmount: 0,
    };

    await prismaClient.studentSemesterPayment.create({
      data: dataToInsert,
    });
  }
};

const getStudentSemesterPayments = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<StudentSemesterPayment>> => {
  const whereConditions: Prisma.StudentSemesterPaymentWhereInput = prismaHelper.findManyQueryHelper<Prisma.StudentSemesterPaymentWhereInput>(
    queryFeatures,
    {
      searchFields: [],
      relationalFields: {
        academicSemesterId: "academicSemester",
        studentId: "student",
      },
    }
  );

  const query: Prisma.StudentSemesterPaymentFindManyArgs = {
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
    prisma.studentSemesterPayment.findMany(query),
    prisma.studentSemesterPayment.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

export const studentSemesterPaymentService = {
  createSemesterPayment,
  getStudentSemesterPayments,
};
