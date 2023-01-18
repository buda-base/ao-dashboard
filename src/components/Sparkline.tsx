import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { line } from 'd3-shape';
import debugFactory from "debug"

const debug = debugFactory("ao:graph")

interface SparklineProps {
  data: number[];
  width: number;
  height: number;
  total: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) {
      return;
    }
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    var newData2 = [
      { x: 0, y: 0 },
      { x: 1, y: 10 },
      { x: 2, y: 10 },
      { x: 3, y: 50 },
    ];

    var newData = data.map((v,i) => ({x:i, y:v}));

    debug(newData, newData2)

    var x = d3.scaleLinear().range([0, width]).domain([0, newData.length - 1]);
    var y = d3.scaleLinear().range([height, 0]).domain([0, 100]);
    

    var ligne = line<{x:number, y:number}>()
      .x(function (d) {
        return x(d.x);
      })
      .y(function (d) {
        return y(d.y);
      });


    svg.append("linearGradient")                
      .attr("id", "line-gradient")            
      .attr("gradientUnits", "userSpaceOnUse")    
      .attr("x1", 0).attr("y1", y(0))         
      .attr("x2", 0).attr("y2", y(100))      
      .selectAll("stop")                      
      .data([                             
          {offset: "0%", color: "red"},       
          {offset: "20%", color: "red"},  
          {offset: "35%", color: "#ffbb00"},        
          {offset: "60%", color: "#ffbb00"},        
          {offset: "70%", color: "lawngreen"},    
          {offset: "100%", color: "lawngreen"}    
      ])                  
      .enter()
      .append("stop")         
          .attr("offset", function(d) { return d.offset; })   
          .attr("stop-color", function(d) { return d.color; });   
        
    svg
      .append("path")
      .attr("d", ligne(newData))
      .attr("stroke-width", 2)
      .attr("stroke", "url(#line-gradient)")
      .attr("fill", "none");
        
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
}



export default Sparkline