import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import ViewProject from "./components/ViewProject"
import EditProject from "./components/EditProject"

import './App.css';

import example from "./json/example.json"
import example_b from "./json/example-bis.json"
import example_t from "./json/example-ter.json"
const projects = [ example, example_b, example_t ]

function App() {
  return (
    <div className="App">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          <Routes>
            <Route path="/" element={
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
                  {projects.map( (p,i) => <ViewProject project={p} key={i} index={i}/>)}
                </div>
              </div>
            }/>
            <Route path="/edit/" element={<Navigate to="/edit/0" />}/>
            <Route path="/edit/:index" element={<EditProject projects={projects} />} />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </div>
  );
}

export default App;
