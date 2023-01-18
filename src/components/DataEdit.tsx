import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import debugFactory from "debug"

const debug = debugFactory("ao:n")

export function NumberEdit(props:{n:number, save:(n:number) => void}) {

  const { n, save } = props

  const [ val, setVal ] = useState(n)

  useEffect( () => {
    if(val != n) { 
      setVal(n)
    }
  }, [n])

  debug(val,n)

  /*
  useEffect(() => {
    if(val != n) {
      save(val)
    }
  }, [val])
  */

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