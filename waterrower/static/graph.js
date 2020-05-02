var polarchart = (function() {
  var polarsvg = null;
  var h = parseInt(d3.select("#polarchart").style('height'), 10);
  var w = parseInt(d3.select("#polarchart").style('width'), 10);
  var startingData = [{name: 'm', index: 0.1, value: 0},
                      {name: 'm/s', index: 0.2, value: 0},
                      {name: 's/m', index: 0.3, value: 0}];

  var renderPolarChart = function(selection, arrData) {
    var r = Math.min(w, h) / 1;
    var s = 0.09;

    var arcValue = d => d.value;
    var arcIndex = d => d.index;
    var arcName  = d => d.name;

    var fill = d3.scaleLinear()
      .range(['#d73027', '#1a9850'])
      .interpolate(d3.interpolateRgb); //interpolateHsl interpolateHcl interpolateRgb

    var genEndAngle = d => arcValue(d) * 2 * Math.PI;
    var genInnerRad = d => arcIndex(d) * r;
    var genOuterRad = d => (arcIndex(d) + s) * r;

    var arcGenerator = d3.arc()
      .startAngle(0)
      .endAngle(d => genEndAngle(d))
      .innerRadius(d => genInnerRad(d))
      .outerRadius(d => genOuterRad(d));

    // add data to the arcs
    //
    // selection filled with d data
    var allArcG = selection.selectAll(".arc")
      .data(arrData);

    // update data
    allArcG.select("path")
      .attr("d", d => arcGenerator(d))
      .style("fill", d => fill(arcValue(d)));

    // on enter new data
    allArcG.select("path")
      .enter()
      .attr("d", d => arcGenerator(d));

    // handle removed data
    allArcG.select("path")
      .exit()
      .remove();

    allArcG.select("text")
      .attr("dy", d => arcValue(d) < .5 ? "-.5em" : "1em")
      .attr("transform", d => "rotate(" + 360 * arcValue(d) + ")"
        + "translate(0," + -(arcIndex(d) + s / 2) * r + ")"
        + "rotate(" + (arcValue(d) < .5 ? -90 : 90) + ")")
      .text(d => arcName(d));
  }

  var init = function() {
    polarsvg = d3.select("#polarchart").append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr('viewBox','0 0 '+Math.min(w, h)+' '+Math.min(w, h))
      .attr('preserveAspectRatio','xMinYMin');

    var polarG = polarsvg.append("g")
      .attr("class", "arcgroup")
      .attr("transform", "translate(" + Math.min(w, h) / 2 + "," + Math.min(w, h) / 2 + ")");

    // for each row in data append a g
    pallG = polarG.selectAll(".arcgroup")
      .data(startingData, d => d.index)
      .enter()
        .append("g")
          .attr("class", "arc");
    pallG.append("path")
      .attr("class", "arcpath");
    pallG.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")

    update(startingData);
  }

  var update = function(data) {
    renderPolarChart(polarsvg, data)
  }

  var reset = function() {
    update(startingData);
  }

  return {
    init: init,
    update: update,
    reset: reset
  }

})();

var linechart = (function() {
  var linesvg = null
  var startingData = [
    {stroke_rate: 0, heart_rate: 0, total_distance_m: 0, total_strokes: 0, avg_distance_cmps: 0, time: 0, elapsed: 0}
  ];

  var renderLineChart = function(selection, arrData) {
    margin = ({top: 20, right: 30, bottom: 20, left: 30})
    h = parseInt(selection.style('height'), 10);
    w = parseInt(selection.style('width'), 10);

    xValue = d => d.elapsed;
    yValue1 = d => d.stroke_rate;
    yValue2 = d => d.heart_rate;

    xScale = d3.scaleLinear()
      .domain(d3.extent(arrData, xValue)).nice()
      .range([0 + margin.left, w - margin.right]);
    yScale1 = d3.scaleLinear()
      .domain(d3.extent(arrData, yValue1)).nice()
      .range([h - margin.bottom, 0 + margin.top]);
    yScale2 = d3.scaleLinear()
      .domain(d3.extent(arrData, yValue2)).nice()
      .range([h - margin.bottom, 0 + margin.top]);

    // axis
    //
    // create axisgenerators
    xAxis = g => g
      .attr("transform", `translate(0, ${h - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    yAxis1 = g => g
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale1));
    yAxis2 = g => g
      .attr("transform", `translate(${w - margin.right}, 0)`)
      .call(d3.axisRight(yScale2));

    // add data to the axis
    selection.selectAll(".xaxis")
      .call(xAxis);
    selection.selectAll(".y1axis")
      .call(yAxis1);
    selection.selectAll(".y2axis")
      .call(yAxis2);

    // lines
    //
    // create linegenerators
    lineGenerator1 = d3.line()
      .x(d => xScale(xValue(d)))
      .y(d => yScale1(yValue1(d)))
      .curve(d3.curveBasis);
    lineGenerator2 = d3.line()
      .x(d => xScale(xValue(d)))
      .y(d => yScale2(yValue2(d)))
      .curve(d3.curveBasis);

    // add data to the lines
    //
    // line selection
    line1 = selection.selectAll(".linepath1");
    line2 = selection.selectAll(".linepath2");

    // line update data
    line1.attr("d", d => lineGenerator1(arrData));
    line2.attr("d", d => lineGenerator2(arrData));

    // line on enter new data
    line1.enter().selectAll(".linepath1")
      .attr("d", d => lineGenerator1(arrData));
    line2.enter().selectAll(".linepath2")
      .attr("d", d => lineGenerator2(arrData));

    // line handle removed data
    line1.exit().remove();
    line2.exit().remove();
  }

  var init = function() {
    // create containers
    linesvg = d3.select('#linechart').append("svg")
      .attr("height", "100%")
      .attr("width", "100%");
    linesvg.append("g")
      .attr("class", "xaxis");
    linesvg.append("g")
      .attr("class", "y1axis");
    linesvg.append("g")
      .attr("class", "y2axis");
    lineG = linesvg.append("g")
      .attr("class", "linepaths")
      .attr("fill", "none")
      .attr("stroke-width", 5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");
    lineG.append("path")
      .attr("class", "linepath1")
      .attr("stroke", "#1c9750")
    lineG.append("path")
      .attr("class", "linepath2")
      .attr("stroke", "#63613e")
  }

  var update = function(data) {
    // filter array data to kind of zoom in
    data = data.filter(function(item, idx) {
      // timestamp js uses ms - elapsed range in ms 60000 ms = 1 min
      // range = Date.now() - 60000;
      // return item.time >= range && item.stroke_rate != 0 && item.heart_rate != 0;
      // return item.time >= range && item.stroke_rate != 0;
      return  item.stroke_rate != 0;
    });
    renderLineChart(linesvg, data)
  }

  var reset = function() {
    update(startingData);
  }

  return {
    init: init,
    update: update,
    reset: reset
  }

})();
