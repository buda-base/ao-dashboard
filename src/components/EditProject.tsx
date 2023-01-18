import React, { useCallback, useEffect, useState } from "react";
import debugFactory from "debug"
import { useParams } from "react-router";
import { TextField } from "@mui/material";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { DatePicker } from "@mui/x-date-pickers";
import { Link } from "react-router-dom";
import _ from "lodash"

import ProjectData from "../types/ProjectData";
import UIData from "../types/UIData"

import json from "../json/UI.json"
import Sparkline from "./Sparkline";
import { NumberEdit } from "./DataEdit";

const debug = debugFactory("ao:edit")

export default function EditProject(props:{ projects: ProjectData[], index?:number, replace: (p:ProjectData, i:number) => void }) {

  const params = useParams()
  const { projects, replace } = props  
  let { index = 0 } = props  
  if(params.index) index = Number(params.index)

  const ui:UIData = json
  const uiMap = new Map(Object.entries(ui));  
  const project:ProjectData = projects[index || 0]

  const [on, setOn] = useState("all")
  const [unique, setUnique] = useState(false)
  const [MD, setMD] = useState("")
  const [showAll, setShowAll] = useState(false)

  const [toSave, setToSave] = useState<ProjectData>(project)

  /*
  let unmounting = false
  useEffect( () => {
    return () => {
      unmounting = true
    }
  }, [])
  */

  useEffect( () => {
    debug("project:",JSON.stringify(project,null,3))
    setToSave(project)
  }, [ project ])

  useEffect( () => {
    if(on === "all") setUnique(false)
    else setUnique(true)
  }, [on])
  
  //debug("edit:", JSON.stringify(toSave,null,3), index) //index, params, projects, ui, on)

  const renderData = useCallback((d:string, i:number, t:any, k:string, v:any) => {   

    debug("rd:",k,t) //,k,v);         

    const save = (key:string, val: number) => {
      const path = k.split("-")
      let obj:any = _.cloneDeep(toSave), objSave = obj
      for(const p of path) {
        debug(p,obj[p],obj)          
        if(obj[p]) obj = obj[p]
      }
      if(obj) obj[key] = val 
      if(!_.isEqual(objSave, toSave)) replace(objSave, index)
    }

    const subElems:JSX.Element[] = []    
    if(d === "number") { 
      let n = t?.n
      if(!Array.isArray(n)) n = [ n ]
      subElems.push(<NumberEdit n={n} key={"n-"+k+"-project"+index} save={(val) => save("n", val)}/>)
    } else if(d === "text") { 
      let text = t?.text
      const onFocus: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = (ev) => { setMD(k+"-"+i); ev.stopPropagation(); }
      const onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = (ev) => { setMD(""); ev.stopPropagation();   }
      //debug("text:", t, text)
      if(!Array.isArray(text)) text = [ text ]
      subElems.push(<div className="text" key={"text-"+k}>

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
      subElems.push(<div className="date" key={"date-"+k}>
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
      let total = (toSave as any)[k.split("-")[0]]
      if(total.total) total = total.total.n 
      //debug("data:", data, total)
      if(total) {
        subElems.push(
          <div className="graph" key={"graph-"+k}>
            <Sparkline data={data.map( (val:{n:number, date:string}) => 100 * val.n / total)} width={300} height={200} total={total}/>
          </div> 
        )

      }

      //}
      // { project.status && project.status.total && project.status.completion?.length && 
        

    }
    return subElems
  }, [MD, index, replace, toSave])

  const renderedUI: JSX.Element[] = [], links: JSX.Element[] = []
  let hasHidden = false, key = 0
  uiMap.forEach( (v, k) => {
    let title = k[0].toUpperCase()+k.substring(1)
    if(v.label) title = v.label 
    const elems:JSX.Element[] = []
    if(v.data) { 
      let data = (toSave as any)[k]
      if(!Array.isArray(data)) data = [ data ]
      let n = 0
      for(const t of data) {          
        const subElems:JSX.Element[] = v.data.map((d:string, i:number) => renderData(d,i,t,k,v) )
        elems.push(<div className={"elem"+(!v.unique?" multi":"")} key={"elem-"+n}>{subElems}</div>)
        n ++
      }
    } else {
      for(const subK of Object.keys(v)) {
        const w = v[subK]
        if(w.hidden) { 
          hasHidden = true ;
          if(!showAll) continue; 
        }
        let data = (toSave as any)[k]
        if(w.source && data && data[w.source]) { 
          data = [ data[w.source] ] 
        } else {
          if(!data || data && !data[subK]) continue
          data = data[subK]
        }
        if(!Array.isArray(data)) data = [ data ]
        let label = subK[0].toUpperCase()+subK.substring(1)
        if(w.label) label = w.label
        elems.push(<h4 key={"h4-"+k+"-"+subK}>{label}</h4>)
        let n = 1
        for(const t of data) {          
          const subElems:JSX.Element[] = w.data.map((d:string, i:number) => renderData(d,i,t,k+"-"+subK+"-"+n,w) )
          elems.push(<div className={"elem"+(!w.unique?" multi":"")} key={"elem-"+n+"-"+subK+"-project"+index}>{subElems}</div>)
          n++
        } 
      }      
    }  
    renderedUI.push(<div key={"block-"+key} className={'block'+(on === k || on === "all"? " on":"")} onClick={(ev) => { 
        if(unique) { setOn(k) }
        if(!document.querySelector("body > [role='dialog']")) ev.stopPropagation();
      }}>
      <h2>{title}</h2>
      <div>{elems}</div>
      { hasHidden && <div><span className="hidden-btn" onClick={() => setShowAll(!showAll)}>{!showAll?"Show hidden":"Hide"}</span></div>}
    </div>)
    links.push(<span key={"span-"+key} className={(on === k ? " on":"")}  onClick={(ev) => { 
      setOn(k) 
      ev.stopPropagation();
    }}>{title}</span>)
    key ++
  })

  return (
    <div className={"edit-all "+(!unique?" all-on":"")} onClick={() => { if(unique) setOn("") }} >
      <h1>AO Dashboard</h1>
      <div> 
        <nav>
          { projects.map( (p,i) => <Link key={i} to={"/edit/"+i} onClick={ev => ev.stopPropagation()} className={index == i ? "on" : ""} >
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