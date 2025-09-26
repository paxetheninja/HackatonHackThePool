import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import countries110 from "world-atlas/countries-110m.json";

const EuropeChoropleth = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 975;
    const height = 610;

    // Extract countries
    const countries = topojson.feature(countries110, countries110.objects.countries);

    // Filter Europe only (example: use ISO numeric codes for Europe)
    const europeIds = new Set([250, 276, 380, 724, 826, 752, 372, 528, 208, 616, 40, 56, 756, 100, 191, 203, 233, 246, 348, 428, 440, 442, 807, 470, 498, 578, 616, 642, 688, 703, 705, 724, 752, 804]);
    const europe = {
      type: "FeatureCollection",
      features: countries.features.filter(f => europeIds.has(+f.id)),
    };

    // Projection: fit the SVG size to the Europe feature collection
    const projection = d3.geoMercator().fitSize([width, height], europe);
    const path = d3.geoPath(projection);

    const color = d3.scaleQuantize([1, 12], d3.schemeBlues[9]);
    const valuemap = new Map(data.map(d => [d.id, d.rate]));

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");

    svg
      .append("g")
      .selectAll("path")
      .data(europe.features)
      .join("path")
      .attr("fill", d => {
        const v = valuemap.get(+d.id);
        return v ? color(v) : "#ccc";
      })
      .attr("d", path)
      .append("title")
      .text(d => `${d.properties.name}\n${valuemap.get(+d.id) || "No data"}%`);

    // Optional: draw Europe borders
    const borders = topojson.mesh(countries110, countries110.objects.countries, (a, b) => a !== b && europeIds.has(+a.id) && europeIds.has(+b.id));
    svg
      .append("path")
      .datum(borders)
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path);

  }, [data]);

  return <svg ref={ref}></svg>;
};

export default EuropeChoropleth;