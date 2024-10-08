function select(select, options) {
  select
    .selectAll("option")
    .data(options)
    .join("option")
    .attr("value", (d) => d.key)
    .text((d) => d.name);
}
