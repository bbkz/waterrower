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

        // append axis
        selection.append("g")
            .call(xAxis);
        selection.append("g")
            .call(yAxis);

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
        console.log(data)

        const linedata = [];
        data.forEach(d => {
          var row = {
            type: "heart_rate",
            time: d.time  || 0,
            elapsed: d.elapsed  || 0,
            rate: d.heart_rate || 0
          };
          linedata.push(row);
          var row = {
            type: "stroke_rate",
            time: d.time || 0,
            elapsed: d.elapsed || 0,
            rate: d.stroke_rate || 0
          };
          linedata.push(row);
        });
        renderChart(svg, linedata)
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

$(function() {
  var chart_series = [{"time": 1585900870060, "elapsed": 1}, {"stroke_rate": 26, "heart_rate": 86, "total_distance_m": 25, "total_strokes": 5, "avg_distance_cmps": 500, "time": 1585900875061, "elapsed": 5002}, {"total_distance_m": 50, "total_strokes": 10, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 120, "time": 1585900880061, "elapsed": 10002}, {"total_distance_m": 75, "total_strokes": 15, "stroke_rate": 26, "avg_distance_cmps": 500, "heart_rate": 107, "time": 1585900885062, "elapsed": 15003}, {"total_distance_m": 100, "total_strokes": 20, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 97, "time": 1585900890063, "elapsed": 20004}, {"total_distance_m": 125, "total_strokes": 25, "stroke_rate": 27, "avg_distance_cmps": 500, "heart_rate": 106, "time": 1585900895063, "elapsed": 25004}, {"total_distance_m": 149, "total_strokes": 30, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 99, "time": 1585900900064, "elapsed": 30005}, {"total_distance_m": 174, "total_strokes": 35, "stroke_rate": 27, "avg_distance_cmps": 500, "heart_rate": 99, "time": 1585900905065, "elapsed": 35006}, {"total_distance_m": 199, "total_strokes": 40, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 105, "time": 1585900910066, "elapsed": 40007}, {"total_distance_m": 224, "total_strokes": 45, "stroke_rate": 24, "avg_distance_cmps": 500, "heart_rate": 132, "time": 1585900915066, "elapsed": 45007}, {"total_distance_m": 249, "total_strokes": 50, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 93, "time": 1585900920067, "elapsed": 50008}, {"total_distance_m": 274, "total_strokes": 55, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 104, "time": 1585900925068, "elapsed": 55009}, {"total_distance_m": 299, "total_strokes": 60, "stroke_rate": 27, "avg_distance_cmps": 500, "heart_rate": 135, "time": 1585900930068, "elapsed": 60009}, {"total_distance_m": 324, "total_strokes": 65, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 107, "time": 1585900935069, "elapsed": 65010}, {"total_distance_m": 349, "total_strokes": 70, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 84, "time": 1585900940070, "elapsed": 70011}, {"total_distance_m": 374, "total_strokes": 75, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 125, "time": 1585900945070, "elapsed": 75011}, {"total_distance_m": 398, "total_strokes": 80, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 97, "time": 1585900950071, "elapsed": 80012}, {"total_distance_m": 423, "total_strokes": 85, "stroke_rate": 27, "avg_distance_cmps": 500, "heart_rate": 103, "time": 1585900955072, "elapsed": 85013}, {"total_distance_m": 448, "total_strokes": 90, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 93, "time": 1585900960072, "elapsed": 90013}, {"total_distance_m": 473, "total_strokes": 95, "stroke_rate": 24, "avg_distance_cmps": 500, "heart_rate": 93, "time": 1585900965073, "elapsed": 95014}, {"total_distance_m": 498, "total_strokes": 100, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 128, "time": 1585900970073, "elapsed": 100014}, {"total_distance_m": 523, "total_strokes": 105, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 125, "time": 1585900975074, "elapsed": 105015}, {"total_distance_m": 548, "total_strokes": 110, "stroke_rate": 26, "avg_distance_cmps": 500, "heart_rate": 99, "time": 1585900980074, "elapsed": 110015}, {"total_distance_m": 573, "total_strokes": 115, "stroke_rate": 26, "avg_distance_cmps": 500, "heart_rate": 116, "time": 1585900985075, "elapsed": 115016}, {"total_distance_m": 598, "total_strokes": 120, "stroke_rate": 26, "avg_distance_cmps": 500, "heart_rate": 85, "time": 1585900990076, "elapsed": 120017}, {"total_distance_m": 623, "total_strokes": 125, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 122, "time": 1585900995076, "elapsed": 125017}, {"total_distance_m": 647, "total_strokes": 130, "stroke_rate": 24, "avg_distance_cmps": 500, "heart_rate": 136, "time": 1585901000077, "elapsed": 130018}, {"total_distance_m": 672, "total_strokes": 135, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 88, "time": 1585901005078, "elapsed": 135019}, {"total_distance_m": 697, "total_strokes": 140, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 82, "time": 1585901010078, "elapsed": 140019}, {"total_distance_m": 722, "total_strokes": 145, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 129, "time": 1585901015079, "elapsed": 145020}, {"total_distance_m": 747, "total_strokes": 150, "stroke_rate": 24, "avg_distance_cmps": 500, "heart_rate": 92, "time": 1585901020080, "elapsed": 150021}, {"total_distance_m": 772, "total_strokes": 155, "stroke_rate": 24, "avg_distance_cmps": 500, "heart_rate": 95, "time": 1585901025081, "elapsed": 155022}, {"total_distance_m": 797, "total_strokes": 160, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 95, "time": 1585901030082, "elapsed": 160023}, {"total_distance_m": 822, "total_strokes": 165, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 95, "time": 1585901035082, "elapsed": 165023}, {"total_distance_m": 847, "total_strokes": 170, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 131, "time": 1585901040083, "elapsed": 170024}, {"total_distance_m": 872, "total_strokes": 175, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 94, "time": 1585901045083, "elapsed": 175024}, {"total_distance_m": 897, "total_strokes": 180, "stroke_rate": 26, "avg_distance_cmps": 500, "heart_rate": 113, "time": 1585901050084, "elapsed": 180025}, {"total_distance_m": 922, "total_strokes": 185, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 90, "time": 1585901055084, "elapsed": 185025}, {"total_distance_m": 946, "total_strokes": 190, "stroke_rate": 24, "avg_distance_cmps": 500, "heart_rate": 140, "time": 1585901060085, "elapsed": 190026}, {"total_distance_m": 971, "total_strokes": 195, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 124, "time": 1585901065085, "elapsed": 195026}, {"total_distance_m": 996, "total_strokes": 200, "stroke_rate": 27, "avg_distance_cmps": 500, "heart_rate": 112, "time": 1585901070086, "elapsed": 200027}, {"total_distance_m": 1021, "total_strokes": 205, "stroke_rate": 27, "avg_distance_cmps": 500, "heart_rate": 106, "time": 1585901075087, "elapsed": 205028}, {"total_distance_m": 1046, "total_strokes": 210, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 91, "time": 1585901080088, "elapsed": 210029}, {"total_distance_m": 1071, "total_strokes": 215, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 85, "time": 1585901085089, "elapsed": 215030}, {"total_distance_m": 1096, "total_strokes": 220, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 112, "time": 1585901090089, "elapsed": 220030}, {"total_distance_m": 1121, "total_strokes": 225, "stroke_rate": 26, "avg_distance_cmps": 500, "heart_rate": 129, "time": 1585901095090, "elapsed": 225031}, {"total_distance_m": 1146, "total_strokes": 230, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 103, "time": 1585901100090, "elapsed": 230031}, {"total_distance_m": 1171, "total_strokes": 235, "stroke_rate": 27, "avg_distance_cmps": 500, "heart_rate": 103, "time": 1585901105090, "elapsed": 235031}, {"total_distance_m": 1196, "total_strokes": 240, "stroke_rate": 24, "avg_distance_cmps": 500, "heart_rate": 83, "time": 1585901110091, "elapsed": 240032}, {"total_distance_m": 1221, "total_strokes": 245, "stroke_rate": 24, "avg_distance_cmps": 500, "heart_rate": 99, "time": 1585901115091, "elapsed": 245032}, {"total_distance_m": 1245, "total_strokes": 249, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 123, "time": 1585901120091, "elapsed": 250032}, {"total_distance_m": 1270, "total_strokes": 254, "stroke_rate": 27, "avg_distance_cmps": 500, "heart_rate": 102, "time": 1585901125092, "elapsed": 255033}, {"total_distance_m": 1295, "total_strokes": 259, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 80, "time": 1585901130092, "elapsed": 260033}, {"total_distance_m": 1320, "total_strokes": 264, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 105, "time": 1585901135093, "elapsed": 265034}, {"total_distance_m": 1345, "total_strokes": 269, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 135, "time": 1585901140094, "elapsed": 270035}, {"total_distance_m": 1370, "total_strokes": 274, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 97, "time": 1585901145094, "elapsed": 275035}, {"total_distance_m": 1395, "total_strokes": 279, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 139, "time": 1585901150095, "elapsed": 280036}, {"total_distance_m": 1420, "total_strokes": 284, "stroke_rate": 26, "avg_distance_cmps": 500, "heart_rate": 123, "time": 1585901155095, "elapsed": 285036}, {"total_distance_m": 1445, "total_strokes": 289, "stroke_rate": 27, "avg_distance_cmps": 500, "heart_rate": 98, "time": 1585901160096, "elapsed": 290037}, {"total_distance_m": 1470, "total_strokes": 294, "stroke_rate": 26, "avg_distance_cmps": 500, "heart_rate": 83, "time": 1585901165096, "elapsed": 295037}, {"total_distance_m": 1495, "total_strokes": 299, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 116, "time": 1585901170097, "elapsed": 300038}, {"total_distance_m": 1520, "total_strokes": 304, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 121, "time": 1585901175097, "elapsed": 305038}, {"total_distance_m": 1544, "total_strokes": 309, "stroke_rate": 24, "avg_distance_cmps": 500, "heart_rate": 93, "time": 1585901180098, "elapsed": 310039}, {"total_distance_m": 1569, "total_strokes": 314, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 133, "time": 1585901185099, "elapsed": 315040}, {"total_distance_m": 1594, "total_strokes": 319, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 136, "time": 1585901190099, "elapsed": 320040}, {"total_distance_m": 1619, "total_strokes": 324, "stroke_rate": 26, "avg_distance_cmps": 500, "heart_rate": 136, "time": 1585901195100, "elapsed": 325041}, {"total_distance_m": 1644, "total_strokes": 329, "stroke_rate": 27, "avg_distance_cmps": 500, "heart_rate": 97, "time": 1585901200100, "elapsed": 330041}, {"total_distance_m": 1669, "total_strokes": 334, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 100, "time": 1585901205101, "elapsed": 335042}, {"total_distance_m": 1694, "total_strokes": 339, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 119, "time": 1585901210102, "elapsed": 340043}, {"total_distance_m": 1719, "total_strokes": 344, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 83, "time": 1585901215102, "elapsed": 345043}, {"total_distance_m": 1744, "total_strokes": 349, "stroke_rate": 26, "avg_distance_cmps": 500, "heart_rate": 122, "time": 1585901220103, "elapsed": 350044}, {"total_distance_m": 1769, "total_strokes": 354, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 121, "time": 1585901225104, "elapsed": 355045}, {"total_distance_m": 1793, "total_strokes": 359, "stroke_rate": 27, "avg_distance_cmps": 500, "heart_rate": 123, "time": 1585901230104, "elapsed": 360045}, {"total_distance_m": 1818, "total_strokes": 364, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 100, "time": 1585901235105, "elapsed": 365046}, {"total_distance_m": 1843, "total_strokes": 369, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 135, "time": 1585901240105, "elapsed": 370046}, {"total_distance_m": 1868, "total_strokes": 374, "stroke_rate": 24, "avg_distance_cmps": 500, "heart_rate": 80, "time": 1585901245106, "elapsed": 375047}, {"total_distance_m": 1893, "total_strokes": 379, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 92, "time": 1585901250107, "elapsed": 380048}, {"total_distance_m": 1918, "total_strokes": 384, "stroke_rate": 27, "avg_distance_cmps": 500, "heart_rate": 107, "time": 1585901255107, "elapsed": 385048}, {"total_distance_m": 1943, "total_strokes": 389, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 109, "time": 1585901260107, "elapsed": 390048}, {"total_distance_m": 1968, "total_strokes": 394, "stroke_rate": 24, "avg_distance_cmps": 500, "heart_rate": 103, "time": 1585901265108, "elapsed": 395049}, {"total_distance_m": 1993, "total_strokes": 399, "stroke_rate": 26, "avg_distance_cmps": 500, "heart_rate": 123, "time": 1585901270109, "elapsed": 400050}, {"total_distance_m": 2018, "total_strokes": 404, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 132, "time": 1585901275110, "elapsed": 405051}, {"total_distance_m": 2042, "total_strokes": 409, "stroke_rate": 27, "avg_distance_cmps": 500, "heart_rate": 117, "time": 1585901280111, "elapsed": 410052}, {"total_distance_m": 2067, "total_strokes": 414, "stroke_rate": 23, "avg_distance_cmps": 500, "heart_rate": 138, "time": 1585901285112, "elapsed": 415053}, {"total_distance_m": 2092, "total_strokes": 419, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 116, "time": 1585901290112, "elapsed": 420053}, {"total_distance_m": 2117, "total_strokes": 424, "stroke_rate": 24, "avg_distance_cmps": 500, "heart_rate": 128, "time": 1585901295113, "elapsed": 425054}, {"total_distance_m": 2142, "total_strokes": 429, "stroke_rate": 22, "avg_distance_cmps": 500, "heart_rate": 91, "time": 1585901300114, "elapsed": 430055}, {"total_distance_m": 2167, "total_strokes": 434, "stroke_rate": 25, "avg_distance_cmps": 500, "heart_rate": 106, "time": 1585901305114, "elapsed": 435055}]
  linechart.init();
  linechart.update(chart_series)
});
