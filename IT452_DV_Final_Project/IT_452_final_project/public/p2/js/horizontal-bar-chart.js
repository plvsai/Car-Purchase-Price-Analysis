function horizontalBarChart(container, data) {
  const margin = {
    top: 0,
    right: 20,
    bottom: 40,
    left: 72,
  };
  const width = container.node().clientWidth - margin.left - margin.right;
  const height = 320 - margin.top - margin.bottom;

  const ageGroups = [
    "18 to 24",
    "25 to 34",
    "35 to 44",
    "45 to 54",
    "55 to 64",
    "65 or over",
  ];

  let barData = processData();

  const color = d3.schemeSet2[2];

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(barData, (d) => d.value)])
    .range([0, width])
    .nice();

  const y = d3
    .scaleBand()
    .domain(ageGroups)
    .range([0, height])
    .paddingOuter(0.15)
    .paddingInner(0.3);

  const tooltip = d3.select("#tooltip");

  const formatCount = new Intl.NumberFormat("en-US").format;
  const formatPercent = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumSignificantDigits: 3,
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
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSizeOuter(0).ticks(5));

  const xAxisLabel = g
    .append("text")
    .attr("transform", `translate(${width + margin.right},${height + 24})`)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Frequency (Number of Transactions) →");

  const yAxisGroup = g
    .append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y))
    .call((g) => g.select(".domain").remove());

  const bar = g
    .append("g")
    .attr("fill", color)
    .selectAll("rect")
    .data(barData, (d) => d.key)
    .join("rect")
    .attr("x", x(0))
    .attr("y", (d) => y(d.key))
    .attr("width", (d) => x(d.value) - x(0))
    .attr("height", y.bandwidth())
    .on("mouseenter", function () {
      tooltip.classed("show", true);
      d3.select(this).raise().attr("stroke", "currentColor");
    })
    .on("mousemove", function (event, d) {
      tooltip
        .html(
          `
        <div>${d.key}</div>
        <div>${formatCount(d.value)}(${formatPercent(
            d.value / d3.sum(barData, (d) => d.value)
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

  function processData() {
    const count = d3.rollup(
      data,
      (v) => v.length,
      (d) => d.ageGroup
    );
    // set missing values to zero
    const filledData = ageGroups.map((key) => ({
      key,
      value: count.get(key) || 0,
    }));

    return filledData;
  }

  function update() {
    barData = processData();

    x.domain([0, d3.max(barData, (d) => d.value)]).nice();

    xAxisGroup.call(d3.axisBottom(x).tickSizeOuter(0).ticks(5));

    bar
      .data(barData, (d) => d.key)
      .transition()
      .duration(750)
      .attr("width", (d) => x(d.value) - x(0));
  }

  function updateData(_data) {
    data = _data;
    update();
  }

  return {
    updateData,
  };
}
