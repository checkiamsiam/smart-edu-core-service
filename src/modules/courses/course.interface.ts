export type ICourse = {
  title: string,
  code: string,
  credits: number,
  preRequisiteCourses?: IPrerequisiteCourseRequest[]
}

export type IPrerequisiteCourseRequest = {
  courseId: string,
  isRemove?: null
}