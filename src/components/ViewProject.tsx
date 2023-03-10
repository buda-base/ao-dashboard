import debugFactory from "debug"
import ReactMarkdown from 'react-markdown'
import { Link } from "react-router-dom"
import remarkGfm from 'remark-gfm'
import SettingsIcon from '@mui/icons-material/Settings';

import ProjectData from "../types/ProjectData"
import Sparkline from "./Sparkline"
import { useLayoutEffect } from "react";

const debug = debugFactory("ao:view")

export function localizedDate(date: string) {
  //debug("date:",date)
  const vals = date.split("/").map(d => Number(d))
  const ev = new Date(Date.UTC(vals[0],vals[1]-1,vals[2]))
  return ev.toLocaleDateString()
}

export default function ViewProject(props:{ project:ProjectData, index: number }) {

  const { project, index } = props  

  const total = project.status?.total?.n || 100
  const data = project.status?.completion?.map(val => 100 * val.n / total) || []

  //debug("data:",data)

  useLayoutEffect( () => {
    document.querySelectorAll(".md a").forEach( (value:Element) => {
        value.setAttribute("target","_blank")
    })
  })

  return <div className="project" id={"project-"+index} /*onClick={() => navigate("/edit/" + index) }*/ >
    <header>
      <div>
          <div className="desc gen"><div>Description:</div> {project.description?.text} 
      
          </div>
          { project.staff && <div className="staff gen">By: <div>{project.staff?.map(s => (
            <div>{s.text.map(t => <span>{t}</span>)}</div>
          ))}</div></div> }
      </div>
      <h2><Link to={"/edit/" + index}><SettingsIcon />{project.title?.text}</Link>
        <br/>
        { project.description?.type && <span>{project.description?.type}</span> }
      </h2>
    </header>
    <main>
      <div>
        { project.dates && <div className="dates gen with-dates">Dates: { project.dates && <div>{project.dates?.sort((b,a) => {
          if(a.date && !b.date) return -1;
            else if(!a.date && b.date) return 1;
            else if(a.date && b.date) { 
              if(a.date > b.date) return 1; 
              else if(a.date < b.date) return -1;
            }
            return 0 
          }).map(d => (<div>
            <span>{d.text}</span>
            { d.date && <span>{localizedDate(d.date)}</span> }
          </div>))}</div>
        }</div> }
        { project.links && <div className="links gen">Links: <div>{project.links?.map(l => (
          <div className="md" /*onClick={ev => ev.stopPropagation()}*/><ReactMarkdown remarkPlugins={[remarkGfm]}>{l.text}</ReactMarkdown></div>
          ))}</div>
        </div> }
        { project.contents && <div className="contents gen">Contents description:
          <div className="md" /*onClick={ev => ev.stopPropagation()}*/><ReactMarkdown remarkPlugins={[remarkGfm]}>{project.contents.text}</ReactMarkdown></div>        
        </div> }
        { project.scope && <div className="contents gen">Current work scope:
          <div className="md"  /*onClick={ev => ev.stopPropagation()}*/><ReactMarkdown remarkPlugins={[remarkGfm]}>{project.scope.text}</ReactMarkdown></div>        
        </div> }
        { project.status && <div className="status gen with-dates">Status:
          { project.status.backlog && <div>
            <div>Backlog size: </div>
              <div>
                <span>{project.status.backlog.text}</span>
                { project.status.backlog.date && <span>{localizedDate(project.status.backlog.date)}</span> }
              </div>
            </div> }
            { project.status.impediments && <div>
              <div>Impediments: </div>
              <ol>{ project.status.impediments.map(l => (
                <li className="md"><ReactMarkdown remarkPlugins={[remarkGfm]}>{l.text}</ReactMarkdown></li>
                ))}</ol>
            </div> }
          </div> }
        </div>
        { project.status && project.status.total && project.status.completion?.length && <div className="graph">
            <Sparkline data={data} width={250} height={150} total={project.status.total.n}/>
        </div> }
    </main>
  </div>
} 