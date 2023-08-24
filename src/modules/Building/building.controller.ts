import { Building } from "@prisma/client";
import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import AppError from "../../utils/customError.util";
import sendResponse from "../../utils/sendResponse.util";
import buildingServices from "./building.service";

const createBuilding: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const body: Building = req.body;
  const result = await buildingServices.create(body);
  sendResponse<Building>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Building created successfully",
    data: result,
  });
});

const getBuildings: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const getResult = await buildingServices.getBuildings(req.queryFeatures);
  sendResponse<Partial<Building>[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: getResult.data,
    meta: {
      page: req.queryFeatures.page,
      limit: req.queryFeatures.limit,
      total: getResult.total || 0,
    },
  });
});
const getSingleBuilding: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const result: Partial<Building> | null = await buildingServices.getSingleBuilding(id, req.queryFeatures);
  if (!result) {
    throw new AppError("Building Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<Building>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const updateBuilding: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const updatePayload: Partial<Building> = req.body;
  const result: Partial<Building> | null = await buildingServices.updateBuilding(id, updatePayload);

  if (!result) {
    throw new AppError("Building Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<Building>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document Updated Successfully",
    data: result,
  });
});
const deleteBuilding: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;

  const result = await buildingServices.deleteBuilding(id);

  if (!result) {
    throw new AppError("Building Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<Building>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Building Deleted Successfully",
  });
});

const buildingController = {
  createBuilding,
  getBuildings,
  getSingleBuilding,
  updateBuilding,
  deleteBuilding,
};
export default buildingController;
