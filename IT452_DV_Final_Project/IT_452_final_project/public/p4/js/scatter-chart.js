function scatterChart(container, data, variable) {
  const margin = {
    top: 32,
    right: 32,
    bottom: 40,
    left: 64,
  };
  const width = container.node().clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const dotRadius = 6;

  const color = d3.schemeSet2[2];

  const x = d3.scaleLinear().range([0, width]);

  const y = d3.scaleLinear().range([height, 0]);

  const tooltip = d3.select("#tooltip");

  const formatCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format;

  const svg = container
    .append("svg")
    .attr("viewBox", [
      0,
      0,
      width + margin.left + margin.right,
      height + margin.top + margin.bottom,
    ]);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xAxisGroup = g
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`);

  const xAxisLabel = g
    .append("text")
    .attr("transform", `translate(${width + margin.right},${height + 24})`)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end");

  const yAxisGroup = g.append("g").attr("class", "y axis");

  const yAxisLabel = g
    .append("text")
    .attr("transform", `translate(${-margin.left},-16)`)
    .text("↑ Price");

  let dot = g.append("g").attr("fill", color).selectAll("circle");

  const zoom = d3.zoom().scaleExtent([0.5, 32]).on("zoom", zoomed);

  update();

  function zoomed({ transform }) {
    const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
    const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
    xAxisGroup.call(
      d3.axisBottom(zx).tickSizeOuter(0).ticks(5).tickFormat(formatCurrency)
    );
    yAxisGroup
      .call(d3.axisLeft(zy).ticks(5).tickFormat(formatCurrency))
      .call((g) => g.select(".domain").remove());
    dot
      .attr("cx", (d) => zx(d[variable.key]))
      .attr("cy", (d) => zy(d.price))
      .attr("r", dotRadius);
  }

  function update() {
    x.domain(d3.extent(data, (d) => d[variable.key])).nice();

    y.domain(d3.extent(data, (d) => d.price)).nice();

    xAxisGroup.call(
      d3.axisBottom(x).tickSizeOuter(0).ticks(5).tickFormat(formatCurrency)
    );

    xAxisLabel.text(`${variable.name} →`);

    yAxisGroup
      .call(d3.axisLeft(y).ticks(5).tickFormat(formatCurrency))
      .call((g) => g.select(".domain").remove());

    dot = dot
      .data(data, (d) => d.email)
      .join((enter) =>
        enter
          .append("circle")
          .attr("r", dotRadius)
          .attr("cx", (d) => x(d[variable.key]))
          .attr("cy", (d) => y(d.price))
          .attr("stroke", "#fff")
          .on("mouseenter", function () {
            tooltip.classed("show", true);
            d3.select(this).raise().attr("stroke", "currentColor");
          })
          .on("mousemove", function (event, d) {
            tooltip
              .html(
                `
                <div>${variable.name}</div>
                <div>${formatCurrency(d[variable.key])}</div>
                <div>Price</div>
                <div>${formatCurrency(d.price)}</div>
                `
              )
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 50 + "px");
          })
          .on("mouseleave", function () {
            tooltip.classed("show", false);
            d3.select(this).attr("stroke", "#fff");
          })
      );

    dot
      .transition()
      .duration(750)
      .attr("cx", (d) => x(d[variable.key]))
      .attr("cy", (d) => y(d.price));

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);
  }

  function updateData(_data) {
    data = _data;
    update();
  }

  function updateVariable(_variable) {
    variable = _variable;
    update();
  }

  return {
    updateData,
    updateVariable,
  };
}
