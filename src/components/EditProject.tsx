import React, { useCallback, useEffect, useState } from "react";
import debugFactory from "debug"
import { Navigate, useNavigate, useParams } from "react-router";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from "react-router-dom";
import _ from "lodash"

import ProjectData from "../types/ProjectData";
import UIData from "../types/UIData"

import json from "../json/UI.json"
import Sparkline from "./Sparkline";
import { DateEdit, NumberEdit, RIDEdit, TextEdit, TypeEdit } from "./DataEdit";

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
  const [showAll, setShowAll] = useState<{[k:string]:boolean}>({}) // TODO: this should be an array {[string]:boolean}

  const [toSave, setToSave] = useState<ProjectData>(project)

  const navigate = useNavigate();
  
  /*
  let unmounting = false
  useEffect( () => {
    return () => {
      unmounting = true
    }
  }, [])
  */

  useEffect( () => {
    //debug("project:",JSON.stringify(project,null,3))
    setToSave(project)
  }, [ project ])

  useEffect( () => {
    if(on === "all") setUnique(false)
    else setUnique(true)
  }, [on])
  
  debug("edit:", index, toSave) //JSON.stringify(toSave,null,3), index) //index, params, projects, ui, on)

  const renderData = useCallback((d:string, i:number, t:any, k:string, v:any) => {   

    //debug("rd:",k,t) //,k,v);         

    const save = (key:string, val: number|string) => {
      const path = k.split("-")
      
      //debug("save:", key, val, k, i, v)

      let obj:any = _.cloneDeep(toSave), objSave = obj, prev
      for(const p of path) {
        //debug("p:",p,obj[p],obj,v.unique)          
        if(!obj[p]) {
          if(!v.unique) obj[p] = []
          else if(p !== "0") obj[p] = {}
        }
        if(!v.unique || p !== "0") obj = obj[p]
      }
      if(obj) { 
        //debug("obj:",obj, key, i)
        if(obj[key] && Array.isArray(obj[key]) && obj[key].length > i) { 
          obj[key][i] = val
        } else {
          obj[key] = val 
        }       
      }
      else {
        //debug("no obj")
      }
      if(!_.isEqual(objSave, toSave)) { 
        setToSave(objSave)
        replace(objSave, index)
      } else {
        //debug("equal:",JSON.stringify(toSave,null,3),JSON.stringify(objSave,null,3))
      }
    }

    const subElems:JSX.Element[] = []    
    if(d === "number") { 
      let n = t?.n
      if(!Array.isArray(n)) n = [ n ]
      subElems.push(<NumberEdit n={n} key={"n-"+k+"-project"+index} save={(newVal) => save("n", newVal)} />)
    } else if(d === "text") { 
      let text = t?.text
      const onFocus: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = (ev) => { setMD(k+"-"+i); ev.stopPropagation(); }
      const onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = (ev) => { setMD(""); ev.stopPropagation();   }
      const showMD = () => MD === k+"-"+i
      //debug("text:", t, text)
      if(!Array.isArray(text)) text = [ text ]
      subElems.push(<TextEdit text={text[i]} key={"text-"+k+"-project"+index} {...{onFocus, onBlur, showMD}} md={v.md} save={(newVal) => save("text", newVal)} />)            
    } else if(d === "date") {
      let date = t?.date            
      subElems.push(<DateEdit date={date} key={"date-"+k+"-project"+index} save={(newVal) => save("date", newVal)} />)
    } else if(d === "graph") {
      let data = t ;
      if(!data || !data.map) data = []
      let total = (toSave as any)[k.split("-")[0]]
      if(total?.total) total = total.total?.n 
      //debug("data:", data, total)
      if(total) {
        subElems.push(
          <div className="graph" key={"graph-"+k}>
            <Sparkline data={data.map( (val:{n:number, date:string}) => 100 * val.n / total)} width={300} height={200} total={total}/>
          </div> 
        )
      } 
    } else if(d === "RID") {
      let text = t?.text
      if(!Array.isArray(text)) text = [ text ]
      subElems.push(<RIDEdit text={text[i]} key={"RID-"+k+"-project"+index} save={(newVal) => save("text", newVal)} />)            
    } else if(Array.isArray(d)) {
      let type = t?.type
      //debug("type:",d,type)
      subElems.push(<TypeEdit type={type} possible={d as any[]} key={"type-"+k+"-project"+index} save={(newVal) => save("type", newVal)} />)
    }
    return subElems
  }, [MD, index, replace, toSave])

  
  const renderedUI: JSX.Element[] = [], links: JSX.Element[] = []
  let key = 0
  uiMap.forEach( (v, k) => {
    let hasHidden = false

    const add = (schema:string[], data:ProjectData, key = k) => {
      //console.log("add:", schema, data, key)
      const path = key.split("-")
      let obj:any = _.cloneDeep(toSave), objSave = obj
      for(const p of path) {
        //debug("p:",p,obj[p],obj)          
        if(!obj[p]) { 
          if(key.endsWith(p)) obj[p] = []
          else obj[p] = {}
        }
        obj = obj[p]
      }
      if(obj) { 
        //debug("obj:",obj, key)
        if(Array.isArray(obj)) {
          let newVal:any = {}
          for(let s of schema) {
            let val:string|number = ""
            if(s === "number") { val = 0; s = "n" }
            if(newVal[s] === undefined) newVal[s] = val 
            else { 
              if(!Array.isArray(newVal[s])) newVal[s] = [ newVal[s] ]
              newVal[s].push(val)
            }
          }
          obj.push(newVal)
        }
        //debug("obj!",obj)
      }
      else {
        //debug("no obj")
      }
      if(!_.isEqual(objSave, toSave)) { 
        setToSave(objSave)
        replace(objSave, index)
      } else {
        //debug("equal:",JSON.stringify(toSave,null,3),JSON.stringify(objSave,null,3))
      }
    }

    const remove = (data:ProjectData, key = k, idx: number) => {
      //console.log("remove:", data, key, idx)
      const path = key.split("-")
      let obj:any = _.cloneDeep(toSave), objSave = obj, prevObj = obj, prevK = ""
      for(const p of path) {
        prevObj = obj        
        debug(p,obj[p],obj)          
        if(obj[p]) { 
          prevK = p
          obj = obj[p]
        }
      }
      if(obj) { 
        debug("obj:", prevObj, prevK, obj, key, idx)
        if(Array.isArray(obj) && obj.length > idx && prevObj && prevObj[prevK]) {
          delete obj[idx]
          prevObj[prevK] = obj.filter(q => q)
        }
      }
      else {
        //debug("no obj")
      }
      if(!_.isEqual(objSave, toSave)) { 
        setToSave(objSave)
        replace(objSave, index)
      } else {
        //debug("equal:",JSON.stringify(toSave,null,3),JSON.stringify(objSave,null,3))
      }
    }

    let title = k[0].toUpperCase()+k.substring(1)
    if(v.label) title = v.label 
    const elems:JSX.Element[] = []
    if(v.data) { 
      let data = (toSave as any)[k]
      if((data || v.unique) && !Array.isArray(data)) data = [ data ]
      let n = 0
      if(data) for(const t of data) {          
        const subElems:JSX.Element[] = v.data.map(((n) => (d:string, i:number) => renderData(d,i,t,k+"-"+n,v))(n) )
        elems.push(<div className={"elem"+(!v.unique?" multi":"")} key={"elem-"+n}>
          {subElems}
          { !v.unique && <CloseIcon onClick={((n) => () => remove(data, k, n))(n)}/> }
        </div>)
        n ++
      }
    } else {
      for(const subK of Object.keys(v)) {
        if(["unique", "label"].includes(subK)) continue ;
        const w = v[subK]
        if(w.hidden) { 
          hasHidden = true ;
          //debug("hidden:",w,w.hidden,hasHidden, showAll, k)
          if(!showAll[k]) continue; 
        }
        let data = (toSave as any)[k]
        if(w.source && data && data[w.source]) { 
          data = [ data[w.source] ] 
        } else {
          if(!data) data = {}
          if(data && !data[subK]) {
            if(w.unique) data[subK] = {}
            else data[subK] = []
          } 
          data = data[subK]
        }
        if((data || w.unique) && !Array.isArray(data)) data = [ data ]
        let label = subK[0].toUpperCase()+subK.substring(1)
        if(w.label) label = w.label
        elems.push(<h4 key={"h4-"+k+"-"+subK}>{label}</h4>)
        let n = 1
        if(data) for(const t of data) {          
          const subElems:JSX.Element[] = w.data.map(((n) => (d:string, i:number) => renderData(d,i,t,k+"-"+subK+"-"+(n-1),w))(n) )
          elems.push(<div className={"elem"+(!w.unique?" multi":"")} key={"elem-"+n+"-"+subK+"-project"+index}>
            {subElems}
            { !w.unique &&<CloseIcon onClick={((n) => () => remove(data, k+"-"+subK, n-1))(n)}/> }
          </div>)
          n++
        } 
        if(!w.unique) elems.push(<div key="1"><span className="add-btn"  onClick={() => add(w.data, data, k+"-"+subK)}>Add <AddCircleOutlineIcon /></span></div>)
      }      
    }  
    renderedUI.push(<div key={"block-"+key} className={'block'+(on === k || on === "all"? " on":"")} onClick={(ev) => { 
        if(unique) { setOn(k) }
        if(!document.querySelector("body > [role='dialog']")) ev.stopPropagation();
      }}>
      <h2>{title}</h2>
      <div>{elems}</div>
      { hasHidden && <div key="1"><span className="hidden-btn" onClick={() => setShowAll({...showAll, [k]:!showAll[k]})}>{!showAll[k]?"Show hidden":"Hide"}</span></div>}
      { !v.unique && <div key="2"><span className="add-btn" onClick={() => add(v.data, (toSave as any)[k])}>Add <AddCircleOutlineIcon /></span></div>}
    </div>)
    links.push(<span key={"span-"+key} className={(on === k ? " on":"")}  onClick={(ev) => { 
      setOn(k) 
      ev.stopPropagation();
    }}>{title}</span>)
    key ++
  })
  
  const create = () => { 
    replace({} as ProjectData, -1);
    navigate("/edit/0");
  }

  return (
    <div className={"edit-all "+(!unique?" all-on":"")} onClick={() => { if(unique) setOn("") }} >
      <h1>AO Dashboard</h1>
      <div> 
        <nav key="projects">
          { projects.map( (p,i) => <Link key={i} to={"/edit/"+i} onClick={ev => ev.stopPropagation()} className={index == i ? "on" : ""} >
              <div key="1">{p.title?.text || "New Project"}</div>
              <div key="2">{p.description?.text || "No description"}</div>
            </Link>
          )}
          <div><span className="new-btn" onClick={create}>new project</span></div>
        </nav>
        <main>
          <header><div></div><Link to={"/#project-"+index}>view in list</Link></header>
          { renderedUI }
        </main>
        <nav key="links">
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