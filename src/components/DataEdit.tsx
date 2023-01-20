import React, { useEffect, useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import debugFactory from "debug"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DatePicker } from "@mui/x-date-pickers";
import { useParams } from "react-router";

const debug = debugFactory("ao:n")


export function TypeEdit(props:{type:string, possible:any[], save:(type:string) => void}) {

  const { type = "other", possible = [], save } = props
  const [ val, setVal ] = useState(type)

  //debug("val:",type, possible, possible.findIndex( (v,i) => v.id === type || v === type) )

  useEffect( () => {
    if(val != type) { setVal(type) }
  }, [type])

  useEffect(() => {
    if(val != type) { save(val) }
  }, [val])  

  return (
    <div className="type">
      <TextField
        select
        variant="standard"
        value={ type }
        sx={{
          //'& .MuiInput-underline:before': { borderBottomColor: 'orange' },
          '& .MuiInput-underline:after': { borderBottomColor: '#d73449' },
        }}
        onChange={(ev) => setVal(ev.target.value)}
        >
          { possible.map( (p,i) => (<MenuItem key={i} value={p.id || p}>{p.label || (p[0].toUpperCase()+p.substring(1))}</MenuItem>))}
        </TextField>
    </div>
  )
}


export function NumberEdit(props:{n:number, save:(n:number) => void }) {

  const { n = 0, save } = props
  const [ val, setVal ] = useState(n || 0)

  //debug("val:",val+"?=?"+n)

  useEffect( () => {
    if(val != n) { setVal(n) }
  }, [n])

  useEffect(() => {
    if(val != n) { save(val) }
  }, [val])  

  return (
    <div className="number">
      <TextField
        onChange={(ev) => setVal(Number(ev.target.value))}
        type="number"
        variant="standard"
        //label={label}
        value={val}
        sx={{
          //'& .MuiInput-underline:before': { borderBottomColor: 'orange' },
          '& .MuiInput-underline:after': { borderBottomColor: '#d73449' },
        }}
        />
    </div>
  )
}

export function TextEdit(props:{
    text:string, 
    save:(text:string) => void, 
    onFocus: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>, 
    onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>,
    md: boolean,
    showMD: () => boolean
  }) {

  const { text = "", save, onFocus, onBlur, md, showMD } = props
  const [ val, setVal ] = useState(text || "")

  //debug("val:",val+"?=?"+text)

  useEffect( () => {
    if(val != text) { setVal(text) }
  }, [text])

  useEffect(() => {
    if(val != text) { save(val) }
  }, [val])
  
  return (
    <div className="text">
        <TextField
          onChange={(ev) => setVal(ev.target.value) }
          multiline={md}
          {...md ? {onFocus, onBlur}:{}}
          variant="standard"
          //label={label}
          value={val}
          sx={{
            //'& .MuiInput-underline:before': { borderBottomColor: 'orange' },
            '& .MuiInput-underline:after': { borderBottomColor: '#d73449' },
          }}
          />
      { md && showMD() && val && <div className="md"><ReactMarkdown remarkPlugins={[remarkGfm]}>{val}</ReactMarkdown></div> }
    </div>
  )
}

export function DateEdit(props:{
  date:string, 
  save:(date:string) => void, 
}) {

const { date = null, save } = props
const [ val, setVal ] = useState(date ? date : null)

//debug("val:", val+"?=?"+date) // date, localizedDate(date), dayjs(date.split("/").join("-")))

useEffect( () => {
  if(val != date) { setVal(date) }
}, [date])

useEffect(() => {
    if(val != null && val !== date) { save(val) }
}, [val])

return (
  <div className="date">
    <DatePicker    
      renderInput={(params) => (
        <TextField {...params} 
            variant="standard" 
            sx={{ '& .MuiInput-underline:after': { borderBottomColor: '#d73449' }  }}
          />
        )} 
        onChange={function (value: unknown, keyboardInputValue?: string | undefined): void {
          try {    
            const d = value as any
            const iso = d.$y+"/"+(1+d.$M)+"/"+d.$D                   
            setVal(iso)
          } catch(e) {
            console.warn("error in date",e)
            setVal("")
          }
        } } 
      value={val === "" ? null : val}                
    />
  </div>
  )
}