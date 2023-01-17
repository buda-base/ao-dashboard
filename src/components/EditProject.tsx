import React, { useState } from "react";
import debugFactory from "debug"
import { useParams } from "react-router";

import ProjectData from "../types/ProjectData";
import { Link } from "react-router-dom";

import json from "../json/UI.json"
import UIData from "../types/UIData"


const debug = debugFactory("ao:view")

export default function EditProject(props:{ projects: ProjectData[], index?:number }) {

  const params = useParams()
  const { projects } = props  
  let { index } = props  
  if(params.index) index = Number(params.index)

  const ui:UIData = json

  const uiMap = new Map(Object.entries(ui));

  debug(index, params, projects, ui)

  const [on, setOn] = useState("")

  const renderedUI: JSX.Element[] = [], links: JSX.Element[] = []
  uiMap.forEach( (v, k) => {
    let title = k[0].toUpperCase()+k.substring(1)
    if(v.label) title = v.label 
    renderedUI.push(<div className={'block'+(on === k ? " on":"")} onClick={(ev) => { 
        setOn(k)
        ev.stopPropagation();
      }}>
      <h2>{title}</h2>
    </div>)
    links.push(<span  className={(on === k ? " on":"")}  onClick={(ev) => { 
      setOn(k) 
      ev.stopPropagation();
    }}>{title}</span>)
  })

  return (
    <div className="edit-all" onClick={() => setOn("")}>
      <h1>AO Dashboard</h1>
      <div> 
        <nav>
          { projects.map( (p,i) => <Link to={"/edit/"+i} className={index == i ? "on" : ""}>
              <div>{p.title?.text}</div>
              <div>{p.description?.text}</div>
            </Link>
          )}
        </nav>
        <main>
          { renderedUI }
        </main>
        <nav>
          { links }
        </nav>
      </div>
    </div>
  )
}