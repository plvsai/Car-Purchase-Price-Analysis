function histogramChart(container, data, variable, color) {
  const margin = {
    top: 32,
    right: 20,
    bottom: 40,
    left: 40,
  };
  const width = container.node().clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const x = d3.scaleLinear().range([0, width]);

  const y = d3.scaleLinear().range([height, 0]);

  const tooltip = d3.select("#tooltip");

  const formatCount = new Intl.NumberFormat("en-US").format;
  const formatPercent = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumSignificantDigits: 3,
  }).format;
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
    .text("↑ Frequency (Number of Transactions)");

  let bar = g.append("g").selectAll("rect");

  update();

  function processData() {
    const bin = d3
      .bin()
      .thresholds(10)
      .value((d) => d[variable.key]);
    const bins = bin(data);
    return bins;
  }

  function update() {
    const binnedData = processData();

    x.domain([binnedData[0].x0, binnedData[binnedData.length - 1].x1]);

    y.domain([0, d3.max(binnedData, (d) => d.length)]).nice();

    xAxisGroup.call(
      d3.axisBottom(x).tickSizeOuter(0).ticks(5).tickFormat(formatCurrency)
    );

    xAxisLabel.text(`${variable.name} →`);

    yAxisGroup
      .call(d3.axisLeft(y).ticks(5))
      .call((g) => g.select(".domain").remove());

    bar = bar
      .data(binnedData)
      .join((enter) =>
        enter
          .append("rect")
          .on("mouseenter", function () {
            tooltip.classed("show", true);
            d3.select(this).raise().attr("stroke", "currentColor");
          })
          .on("mousemove", function (event, d) {
            tooltip
              .html(
                `
                <div>${variable.name}</div>
                <div>${formatCount(d.length)}(${formatPercent(
                  d.length / d3.sum(binnedData, (d) => d.length)
                )})</div>
                `
              )
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 50 + "px");
          })
          .on("mouseleave", function () {
            tooltip.classed("show", false);
            d3.select(this).attr("stroke", null);
          })
      )
      .attr("fill", color)
      .attr("x", (d) => x(d.x0) + 1)
      .attr("width", (d) => x(d.x1) - x(d.x0) - 2)
      .attr("y", y(0))
      .attr("height", 0);
    bar
      .transition()
      .duration(750)
      .attr("y", (d) => y(d.length))
      .attr("height", (d) => y(0) - y(d.length));
  }

  function updateData(_data) {
    data = _data;
    update();
  }

  function updateVariable(_variable) {
    variable = _variable;
    update();
  }

  function updateColor(_color) {
    color = _color;
    update();
  }

  return {
    updateData,
    updateVariable,
    updateColor,
  };
}
