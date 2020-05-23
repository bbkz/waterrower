var archive = {

  getSelected: function() {
    selected = d3.select("#workout-select").node().value;
  },

  onClick: function() {
    archive.getSelected();
    d3.json(`/static/json/event_${selected}.json`).then(data => {
      linechart.update(data);
    });
    var workout = workoutsD.filter(function(item, idx) {
      return item.start_time == selected;
    });
    duration = new Date(parseInt(workout[0].end_time) - parseInt(workout[0].start_time));
    $("#hours").text(duration.getHours());
    $("#minutes").text(duration.getMinutes());
    $("#seconds").text(duration.getSeconds());
    $("#millis").text(duration.getMilliseconds());
    $("#total-strokes").text(workout[0].total_strokes);
    $("#total-distance-m").text(workout[0].total_distance_m);
  },

  init: function() {
    d3.json("/static/json/workouts.json").then(data => {
      data.forEach( d => {
        d3.select("#workout-select").append("option")
          .attr("value", d.start_time)
          .text(new Date(d.start_time).toLocaleString());
      });
      workoutsD = data; // put workouts data global
    });

    d3.select("#workout-selector")
      .on("click", () => {
        archive.onClick();
      });
  },

}; // archive namespace
