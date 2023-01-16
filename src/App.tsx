import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField } from '@mui/material';

import ViewProject from "./components/ViewProject"

import './App.css';

import example from "./json/example.json"
import example_b from "./json/example-bis.json"
import example_t from "./json/example-ter.json"
const projects = [ example, example_b, example_t ]

function App() {
  return (
    <div className="App">
      <div className="view-all">
        <h1>AO Dashboard</h1>
        <header>
          <TextField 
            disabled
            placeholder="Filter projects" 
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </header>
        <div>
          {projects.map( (p,i) => <ViewProject project={p} key={i} />)}
        </div>
      </div>
    </div>
  );
}

export default App;
