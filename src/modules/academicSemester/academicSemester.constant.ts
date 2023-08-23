import { TAcademicSemesterCodes, TAcademicSemesterTitles } from "./academicSemester.interface";

export const academicSemesterTitles: TAcademicSemesterTitles[] = ["Autumn", "Summer", "Fall"];

export const academicSemesterCodes: TAcademicSemesterCodes[] = ["01", "02", "03"];

export const academicSemesterTitleCodeMapper: {
  [key: string]: string;
} = {
  Autumn: "01",
  Summer: "02",
  Fall: "03",
};
