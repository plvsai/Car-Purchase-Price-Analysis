function pieChart(container, data) {
  const width = container.node().clientWidth;
  const height = 400;

  const radius = Math.min(width, height) / 2 - 16;
  const innerRadius = radius * 0.4;
  const labelRadius = (radius + innerRadius) / 2;

  const genders = ["Female", "Male"];

  let pieData = processData();

  const color = d3.scaleOrdinal().domain(genders).range(d3.schemeSet2);

  const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

  const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);

  const tooltip = d3.select("#tooltip");

  const formatCount = new Intl.NumberFormat("en-US").format;
  const formatPercent = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumSignificantDigits: 3,
  }).format;

  const svg = container
    .append("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height]);

  const path = svg
    .append("g")
    .selectAll("path")
    .data(pieData, (d) => d.index)
    .join("path")
    .attr("fill", (d) => color(d.data.key))
    .attr("d", arc)
    .each(function (d) {
      this._current = d;
    })
    .on("mouseenter", function () {
      tooltip.classed("show", true);
      d3.select(this).raise().attr("stroke", "currentColor");
    })
    .on("mousemove", function (event, d) {
      tooltip
        .html(
          `
        <div>${d.data.key}</div>
        <div>${formatCount(d.data.value)}(${formatPercent(
            d.data.value / d3.sum(pieData, (d) => d.value)
          )})</div>
      `
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px");
    })
    .on("mouseleave", function () {
      tooltip.classed("show", false);
      d3.select(this).attr("stroke", null);
    });

  const label = svg
    .append("g")
    .attr("pointer-events", "none")
    .attr("fill", "currentColor")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(pieData, (d) => d.index)
    .join("text")
    .attr("dy", "0.32em")
    .attr("transform", (d) => `translate(${arcLabel.centroid(d)})`)
    .attr("opacity", (d) => (d.value > 0 ? 1 : 0))
    .text((d) => d.data.key);

  function processData() {
    const count = d3.rollup(
      data,
      (v) => v.length,
      (d) => d.gender
    );
    // set missing value to zero
    const filledData = genders.map((key) => ({
      key,
      value: count.get(key) || 0,
    }));

    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null);
    return pie(filledData);
  }

  function update() {
    pieData = processData();

    path
      .data(pieData, (d) => d.index)
      .transition()
      .duration(750)
      .attrTween("d", arcTween);

    label
      .data(pieData, (d) => d.index)
      .transition()
      .duration(750)
      .attr("opacity", (d) => (d.value > 0 ? 1 : 0))
      .attr("transform", (d) => `translate(${arcLabel.centroid(d)})`);
  }

  // https://observablehq.com/@d3/pie-chart-update
  // Store the displayed angles in _current.
  // Then, interpolate from _current to the new angles.
  // During the transition, _current is updated in-place by d3.interpolate.
  function arcTween(a) {
    const i = d3.interpolate(this._current, a);
    this._current = i(0);
    return (t) => arc(i(t));
  }

  function updateData(_data) {
    data = _data;
    update();
  }

  return {
    updateData,
  };
}
