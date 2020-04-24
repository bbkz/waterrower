dashboard = (function($) {
    var MAX_MPS = 7.0;
    var MAX_STROKE_RATE = 40;

    var ws = null;
    var timerId = null;
    var workoutDistance = 0;
    var workoutDuration = 0;
    var chart_series = []

    // handle callbacks from interface.py and other sources (ui)
    var messagehandlers = {
        display_sec: function(data) {
            $('#clock #seconds').text(pad(data.value, 2));
        },
        display_sec_dec: function(data) {
            $('#clock #millis').text(pad(data.value, 1));
        },
        display_min: function(data) {
            $('#clock #minutes').text(pad(data.value, 2));
        },
        display_hr: function(data) {
            $('#clock #hours').text(pad(data.value, 2));
        },
        total_distance_m: function(data) {
            $('#total-distance-m').text(pad(data.value, 5));
        },
        avg_distance_cmps: function(data) {
            if (data.value > 0) {
                var mps = (data.value / 100).toFixed(2);
                var totalseconds = 500 / mps;
                var mins = Math.floor(totalseconds / 60).toFixed(0)
                var secs = Math.floor(totalseconds % 60)
                $('#avg-mps').text(mps);
                $('#avg-500m-min').text(pad(mins, 2));
                $('#avg-500m-sec').text(pad(secs, 2));
            }
        },
        total_kcal: function(data) {
            $('#total-kcal').text(pad((data.value/1000).toFixed(0), 4));
        },
        total_strokes: function(data) {
            $('#total-strokes').text(pad(data.value, 4));
        },
        stroke_rate: function(data) {
            $('#stroke-rate').text(data.value);
        },
        stroke_start: function(data) {
            //console.log(data);
        },
        stroke_end: function(data) {
            //console.log(data);
        },
        model: function(data){
            $('#model').text('S' + data.raw[2] + ' ' + data.raw.slice(3, 5) + '.' + data.raw.slice(5));
        },
        tank_volume: function(data){
            $('#tank_volume').text(data.value/10 + 'L');
        },
        heart_rate: function(data){
            $('#heart_rate').text(data.value);
        },
        reset: function(data){
            polarchart.reset();
            chart_series.length = 0;
        },
        'workout-start': function(data){ //??

        },
        graph: function(data){
          if(data.verbose == true){
            console.log(data)
          }
          // update the line chart with the new dataset
          row = []
          row.time = data.value.time || 0
          row.elapsed = data.value.elapsed || 0
          row.stroke_rate = data.value.stroke_rate || 0
          row.heart_rate = data.value.heart_rate || 0
          row.total_distance_m = data.total_distance_m || 0
          row.avg_distance_cmps = data.avg_distance_cmps || 0
          row.total_strokes = data.total_strokes || 0
          chart_series.push(row)
          linechart.update(chart_series) // send the new complete dataset to generate graph
        }
    };

    function updatePolarChart() {
        var data = [];
        var strokeRate = parseInt($('#stroke-rate').text());
        data.push({name: 's/m',
                   value: (!isNaN(strokeRate) && strokeRate > 0) ? strokeRate/MAX_STROKE_RATE : 0,
                   index: 0.3});

        if (workoutDistance > 0) {
            var distance = parseInt($('#total-distance-m').text().replace(/^0+/, ''));
            data.push({
                name: 'm',
                value: (!isNaN(distance) && distance > 0) ? distance / workoutDistance : 0,
                index: 0.1
            });
        }

        if (workoutDuration > 0) {
            var elapsed = workoutDuration - (parseInt($('#clock #seconds').text())
                + parseInt($('#clock #minutes').text()) * 60 + parseInt($('#clock #hours').text()) * 3600);
            data.push({
                name: 's',
                value: elapsed / workoutDuration,
                index: 0.1
            });
        }
        var mps = parseFloat($("#avg-mps").text());
        data.push({name: 'm/s',
                    value: (!isNaN(mps) && mps > 0) ? mps/MAX_MPS : 0,
                    index: 0.2});
        polarchart.update(data);
    }

    function pad(n, len) {
        var result = String(n);
        while (result.length < len) {
            result = "0" + result;
        }
        return result;
    }

    function onopen(e) {
        $('#status')
            .attr('class', 'connected')
            .text('Connected');
    }

    function onclose(e) {
        $('#status')
            .attr('class', 'not-connected')
            .text('Not connected');
    }

    function onmessage(e) {
        var data = JSON.parse(e.data);
        handler = messagehandlers[data.type];
        if (handler) {
            handler(data);
        } else {
            console.log('no handler for', JSON.stringify(data));
        }
    }

    function onerror(e) {
        console.log('error', e);
        $('#status').attr('class', 'error').text('Error connecting');
    }

    function numberFrom(id) {
        var value = $('#' + id).text().replace(/^0+/, '');
        if (value == '') {
            return 0;
        }
        return parseInt(value);
    }

    function init() {
        ws = new ReconnectingWebSocket('ws://' +document.location.host +'/ws');
        ws.onopen = onopen;
        ws.onclose = onclose;
        ws.onmessage = onmessage;
        ws.onerror = onerror;
        timerId = setInterval(updatePolarChart, 100);

        $('#workout-begin').click(function() {
            var workoutTarget = $('#workout-target').val();
            var type = $('#workout-type').val();
            if (!isNaN(workoutTarget) && type) {
                workoutTarget = parseInt(workoutTarget);
                if (type === "WSU") {
                    workoutTarget *= 60;
                    workoutDuration = workoutTarget;
                }
                if (type === "WSI") {
                    workoutDistance = workoutTarget;
                }
                polarchart.reset();
                var msg = JSON.stringify({type: 'workout-begin',
                    value: {
                        type: type,
                        target: workoutTarget
                    }});
                ws.send(msg);
            }
            return false;
        });

        $('#workout-end').click(function() {
            var msg = JSON.stringify({type: 'workout-end'});
            ws.send(msg);
            return false;
        });
    }

    return {
        init: init
    };
})(jQuery);
