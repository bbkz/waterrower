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
    $("#total-strokes").text(workout[0].total_strokes);
    $("#total-distance-m").text(workout[0].total_distance_m);
  },

  init: function() {
    d3.json("/static/json/workouts.json").then(data => {
      data.forEach( d => {
        d3.select("#workout-select").append("option")
          .attr("value", d.start_time)
          .text(d.start_time);
      });
      workoutsD = data; // put workouts data global
    });

    d3.select("#workout-selector")
      .on("click", () => {
        archive.onClick();
      });
  },

}; // archive namespace
