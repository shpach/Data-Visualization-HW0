/*** DEFINE CONSTANTS HERE ***/
T_DURATION = 1000;

// Bar chart variable declarations
var xBar, yBar, xAxisBar, yAxisBar;
var aggData;
var barChart;

const marginBar = {
  bottom: 100,
  left: 100,
  right: 100,
  top: 100
};


// Scatter plot variable declarations
var splot_x, splot_unemp_y, splot_women_y;
var splot_xAxis, splot_unemp_yAxis, splot_women_yAxis;
var splot_unemp_rects, splot_women_rects;
var splot_data, major_categs, medians, unemp_rates, share_women;
var major_categs_colors = ["#800000", "#9A6324", "#808000", "#469990", "#000075", "#000000", "#e6194B", "#f58231", "#a9a9a9", "#bfef45", "#3cb44b", "#42d4f4", "#4363d8", "#911eb4", "#f032e6", "#ffe119"];
var splot;

var r = 15;

const splot_margin = {
  top: 20, 
  bottom: 20, 
  right: 30, 
  left: 35
};


const axisLabelPos = {
  yAxis: 40
}

const legend = [{gender: 'Male', color: 'steelblue', y: marginBar.top}, {gender: 'Female', color: 'red', y: marginBar.top + 20}]

// Data files
d3.csv("https://gist.githubusercontent.com/shpach/6413032be4ce6e57c46d84458c21dd38/raw/184af816311e3938f9ebd2c80d8f51d3b9a79cfe/agg-recent-grads.csv",
  function(data) {
    return {
      Major_code: data.Major_code,
      Major: data.Major,
      Major_category: data.Major_category,
      Total: parseInt(data.Total),
      Sample_size: parseInt(data.Sample_size),
      Men: parseInt(data.Men),
      Women: parseInt(data.Women),
      ShareWomen: parseFloat(data.ShareWomen),
      Employed: parseInt(data.Employed),
      Full_time: parseInt(data.Full_time),
      Part_time: parseInt(data.Part_time),
      Full_time_year_round: parseInt(data.Full_time_year_round),
      Unemployed: parseInt(data.Unemployed),
      Unemployment_rate: parseFloat(data.Unemployment_rate),
      Median: parseInt(data.Median),
      College_jobs: parseInt(data.College_jobs),
      Non_college_jobs: parseInt(data.Non_college_jobs),
      Low_wage_jobs: parseInt(data.Low_wage_jobs),
      Percent_college_jobs: parseFloat(data.PercentCollegeJobs) * 100
    }
  }
).then(createBarChart);

d3.csv("https://raw.githubusercontent.com/fivethirtyeight/data/master/college-majors/recent-grads.csv",
  function(data) {
    return {
      Major: data.Major,
      Major_category: data.Major_category,
      ShareWomen: parseFloat(data.ShareWomen),
      Unemployment_rate: parseFloat(data.Unemployment_rate),
      Median: parseInt(data.Median),
      College_jobs: parseInt(data.College_jobs),
      Non_college_jobs: parseInt(data.Non_college_jobs),
      Low_wage_jobs: parseInt(data.Low_wage_jobs)
    }
  }
).then(createSplotChart);

// using d3 for convenience
var main = d3.select('main')
var scrolly = main.select('#scrolly');
var figure = scrolly.select('figure');
var article = scrolly.select('article');
var step = article.selectAll('.step');

let svg = figure.select('p').select('#intro-bchart');
let splotSvg = figure.select('p').select('#main-chart');

BAR_CHART_WIDTH = svg.attr("width");
BAR_CHART_HEIGHT = svg.attr("height");

SPLOT_WIDTH = splotSvg.attr("width");
SPLOT_HEIGHT = splotSvg.attr("height");

var CURRENT_STEP = 'Median';

// initialize the scrollama
var scroller = scrollama();

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  var stepH = Math.floor(window.innerHeight * 0.75);
  step.style('height', stepH + 'px');

  var figureHeight = window.innerHeight / 2
  var figureMarginTop = (window.innerHeight - figureHeight) / 2  

  figure
    .style('height', figureHeight + 'px')
    .style('top', figureMarginTop + 'px');


  // 3. tell scrollama to update new element dimensions
  scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
  // response = { element, direction, index }
  console.log(response);
  CURRENT_STEP = d3.select(response.element).attr('data-step');
  console.log(CURRENT_STEP);

  // add color to current step only
  step.classed('is-active', function (d, i) {
    return i === response.index;
  })

  // update graphic based on step
  barChart.update(CURRENT_STEP);
  splot.update();
}

function setupStickyfill() {
  d3.selectAll('.sticky').each(function () {
    Stickyfill.add(this);
  });
}

