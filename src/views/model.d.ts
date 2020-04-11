export type Course = {
  uri: string,
  title: string,
  firstChapter?: string,
  secondChapter?: string,
  thirdChapter?: string,
}
export type Chapter = {
  uri: string,
  show: boolean,
  title: string,
  sequence: number,
  lessons?: Array<Lesson>
}
export type Lesson = {
  uri: string,
  title: string,
  mediaUri: string,
  codeQuestionUri: string,
  sequence: number,
  chapterUri: string
}
export type Section = {
  uri: string,
  title: string,
  sequence: number,
  content: string,
  kElementUri: string
}
export type CodeQuestion = {
  title: string,
  code?: string,
  content: string,
  testSetFilename: string,
  courseUri: string,
  kElementUris: Array<string>
  creator: string,
  date: string
}