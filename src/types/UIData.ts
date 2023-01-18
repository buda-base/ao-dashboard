
interface UIDataContent {
  label?: string,
  data?: Array<string|{ id: string, label?: string}|Array<string|{ id: string, label?: string}>>,
  unique?:boolean,
  array?:boolean,
  hidden?:boolean,
  source?:string,
  md?:boolean,
}


export default interface UIData {
  title?: UIDataContent,
  description?: UIDataContent,
  staff?: UIDataContent,
  dates?: UIDataContent,
  links?: UIDataContent,
  contents?: UIDataContent,
  scope?: UIDataContent,
  status:{
    backlog?: UIDataContent,
    velocity?: UIDataContent,
    completion?: UIDataContent,
    impediments?: UIDataContent,
  }

}