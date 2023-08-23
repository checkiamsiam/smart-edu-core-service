import { z } from "zod";

const createAcademicDeparmentReq = z.object({
  body: z
    .object({
      title: z.string({
        required_error: "Title is must required",
        invalid_type_error: "Title must be a string",
      }),
      academicFacultyId: z.string({
        required_error: "Academic Faculty is required",
      }),
    })
    .strict(),
});
const updateAcademicDepartmentReq = z.object({
  body: z.object({
    title: z.string().optional(),
    academicFacultyId: z.string().optional(),
  }),
});

const academicDepartmentValidation = {
  createAcademicDeparmentReq,
  updateAcademicDepartmentReq,
};

export default academicDepartmentValidation;
