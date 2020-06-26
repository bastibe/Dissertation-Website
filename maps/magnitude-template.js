var magnitude_data = null;
fetch('magnitude-template.json', {method:'GET'}).then(response => {
    response.json().then(data => {
        magnitude_data = data;
        var f0 = document.getElementById('magnitude:slider').value;
        drawMagnitude(f0);
    });
});

function drawMagnitude(f0) {
    if (magnitude_data === null) {
        return;
    }

    var plotdata = [{
        type: "scatter",
        name: "template",
        x: magnitude_data.frequencies,
        y: magnitude_data[f0]
    },
    {
        type: "scatter",
        name: "spectrum",
        x: magnitude_data.frequencies,
        y: magnitude_data.spectrum
    }];
    var plotlayout = {
        height: 200,
        width: 650,
        xaxis: { title: "frequency in Hz" },
        yaxis: { range: [-0.3, 1], title: "amplitude" },
        margin: { t:30, r:20, b:50, l:50 },
        title: "Correlation = "
    };
    Plotly.newPlot("magnitude-template", plotdata, plotlayout);

    updateMagnitude(f0);
}

function updateMagnitude(f0) {
    if (magnitude_data === null) {
        return;
    }

    var correlation = 0;
    // calculate the log-f correlation of the signal spectrum and the template spectrum
    for (let n=0; n<magnitude_data.spectrum.length; n++) {
        // equivalent to 1/diff(logspace( f..fs/2 )):
        var f = n/magnitude_data.spectrum.length*22050;
        var log_weight = Math.pow(1/22050, f/22050)
        correlation += magnitude_data.spectrum[n] * magnitude_data[f0][n] * log_weight;
    }

    plotdiv = document.getElementById('magnitude-template');
    plotdiv.data[0].y = magnitude_data[f0];
    plotdiv.layout.title = "Correlation = " + correlation.toFixed(2);
    Plotly.redraw('magnitude-template');

    document.getElementById('magnitude:value').innerHTML = document.getElementById('magnitude:slider').value + '&thinsp;Hz';
    if (f0 == 115) {
        document.getElementById('magnitude:value').innerHTML += ' (optimal)';
        document.getElementById('magnitude:value').style.color = 'green';
    } else {
        document.getElementById('magnitude:value').style.color = '';
    }
}
