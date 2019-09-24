// Define SVG area dimensions
var svgWidth = 650;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 60
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("body")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);


// Append a group area, then set its margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Configure a parseTime function which will return a new Date object from a string
var parseTime = d3.timeParse("%Y");

// Load data from csv
d3.csv("blueberries.csv", function(error, data) {

  // Throw an error if one occurs
  if (error) throw error;

  // Print the bbdata
  console.log(data);

  // Format the date and cast the acres harvested value to a number
  data.forEach(function(d) {
    d.Year = parseTime(d.Year);
    d.Value = +d.Value;
  });

  // Configure a time scale with a range between 0 and the chartWidth
  // Set the domain for the xTimeScale function
  // d3.extent returns an array containing the min and max values for the property specified
  var xTimeScale = d3.scaleTime()
    .range([0, chartWidth])
    .domain(d3.extent(data, d => d.Year));

  // Configure a linear scale with a range between the chartHeight and 0
  // Set the domain for the xLinearScale function
  var yLinearScale = d3.scaleLinear()
    .range([chartHeight, 0])
    .domain([50000, d3.max(data, d => d.Value)]);

  // Create two new functions passing the scales in as arguments
  // These will be used to create the chart's axes
  var bottomAxis = d3.axisBottom(xTimeScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  svg.append("text")
    .attr("text-anchor", "center")
    .attr("x", chartWidth)
    .attr("y", chartHeight + margin.top - 20)
    .text("Years");
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left+40)
    .attr("x", -margin.top)
    .text("Acres of Blueberries Harvested")




  // Configure a drawLine function which will use our scales to plot the line's points
  var drawLine = d3
    .line()
    .x(d => xTimeScale(d.Year))
    .y(d => yLinearScale(d.Value));

  // Append an SVG path and plot its points using the line function
  chartGroup.append("path")
    // The drawLine function returns the instructions for creating the line for bbdata
    .attr("d", drawLine(data))
    .classed("line", true);

  // Append an SVG group element to the SVG area, create the left axis inside of it
  chartGroup.append("g")
    .classed("axis", true)
    .call(leftAxis);
    
    

  // Append an SVG group element to the SVG area, create the bottom axis inside of it
  // Translate the bottom axis to the bottom of the page
  chartGroup.append("g")
    .classed("axis", true)
    .attr("transform", "translate(0, " + chartHeight + ")")
    .call(bottomAxis);
  

  
   
    reverseData = data;
    reverseData.reverse()
      // Start Animation on Click
      d3.select("#start").on("click", function() {
        var path = chartGroup.append("path")
            .datum(reverseData)
            .attr("class", "line")
            .attr("d", drawLine);

  // Variable to Hold Total Length
  var totalLength = path.node().getTotalLength();

	// Set Properties of Dash Array and Dash Offset and initiate Transition
	path
		.attr("stroke-dasharray", totalLength + " " + totalLength)
		.attr("stroke-dashoffset", totalLength)
	.transition() // Call Transition Method
		.duration(4000) // Set Duration timing (ms)
		.ease(d3.easeLinear) // Set Easing option
		.attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition
});
});

// Reset Animation
d3.select("#reset").on("click", function() {
	d3.select(".line").remove();
});