import { z } from "zod";

const createAndUpdateBuildingReq = z.object({
  body: z.object({
    title: z.string({
      required_error: "Title is required",
    }),
  }),
});

export const buildingValidations = {
  createBuildingReq: createAndUpdateBuildingReq,
  updateBuildingReq: createAndUpdateBuildingReq,
};
