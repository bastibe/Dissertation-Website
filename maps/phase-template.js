var phase_data = null;
fetch('phase-template.json', {method:'GET'}).then(response => {
    response.json().then(data => {
        phase_data = data;
        var f0 = document.getElementById('phase:slider').value;
        drawPhase(f0);
    });
});

function drawPhase(f0) {
    if (phase_data === null) {
        return;
    }

    var plotdata = [{
        type: "scatter",
        name: "template IFD",
        x: phase_data.frequencies,
        y: phase_data[f0]
    },
    {
        type: "scatter",
        name: "IFD spectrum",
        x: phase_data.frequencies,
        y: phase_data.spectrum
    }];
    var plotlayout = {
        height: 200,
        width: 650,
        xaxis: { title: "frequency in Hz" },
        yaxis: { title: "IFD in Hz" },
        margin: { t:30, r:20, b:50, l:50 },
        title: "Difference = "
    };
    Plotly.newPlot("phase-template", plotdata, plotlayout);

    updatePhase(f0);
}

function updatePhase(f0) {
    if (phase_data === null) {
        return;
    }

    var difference = 0;
    // calculate the log-f difference of the signal IFD and the template IFD
    for (let n=0; n<phase_data.spectrum.length; n++) {
        var f = n/phase_data.spectrum.length*22050;
        // equivalent to 1/diff(logspace( f..fs/2 )):
        var log_weight = Math.pow(1/22050, f/22050)
        var signal_ifd = phase_data.spectrum[n];
        var template_ifd = phase_data[f0][n];
        difference += Math.abs(signal_ifd - template_ifd) * log_weight;
    }
    difference /= phase_data.spectrum.length;
    // correct for bias due to
    // - at low f0: the signal variability
    // - at high f0: the template variability
    var signal_bias = 34; // := xcorr(signal_ifd, template_ifd[f0=80])
    var template_bias = 115; // := xcorr(signal_ifd, template_ifd[f0=450])
    var bias = signal_bias + (f0-80)/(450-80)*(template_bias - signal_bias);
    difference /= bias;

    plotdiv = document.getElementById('phase-template');
    plotdiv.data[0].y = phase_data[f0];
    plotdiv.layout.title = "Difference = " + difference.toFixed(2);
    Plotly.redraw('phase-template');

    document.getElementById('phase:value').innerHTML = document.getElementById('phase:slider').value + '&thinsp;Hz';
    if (f0 == 115) {
        document.getElementById('phase:value').innerHTML += ' (optimal)';
        document.getElementById('phase:value').style.color = 'green';
    } else {
        document.getElementById('phase:value').style.color = '';
    }
}
