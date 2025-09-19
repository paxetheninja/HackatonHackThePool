import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

function WordCloud({ data, width = 800, height = 500 }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) {
      console.warn("WordCloud: No data provided.");
      return;
    }

    // Convert data into layout words with size > 0
    const wordsData = data
      .filter(d => d[1] > 0)
      .map(d => ({
        text: d[0],
        size: Math.max(Math.sqrt(d[1]) * 5, 10), // min font size
      }));

    if (!wordsData.length) {
      console.warn("WordCloud: No words with positive size.");
      return;
    }

    console.log("WordCloud wordsData:", wordsData);

    // Clear previous SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create layout
    const layout = cloud()
      .size([width, height])
      .words(wordsData)
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .font('Impact')
      .fontSize(d => d.size)
      .on('end', draw);

    layout.start();

    function draw(words) {
     // console.log("Drawing words:", words);

      svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`)
        .selectAll('text')
        .data(words)
        .join('text')
        .style('font-size', d => `${d.size}px`)
        .style('fill', () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text(d => d.text);
    }
  }, [data, width, height]);

  return <svg ref={svgRef}></svg>;
}

export default WordCloud;
