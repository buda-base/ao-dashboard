import debugFactory from "debug"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import ProjectData from "../types/ProjectData"

const debug = debugFactory("ao:view")

export default function ViewProject(props:{ project:ProjectData }) {

  const { project } = props  
  const map = new Map(Object.entries(project));
  debug(project,map)

  const localizedDate = (date: string) => {
    const vals = date.split("/").map(d => Number(d))
    const ev = new Date(Date.UTC(vals[0],vals[1]-1,vals[2]))
    return ev.toLocaleDateString()
  }

  return <div className="project">
    <header>
      <div>
          <div className="desc gen">{project.description?.text}</div>
          <div className="staff gen">By: <div>{project.staff?.map(s => (
            <div>{s.text.map(t => <span>{t}</span>)}</div>
          ))}</div></div>
      </div>
      <h2>{project.title.text}</h2>
    </header>
    <main>
      { project.dates && <div className="dates gen">Dates: <div>{project.dates?.sort((b,a) => {
          if(a.date && !b.date) return -1;
          else if(!a.date && b.date) return 1;
          else if(a.date > b.date) return 1; 
          else if(a.date < b.date) return -1;
          return 0 
        }).map(d => (<div>
          <span>{d.text}</span>
          { d.date && <span>{localizedDate(d.date)}</span> }
        </div>))}</div>
      </div> }
      { project.links && <div className="links gen">Links: <div>{project.links?.map(l => (
        <div className="md"><ReactMarkdown remarkPlugins={[remarkGfm]}>{l.text}</ReactMarkdown></div>
      ))}</div>
      </div> }
      { project.contents && <div className="contents gen">Contents description:
        <div className="md"><ReactMarkdown remarkPlugins={[remarkGfm]}>{project.contents.text}</ReactMarkdown></div>        
      </div> }
      { project.scope && <div className="contents gen">Current work scope:
        <div className="md"><ReactMarkdown remarkPlugins={[remarkGfm]}>{project.scope.text}</ReactMarkdown></div>        
      </div> }
    </main>
  </div>
} 