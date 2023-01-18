import React, { useEffect, useState } from "react";
import debugFactory from "debug"
import { useParams } from "react-router";
import { TextField } from "@mui/material";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { DatePicker } from "@mui/x-date-pickers";
import { Link } from "react-router-dom";

import ProjectData from "../types/ProjectData";
import UIData from "../types/UIData"

import json from "../json/UI.json"
import Sparkline from "./Sparkline";

const debug = debugFactory("ao:edit")

export default function EditProject(props:{ projects: ProjectData[], index?:number }) {

  const params = useParams()
  const { projects } = props  
  let { index } = props  
  if(params.index) index = Number(params.index)

  const ui:UIData = json
  const uiMap = new Map(Object.entries(ui));  
  const project:any = projects[index || 0]

  const [on, setOn] = useState("all")
  const [unique, setUnique] = useState(false)
  const [MD, setMD] = useState("")
  const [showAll, setShowAll] = useState(false)

  useEffect( () => {
    if(on === "all") setUnique(false)
    else setUnique(true)
  }, [on])
  
  debug(index, params, projects, ui, on)

  const renderData = (d:string, i:number, t:any, k:string, v:any) => {   
    //debug("rd:",d,i,t,k,v);         
    const subElems:JSX.Element[] = []
    
    if(d === "number") { 
      let n = t?.n
      if(!Array.isArray(n)) n = [ n ]
      subElems.push(<div className="number">

        <TextField
          type="number"
          variant="standard"
          //label={label}
          value={n[i] || 0}
          sx={{
            //'& .MuiInput-underline:before': { borderBottomColor: 'orange' },
            '& .MuiInput-underline:after': { borderBottomColor: '#d73449' },
          }}
          />
      </div>)
    } else if(d === "text") { 
      let text = t?.text
      const onFocus: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = (ev) => { setMD(k+"-"+i); ev.stopPropagation(); }
      const onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = (ev) => { setMD(""); ev.stopPropagation();   }
      //debug("text:", t, text)
      if(!Array.isArray(text)) text = [ text ]
      subElems.push(<div className="text">

        <TextField
          {...v.md ? {onFocus, onBlur}:{}}
          multiline={v.md}
          variant="standard"
          //label={label}
          value={text[i] || ""}
          sx={{
            //'& .MuiInput-underline:before': { borderBottomColor: 'orange' },
            '& .MuiInput-underline:after': { borderBottomColor: '#d73449' },
          }}
          />
        { v.md && MD === k+"-"+i && text[i] && <div className="md"><ReactMarkdown remarkPlugins={[remarkGfm]}>{text[i]}</ReactMarkdown></div> }
      </div>)
    } else if(d === "date") {
      let date = t?.date            
      subElems.push(<div className="date">
        <DatePicker
          //value={value}
          /*
          onChange={(newValue) => {
            setValue(newValue);
          }}
          */                
          renderInput={(params) => (
              <TextField {...params} 
                variant="standard" 
                sx={{ '& .MuiInput-underline:after': { borderBottomColor: '#d73449' }  }}
              />
            )} 
            onChange={function (value: unknown, keyboardInputValue?: string | undefined): void {
              throw new Error("Function not implemented.");
            } } 
          value={date}                
          />
        </div>
      )
    } else if(d === "graph") {
      let data = t ;
      let total = project[k.split("-")[0]]
      if(total.total) total = total.total.n 
      //debug("data:", data, total)
      if(total) {
        subElems.push(
          <div className="graph">
            <Sparkline data={data.map( (val:{n:number, date:string}) => 100 * val.n / total)} width={300} height={200} total={total}/>
          </div> 
        )

      }

      //}
      // { project.status && project.status.total && project.status.completion?.length && 
        

    }
    return subElems
  }

  const renderedUI: JSX.Element[] = [], links: JSX.Element[] = []
  let hasHidden = false
  uiMap.forEach( (v, k) => {
    let title = k[0].toUpperCase()+k.substring(1)
    if(v.label) title = v.label 
    const elems:JSX.Element[] = []
    if(v.data) { 
      let data = project[k]
      if(!Array.isArray(data)) data = [ data ]
      for(const t of data) {          
        const subElems:JSX.Element[] = v.data.map((d:string, i:number) => renderData(d,i,t,k,v) )
        elems.push(<div className={"elem"+(!v.unique?" multi":"")}>{subElems}</div>)
      }
    } else {
      for(const subK of Object.keys(v)) {
        const w = v[subK]
        if(w.hidden) { 
          hasHidden = true ;
          if(!showAll) continue; 
        }
        let data = project[k]
        if(w.source && data[w.source]) { 
          data = [ data[w.source] ] 
        } else {
          if(data && !data[subK]) continue
          data = data[subK]
        }
        if(!Array.isArray(data)) data = [ data ]
        let label = subK[0].toUpperCase()+subK.substring(1)
        if(w.label) label = w.label
        let n = 0
        elems.push(<h4>{label}</h4>)
        for(const t of data) {          
          const subElems:JSX.Element[] = w.data.map((d:string, i:number) => renderData(d,i,t,k+"-"+subK+"-"+n,w) )
          elems.push(<div className={"elem"+(!w.unique?" multi":"")}>{subElems}</div>)
          n++
        } 
      }      
    }
    renderedUI.push(<div className={'block'+(on === k || on === "all"? " on":"")} onClick={(ev) => { 
        if(unique) { setOn(k) }
        if(!document.querySelector("body > [role='dialog']")) ev.stopPropagation();
      }}>
      <h2>{title}</h2>
      <div>{elems}</div>
      { hasHidden && <div><span className="hidden-btn" onClick={() => setShowAll(!showAll)}>{!showAll?"Show hidden":"Hide"}</span></div>}
    </div>)
    links.push(<span className={(on === k ? " on":"")}  onClick={(ev) => { 
      setOn(k) 
      ev.stopPropagation();
    }}>{title}</span>)
  })

  return (
    <div className={"edit-all "+(!unique?" all-on":"")} onClick={() => { if(unique) setOn("") }} >
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