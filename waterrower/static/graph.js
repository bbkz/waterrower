var polarchart = (function() {
    h = parseInt(d3.select("#polarchart").style('height'), 10);
    w = parseInt(d3.select("#polarchart").style('width'), 10);

    var r = Math.min(w,h) / 1;
    var s = 0.09;

    var startingData = [{name: 'm', index: 0.1, value: 0},
                        {name: 'm/s', index: 0.2, value: 0},
                        {name: 's/m', index: 0.3, value: 0}];

    var svg = null;
    var fill = d3.scaleLinear()
        .range(["#f00", "#0f0", "#ff0"]);
    var arc = d3.arc()
        .startAngle(0)
        .endAngle(function(d) { return d.value * 2 * Math.PI; })
        .innerRadius(function(d) { return d.index * r; })
        .outerRadius(function(d) { return (d.index + s) * r; });

    var init = function() {
        svg = d3.select("#polarchart").append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

        var g = svg.selectAll("g")
            .data(startingData, function(d) { return d.index; })
            .enter()
            .append("g");

        g.append("path")
            .style("fill", function(d) { return fill(d.value); })
            .attr("d", arc);

        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .text(function(d) { return d.name; });
    }

    var update = function(data) {
        var g = svg.selectAll("g")
            .data(data);

        g.select("path")
            .style("fill", function(d) { return fill(d.value); })
            .attr("d", arc);

        g.select("text")
            .attr("dy", function(d) { return d.value < .5 ? "-.5em" : "1em"; })
            .attr("transform", function(d) {
                return "rotate(" + 360 * d.value + ")"
                    + "translate(0," + -(d.index + s / 2) * r + ")"
                    + "rotate(" + (d.value < .5 ? -90 : 90) + ")"
            })
            .text(function(d) { return d.name; });
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
    var svg = null
    var startingData = [
      {stroke_rate: 0, heart_rate: 0, total_distance_m: 0, total_strokes: 0, avg_distance_cmps: 0, time: 0, elapsed: 0}
    ];

    var renderChart = function(selection, arrData) {
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
            .attr("transform", `translate(0,${h - margin.bottom})`)
            .call(d3.axisBottom(xScale));
        yAxis1 = g => g
            .attr("transform", `translate(${margin.left},0)`)
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
        line1 = selection.selectAll(".line-path1");
        line2 = selection.selectAll(".line-path2");

        // line update data
        line1.attr("d", d => lineGenerator1(arrData));
        line2.attr("d", d => lineGenerator2(arrData));

        // line on enter new data
        line1.enter().selectAll("line-path1")
            .attr("d", d => lineGenerator1(arrData));
        line2.enter().selectAll("line-path2")
            .attr("d", d => lineGenerator2(arrData));

        // line handle removed data
        line1.exit().remove();
        line2.exit().remove();
    }

    var init = function() {
        // create containers
        svg = d3.select('#linechart').append("svg")
            .attr("height", "100%")
            .attr("width", "100%");
        svg.append("g")
            .attr("class", "xaxis");
        svg.append("g")
            .attr("class", "y1axis");
        svg.append("g")
            .attr("class", "y2axis");
        svg.append("path")
            .attr("class", "line-path1")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round");
        svg.append("path")
            .attr("class", "line-path2")
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round");
    }

    var update = function(data) {
        // filter array data to kind of zoom in
        data = data.filter(function(item, idx) {
            // timestamp js uses ms - elapsed range in ms 60000 ms = 1 min
            range = Date.now() - 60000;
            // return item.time >= range && item.stroke_rate != 0 && item.heart_rate != 0;
            return item.time >= range && item.stroke_rate != 0;
        });
        renderChart(svg, data)
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