function init() {
  setupStickyfill();

  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();

  // 2. setup the scroller passing options
  //    this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller.setup({
    step: '#scrolly article .step',
    offset: 0.5,
    // debug: true,
  })
    .onStepEnter(handleStepEnter)


  // setup resize event
  window.addEventListener('resize', handleResize);
}

/*** GRAPHICAL SETUP ***/

function createBarChart(data) {
  aggData = data;
  aggData.sort((a, b) => b.Median - a.Median);

  setupAxes();
  setupBarGraph();
}

function setupBarGraph() {
  
  const LEGEND_X = 800;
  const LEGEND_SIZE = 10;
    
  xBar.domain(aggData.map(d => d.Major_category));
  
  // Different bar graphs (explicitly set womenBar for the ShareWomen stacked bar chart)
  const bar = svg.append("g")
      .attr("fill", "steelblue")
      .selectAll("rect")
      .data(aggData, d => d.Major_category)
      .join("rect")
      .style("mix-blend-mode", "multiply")
      .attr("x", -xBar.bandwidth())
      .attr("y", 0)
      .attr("transform", d => rotate(xBar(d.Major_category), yBar(0), 180))
      .attr("width", xBar.bandwidth());

  // Need special logic for Share of Women bar since it is overlayed for the stacked bar chart
  const womenBar = svg.append("g")
      .attr("fill", "red")
      .selectAll("rect")
      .data(aggData, d => d.Major_category)
      .join("rect")
      .style("mix-blend-mode", "multiply")
      .attr("x", -xBar.bandwidth())
      .attr("y", 0)
      .attr("transform", d => rotate(xBar(d.Major_category), yBar(0), 180))
      .attr("width", xBar.bandwidth())
      .style("opacity", 0);
  
  
  // Legend
  var barLegends = svg.selectAll(".groups")
    .data(legend)
    .enter()
    .append("g")
    .attr("class", "barLegend")
    .style("opacity", 0);
  
  barLegends.append('rect')
    .attr('x', LEGEND_X)
    .attr('y', d => d.y)
    .attr('width', LEGEND_SIZE)
    .attr('height', LEGEND_SIZE)
    .attr('fill', d => d.color);

  barLegends.append('text')
    .text(d => d.gender)
   .attr('x', LEGEND_X + 2 * LEGEND_SIZE)
   .attr('y', d => d.y + LEGEND_SIZE)
   .style("font-size", "13px");

  svg.node().update = (o) => {

    // Visibility switch
    if(CURRENT_STEP === 'splot'){
      svg.transition()
      .duration(T_DURATION)
      .attr('display', 'none');
      return;
    }
    else{
      svg.attr('display', 'true')
    }

    // Special logic for displaying % women
    if(CURRENT_STEP === 'women'){

      yBar = d3.scaleLinear()
        .domain([0, d3.max(aggData, d => d['Total'])]).nice()
        .range([BAR_CHART_HEIGHT - marginBar.bottom, marginBar.top]);

      womenBar
        .attr("height", d => yBar(0) - yBar(d['ShareWomen'] * d['Total']))
        .transition()
        .duration(T_DURATION)
        .style("opacity", 1);
      
      barLegends.transition()
        .duration(T_DURATION)
        .style("opacity", 1);
      
      bar.data(aggData, d => d.Major_category)
        .transition()
        .duration(T_DURATION)
        .attr("height", d => yBar(0) - yBar(d['Total']))
        // .attr("y", d => yBar(0));
      
      // bar.data(aggData, d => d.Major_category)
      //   .transition()
      //   .duration(T_DURATION)
      //   .attr("height", d => yBar(0) - yBar(d['Total'] * (1 - d['ShareWomen'])))
      //   .attr("y", d => yBar(0) - yBar(d['ShareWomen'] * d['Total']));

      
    }
    
    else{
      yBar = d3.scaleLinear()
        .domain([0, d3.max(aggData, d => d[CURRENT_STEP])]).nice()
        .range([BAR_CHART_HEIGHT - marginBar.bottom, marginBar.top]);

      barLegends.transition()
        .duration(T_DURATION)
        .style("opacity", 0);

      bar.data(aggData, d => d.Major_category)
      .transition()
      .duration(T_DURATION)
      .attr("height", d => yBar(0) - yBar(d[o])); 
      
      womenBar.transition()
        .duration(T_DURATION)
        .style("opacity", 0);
    }

    yAxisBar = g => g
      .attr("transform", `translate(${marginBar.left},0)`)
      .call(d3.axisLeft(yBar))
      .call(g => g.select(".domain").remove());

    // Animate y-axis on rescale between different graphs
    svg.select(".y-axes")
      .transition()
      .call(yAxisBar);

    svg.select(".y-label")
      .transition()
      .text(CURRENT_STEP);
    
  };

  barChart = svg.node();
}

