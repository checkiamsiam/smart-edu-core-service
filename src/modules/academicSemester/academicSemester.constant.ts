import {
  TAcademicSemesterCodes,
  TAcademicSemesterTitles,
} from "./academicSemester.interface";

export const academicSemesterTitles: TAcademicSemesterTitles[] = [
  "Autumn",
  "Summer",
  "Fall",
];

export const academicSemesterCodes: TAcademicSemesterCodes[] = [
  "01",
  "02",
  "03",
];

export const academicSemesterTitleCodeMapper: {
  [key: string]: string;
} = {
  Autumn: "01",
  Summer: "02",
  Fall: "03",
};

export const EVENT_ACADEMIC_SEMESTER_CREATED = "academic-semester.created";
export const EVENT_ACADEMIC_SEMESTER_UPDATED = "academic-semester.updated";
export const EVENT_ACADEMIC_SEMESTER_DELETED = "academic-semester.deleted";
