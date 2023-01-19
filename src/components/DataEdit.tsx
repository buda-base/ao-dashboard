import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import debugFactory from "debug"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from 'dayjs';

import { localizedDate } from "./ViewProject";

const debug = debugFactory("ao:n")



export function NumberEdit(props:{n:number, save:(n:number) => void}) {

  const { n, save } = props
  const [ val, setVal ] = useState(n)

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

  const { text, save, onFocus, onBlur, md, showMD } = props
  const [ val, setVal ] = useState(text)

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

const { date, save } = props
const [ val, setVal ] = useState(date)

debug("date:", date) //, localizedDate(date), dayjs(date.split("/").join("-")))

useEffect( () => {
  if(val != date) { setVal(date) }
}, [date])

useEffect(() => {
  if(val != date) { save((val as any)?.toISOString()?.split("T")[0].split("-")?.join("/")) }
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
          setVal(value as string)
        } } 
      value={val}                
    />
  </div>
  )
}