function setupAxes() {
  xBar = d3.scaleBand()
    .domain(aggData.map(d => d.Major_category))
    .range([marginBar.left, BAR_CHART_WIDTH - marginBar.right])
    .padding(0.1);

  yBar = d3.scaleLinear()
    .domain([0, d3.max(aggData, d => d[CURRENT_STEP])]).nice()
    .range([BAR_CHART_HEIGHT - marginBar.bottom, marginBar.top])

  xAxisBar = g => g
    .attr("transform", `translate(0,${BAR_CHART_HEIGHT - marginBar.bottom})`)
    .call(d3.axisBottom(xBar).tickSizeOuter(0))

  yAxisBar = g => g
    .attr("transform", `translate(${marginBar.left},0)`)
    .call(d3.axisLeft(yBar))
    .call(g => g.select(".domain").remove())

  gx = svg.append("g")
      .call(xAxisBar)
      .selectAll("text")  
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-60)");

  gy = svg.append("g")
      .attr("class", "y-axes")
      .call(yAxisBar);

  yLabel = svg.append("text")
    .attr("class", "y-label")
    .attr("transform", rotate(axisLabelPos.yAxis, BAR_CHART_HEIGHT/2, -90))
    .style("text-anchor", "middle")
    .attr("font-size", "11px")
    .text("Median");
}


/****** Scatter Plot ******/
function createSplotChart(data) {
  splot_data = data;
  console.log(splot_data);
  // Secondary data filtering
  major_categs = d3.set(splot_data, d => d.Major_category);
  medians = splot_data.map((value, index) => value.Median);
  unemp_rates = splot_data.map((value, index) => value.Unemployment_rate);
  share_women = splot_data.map((value, index) => value.ShareWomen);

  setupSplotAxes();
  computeSplotQuantiles();
  setupScatterPlot();
}


function computeSplotQuantiles(){
  splot_unemp_rects = [
    {x: 0, width: splot_x(d3.quantile(medians, 0.75)), y: splot_unemp_y(d3.quantile(unemp_rates, 0.75)), height: splot_unemp_y(d3.quantile(unemp_rates, 0.25)) - splot_unemp_y(d3.quantile(unemp_rates, 0.75))},
    {x: splot_x(d3.quantile(medians, 0.75)), width: splot_x(d3.quantile(medians, 0.25)) - splot_x(d3.quantile(medians, 0.75)), y: splot_unemp_y(d3.quantile(unemp_rates, 0.75)), height: splot_unemp_y(d3.quantile(unemp_rates, 0.25)) - splot_unemp_y(d3.quantile(unemp_rates, 0.75))},
    {x: splot_x(d3.quantile(medians, 0.25)), width: SPLOT_WIDTH, y: splot_unemp_y(d3.quantile(unemp_rates, 0.75)), height: splot_unemp_y(d3.quantile(unemp_rates, 0.25)) - splot_unemp_y(d3.quantile(unemp_rates, 0.75))},
    {x: splot_x(d3.quantile(medians, 0.75)), width: splot_x(d3.quantile(medians, 0.25)) - splot_x(d3.quantile(medians, 0.75)), y: 0, height: splot_unemp_y(d3.quantile(unemp_rates, 0.75))},
    {x: splot_x(d3.quantile(medians, 0.75)), width: splot_x(d3.quantile(medians, 0.25)) - splot_x(d3.quantile(medians, 0.75)), y: splot_unemp_y(d3.quantile(unemp_rates, 0.25)), height: SPLOT_HEIGHT}
  ];

  splot_women_rects = [
    {x: 0, width: splot_x(d3.quantile(medians, 0.75)), y: splot_women_y(d3.quantile(share_women, 0.75)), height: splot_women_y(d3.quantile(share_women, 0.25)) - splot_women_y(d3.quantile(share_women, 0.75))},
    {x: splot_x(d3.quantile(medians, 0.75)), width: splot_x(d3.quantile(medians, 0.25)) - splot_x(d3.quantile(medians, 0.75)), y: splot_women_y(d3.quantile(share_women, 0.75)), height: splot_women_y(d3.quantile(share_women, 0.25)) - splot_women_y(d3.quantile(share_women, 0.75))},
    {x: splot_x(d3.quantile(medians, 0.25)), width: SPLOT_WIDTH, y: splot_women_y(d3.quantile(share_women, 0.75)), height: splot_women_y(d3.quantile(share_women, 0.25)) - splot_women_y(d3.quantile(share_women, 0.75))},
    {x: splot_x(d3.quantile(medians, 0.75)), width: splot_x(d3.quantile(medians, 0.25)) - splot_x(d3.quantile(medians, 0.75)), y: 0, height: splot_women_y(d3.quantile(share_women, 0.75))},
    {x: splot_x(d3.quantile(medians, 0.75)), width: splot_x(d3.quantile(medians, 0.25)) - splot_x(d3.quantile(medians, 0.75)), y: splot_women_y(d3.quantile(share_women, 0.25)), height: SPLOT_HEIGHT}
  ];
}

