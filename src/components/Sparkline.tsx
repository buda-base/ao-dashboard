import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { min, max } from 'd3-array';
import { Selection } from 'd3-selection';
import { line } from 'd3-shape';

interface SparklineProps {
  data: number[];
  width: number;
  height: number;
  colorFunction: (d: number) => string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, width, height, colorFunction }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) {
      return;
    }
    const svg = d3.select(svgRef.current);

    // Scale de x
    const xScale = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([0, width]);

    // Scale de y
    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Create a linear gradient
    var colorRange = [ '#1a9641', '#a6d96a', '#ffffbf', '#fdae61', '#d7191c' ] 
      
    const color = d3.scaleOrdinal<number, string>().range(colorRange);
    var linearGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("gradientTransform", "rotate(90)");
    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color(1));
    linearGradient.append("stop")
        .attr("offset", "25%")
        .attr("stop-color", color(2));
    linearGradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", color(3));
    linearGradient.append("stop")
        .attr("offset", "75%")
        .attr("stop-color", color(4));
    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color(5));

    // Ajout des données
    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line<number>()
        .x((d, i) => xScale(i))
        .y(d => yScale(d))
      )
      .attr("fill", "none")
      .attr("stroke", "url(#linear-gradient)")
      .attr("stroke-width", 2);
  }, [data, width, height, colorFunction]);

  return <svg ref={svgRef} width={width} height={height} />;
}



export default Sparkline