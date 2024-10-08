// Reference: Double input range slider https://codepen.io/alexpg96/pen/xxrBgbP
function doubleRangeInput(container, output, min, max, step) {
  container.attr("class", "double-range-input");
  const sliderTrack = container.append("div").attr("class", "slider-track");
  const slider1 = container
    .append("input")
    .attr("type", "range")
    .attr("min", min)
    .attr("max", max)
    .attr("step", step)
    .attr("value", min)
    .on("input", slide1);
  const s1 = slider1.node();
  const slider2 = container
    .append("input")
    .attr("type", "range")
    .attr("min", min)
    .attr("max", max)
    .attr("step", step)
    .attr("value", max)
    .on("input", slide2);
  const s2 = slider2.node();

  const minGap = step;

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
  const format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format;

  fill();

  function slide1() {
    if (parseInt(s2.value) - parseInt(s1.value) <= minGap) {
      s1.value = parseInt(s2.value) - minGap;
    }
    fill();
  }

  function slide2() {
    if (parseInt(s2.value) - parseInt(s1.value) <= minGap) {
      s2.value = parseInt(s1.value) + minGap;
    }
    fill();
  }

  function fill() {
    const percent1 = ((s1.value - min) / (max - min)) * 100;
    const percent2 = ((s2.value - min) / (max - min)) * 100;
    sliderTrack
      .style("--percent1", percent1 + "%")
      .style("--percent2", percent2 + "%");

    output.text(`${format(s1.value)}-${format(s2.value)}`);
  }
}
