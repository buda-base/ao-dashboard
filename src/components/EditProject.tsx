import React, { useState } from "react";
import debugFactory from "debug"
import { useParams } from "react-router";

import ProjectData from "../types/ProjectData";
import { Link } from "react-router-dom";

import json from "../json/UI.json"
import UIData from "../types/UIData"
import { TextField } from "@mui/material";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";


const debug = debugFactory("ao:view")

export default function EditProject(props:{ projects: ProjectData[], index?:number }) {

  const params = useParams()
  const { projects } = props  
  let { index } = props  
  if(params.index) index = Number(params.index)

  const ui:UIData = json
  const uiMap = new Map(Object.entries(ui));  
  const project:any = projects[index || 0]

  const [on, setOn] = useState("all")
  
  debug(index, params, projects, ui, on)

  const renderedUI: JSX.Element[] = [], links: JSX.Element[] = []
  uiMap.forEach( (v, k) => {
    let title = k[0].toUpperCase()+k.substring(1)
    if(v.label) title = v.label 
    const subElems:JSX.Element[] = []
    if(v.data) { 
      v.data.map( (d:string, i:number) => {            
        let data = project[k]
        if(d === "text") { 
          if(!Array.isArray(data)) data = [ data ]
          for(const t of data) {          
            let text = t?.text
            //debug("text:", t, text)
            if(!Array.isArray(text)) text = [ text ]
            subElems.push(<>
              <TextField
                multiline={true}
                variant="standard"
                //label={label}
                value={text[i] || ""}
              />
              { v.md && text[i] && <div className="md"><ReactMarkdown remarkPlugins={[remarkGfm]}>{text[i]}</ReactMarkdown></div> }
            </>)
          }
        } else if(d === "date") {
          subElems.push(<span>:date:</span>)
        }
      })
    }
    renderedUI.push(<div className={'block'+(on === k || on === "all"? " on":"")} onClick={(ev) => { 
        setOn(k)
        ev.stopPropagation();
      }}>
      <h2>{title}</h2>
      <div>{subElems}</div>
    </div>)
    links.push(<span  className={(on === k ? " on":"")}  onClick={(ev) => { 
      setOn(k) 
      ev.stopPropagation();
    }}>{title}</span>)
  })

  return (
    <div className="edit-all" onClick={() => setOn("")} >
      <h1>AO Dashboard</h1>
      <div> 
        <nav>
          { projects.map( (p,i) => <Link to={"/edit/"+i} onClick={ev => ev.stopPropagation()} className={index == i ? "on" : ""} >
              <div>{p.title?.text}</div>
              <div>{p.description?.text}</div>
            </Link>
          )}
        </nav>
        <main>
          <header><div></div><Link to={"/#project-"+index}>view in list</Link></header>
          { renderedUI }
        </main>
        <nav>
          { links }
          <span className={(on === "all" ? " on":"")}  onClick={(ev) => { 
            setOn("all") 
            ev.stopPropagation();
          }}>all</span>
        </nav>
      </div>
    </div>
  )
}