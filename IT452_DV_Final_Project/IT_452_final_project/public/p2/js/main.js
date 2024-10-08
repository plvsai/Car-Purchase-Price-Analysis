d3.csv("data/car_purchasing.csv").then((csvData) => {
  // transform csv data
  function getAgeGroup(age) {
    if (age >= 18 && age < 25) return "18 to 24";
    if (age < 35) return "25 to 34";
    if (age < 45) return "35 to 44";
    if (age < 55) return "45 to 54";
    if (age < 65) return "55 to 64";
    return "65 or over";
  }

  const data = csvData.map((d) => {
    const name = d["customer name"];
    const email = d["customer e-mail"];
    const gender = +d["gender"] === 1 ? "Male" : "Female";
    const ageGroup = getAgeGroup(+d["age"]);
    const annualSalary = Math.round(+d["annual Salary"]);
    const creditCardDebt = Math.round(+d["credit card debt"]);
    const netWorth = Math.round(+d["net worth"]);
    const price = Math.round(+d["car purchase amount"]);
    return {
      name,
      email,
      gender,
      ageGroup,
      annualSalary,
      creditCardDebt,
      netWorth,
      price,
    };
  });

  // price range input
  const [minPrice, maxPrice] = d3.extent(data, (d) => d.price);
  const priceStep = 1000;
  const priceRangeOutput = d3.select("#priceRangeOutput");
  const priceRangeInput = d3.select("#priceRangeInput").on("change", () => {
    const minPrice = +priceRangeInput.select("input:first-of-type").node()
      .value;
    const maxPrice = +priceRangeInput.select("input:last-of-type").node().value;
    const filteredData = filterData(minPrice, maxPrice);

    ageGroupDistributionChart.updateData(filteredData);
  });
  doubleRangeInput(
    priceRangeInput,
    priceRangeOutput,
    minPrice,
    maxPrice,
    priceStep
  );

  function filterData(minPrice, maxPrice) {
    return data.filter((d) => d.price >= minPrice && d.price <= maxPrice);
  }

  // initialize chart
  const filteredData = filterData(minPrice, maxPrice);

  const ageGroupDistributionChart = horizontalBarChart(
    d3.select("#ageGroupDistributionChart"),
    filteredData
  );
});
