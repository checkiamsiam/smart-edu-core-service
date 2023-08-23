import { z } from "zod";

const createAcademicFacultyReq = z.object({
  body: z
    .object({
      title: z.string({
        required_error: "Title is must required",
        invalid_type_error: "Title must be a string",
      }),
    })
    .strict(),
});
const updateAcademicFacultyReq = z.object({
  body: z
    .object({
      title: z
        .string({
          required_error: "Title is must required",
          invalid_type_error: "Title must be a string",
        })
        .optional(),
    })
    .strict(),
});

const academicFacultyValidation = {
  createAcademicFacultyReq,
  updateAcademicFacultyReq,
};

export default academicFacultyValidation;
