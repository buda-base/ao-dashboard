import React from "react";
import debugFactory from "debug"
import { useParams } from "react-router";

import ProjectData from "../types/ProjectData";
//import ui from "./json/UI.json"

const debug = debugFactory("ao:view")

export default function EditProject(props:{ projects: ProjectData[], index?:number }) {

  const params = useParams()
  const { projects } = props  
  let { index } = props  
  if(params.index) index = Number(params.index)

  debug(index, params, projects)

  return (
    <div className="edit-all">
      <h1>AO Dashboard</h1>
      <div> 
    
      </div>
    </div>
  )
}