function setupScatterPlot(){
  splotSvg.style("border", "1px solid #bbbbbb");
  
  const g = splotSvg.append("g").attr("id", "circles");
  
  g.selectAll("rect")
    .data(splot_unemp_rects)
    .enter()
    .append("rect")
    .attr("x", d => d.x)
    .attr("width", d => d.width)
    .attr("y", d => d.y)
    .attr("height", d => d.height)
    .attr("fill", "#808080")
    .attr("opacity", "0.75");
  
  g.selectAll("circle")
    .data(splot_data)
    .enter()
    .append("circle")
      .attr("cx", d => splot_x(d.Median))
      .attr("cy", d => splot_unemp_y(d.Unemployment_rate))
      .attr("r", r)
      .style("fill", d => splot_color(d.Major_category));

  splotSvg.append("g").attr("id", "annotation");
  
  var splotLegend = splotSvg.selectAll("legend")
    .data(splot_color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
  
  splotLegend.append("rect")
    .attr("x", SPLOT_WIDTH - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", splot_color);

  splotLegend.append("text")
    .attr("x", SPLOT_WIDTH - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d; });
  
  splotSvg.node().update = () => {
    // Visibility switch
    if(CURRENT_STEP !== 'splot'){
      splotSvg.attr('display', 'none');
      return;
    }
    else{
      splotSvg.attr('display', 'true')
    }
  }

  /*svg.node().update = () => {
    
    g.selectAll("rect")
      .data(splot_women_rects)
        .attr("x", d => d.x)
        .attr("width", d => d.width)
        .attr("y", d => d.y)
        .attr("height", d => d.height)
        .attr("fill", "#808080")
        .attr("opacity", "0.75");
  
    g.selectAll("circle")
      .data(splot_data)
      .transition()
      .duration(800)
      .ease(d3.easeLinear)
        .attr("cx", d => splot_x(d.Median))
        .attr("cy", d => splot_women_y(d.ShareWomen))
        .attr("r", r)
        .style("fill", d => splot_color(d.Major_category));
  };*/

  splot = splotSvg.node();
};

function setupSplotAxes(){

  splot_x = d3.scaleLinear()
      .domain(d3.extent(splot_data, d => d.Median))
      .range([r * 2, SPLOT_WIDTH - (r * 2)]) // Pad by Circle Radius
      .nice();

  splot_unemp_y = d3.scaleLinear()
      .domain(d3.extent(splot_data, d => d.Unemployment_rate))
      .range([SPLOT_HEIGHT - (r * 2), r * 2]) // Pad by Circle Radius
      .nice();

  splot_women_y = d3.scaleLinear()
      .domain(d3.extent(splot_data, d => d.ShareWomen))
      .range([SPLOT_HEIGHT - (r * 2), r * 2]) // Pad by Circle Radius
      .nice();

  splot_color = d3.scaleOrdinal(major_categs_colors).domain(major_categs.values());

  splot_xAxis = g => g.attr("transform", `translate(0, ${SPLOT_HEIGHT - splot_margin.bottom})`)
    .call(d3.axisBottom(splot_x))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
    .attr("x", SPLOT_WIDTH - splot_margin.right)
    .attr("y", -4)
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "end")
    .text(splot_data.Median)
  );

  splot_unemp_yAxis = g => g.attr("transform", `translate(${splot_margin.left}, 0)`)
    .call(d3.axisLeft(splot_unemp_y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
    .attr("x", 4)
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text(splot_data.Unemployment_rate)
  );

  splot_women_yAxis = g => g.attr("transform", `translate(${splot_margin.left}, 0)`)
  .call(d3.axisLeft(splot_women_y))
  .call(g => g.select(".domain").remove())
  .call(g => g.select(".tick:last-of-type text").clone()
    .attr("x", 4)
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text(splot_data.ShareWomen)
  );


  splotSvg.append("g").call(splot_xAxis);
  splotSvg.append("g").call(splot_unemp_yAxis);
}


function rotate(x, y, r) {
  return `translate(${x},${y}) rotate(${r})`;
}


init();