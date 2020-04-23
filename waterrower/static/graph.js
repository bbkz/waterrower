var polarchart = (function() {

    var w = 500;
    var h = 500;
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
        svg = d3.select("#viz").append("svg")
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
    var h = 500;
    var w = 500;
    var s = 0.09;
    var svg = null
    var startingData = [
          {type: "heart_rate", time: 0, elapsed: 0, rate: 0},
          {type: "stroke_rate", time: 0, elapsed: 0, rate: 0}
    ];

    var renderChart = function(selection, arrData) {
        margin = ({top: 20, right: 30, bottom: 30, left: 40})

        xValue = d => d.elapsed;
        yValue = d => d.rate;
        colorValue = d => d.type;

        xScale = d3.scaleLinear()
            .domain(d3.extent(arrData, xValue)).nice()
            .range([0 + margin.left, w])

        yScale = d3.scaleLinear()
            .domain(d3.extent(arrData, yValue)).nice()
            .range([h - margin.bottom, 0])

        colorScale = d3.scaleOrdinal(d3.schemeCategory10)

        xAxis = g => g
            .attr("transform", `translate(0,${h - margin.bottom})`)
            .call(d3.axisBottom(xScale).ticks(w / 80).tickSizeOuter(0))

        yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale))

        nested = d3.nest()
            .key(colorValue)
            .entries(arrData)

        colorScale.domain(nested.map(d => d.key))

        lineGenerator = d3.line()
            .x(d => xScale(xValue(d)))
            .y(d => yScale(yValue(d)))
            .curve(d3.curveBasis)

        // disable axis, but leave the code for now
        // selection.append("g")
        //     .call(xAxis);
        // selection.append("g")
        //     .call(yAxis);

        lines = selection.selectAll(".line-path")
               .data(nested)

        // enter new data
        lines.enter().append("path")
            .attr("class", "line-path")
            .attr("fill", "none")
            .attr("stroke", d => colorScale(d.key))
            .attr("stroke-width", 5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", d => lineGenerator(d.values));

        // update data
        lines
            .attr("stroke", d => colorScale(d.key))
            .attr("d", d => lineGenerator(d.values));

        // handle removed data
        lines.exit().remove()
    }

    var init = function() {
        svg = d3.select('#chart').append("svg")
            .attr("height", h)
            .attr("width", w)
    }

    var update = function(data) {
        //console.log(data)
        // filter data to kind of zoom in
        data = data.filter(function(item, idx) {
            // timestamp js uses ms - elapsed range in ms 60000 ms = 1 min
            range = Date.now() - 60000;
            return item.time >= range;
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
