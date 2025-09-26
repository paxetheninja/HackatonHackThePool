import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const TreeChart = ({ data, width = 928 }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const dx = 10;
    const dy = width / (d3.hierarchy(data).height + 1);

    // Create hierarchy and tree layout
    const root = d3.hierarchy(data);
    const tree = d3.tree().nodeSize([dx, dy]);
    root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
    tree(root);

    // Compute vertical extent
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });
    const height = x1 - x0 + dx * 2;

    // Main SVG group for zooming
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-dy / 3, x0 - dx, width, height])
      .style("max-width", "100%")
      .style("height", "auto")
      .style("font", "10px sans-serif")
      .append("g");

    // Draw links
    g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x)
      );

    // Draw nodes
    const node = g.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("fill", d => d.children ? "#555" : "#999")
      .attr("r", 2.5);

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -6 : 6)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .attr("stroke", "white")
      .attr("paint-order", "stroke");

    // Add zoom and pan
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5]) // min/max zoom
      .on("zoom", event => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

  }, [data, width]);

  return <svg ref={ref}></svg>;
};

export default TreeChart;
