
export default interface ProjectData {
  title: { text: string },
  description?: { text: string, type: string },
  staff?: { text: string[] }[],
  dates?: { text: string, date:string }[],
  links?: { text: string }[],
  contents?: { text: string},
  scope?: { text: string},
}