// Tableau colors from https://public.tableau.com/profile/chris.gerrard#!/vizhome/TableauColors/ColorPaletteswithRGBValues
var colors = [
    'rgb(31,119,180)',
    'rgb(255,127,14)',
    'rgb(44,160,44)',
    'rgb(214,39,40)',
    'rgb(148,103,189)',
    'rgb(140,86,75)',
    'rgb(227,119,194)',
    'rgb(127,127,127)',
    'rgb(188,189,34)',
    'rgb(23,190,207)',
    // the same colors twice:
    'rgb(31,119,180)',
    'rgb(255,127,14)',
    'rgb(44,160,44)',
    'rgb(214,39,40)',
    'rgb(148,103,189)',
    'rgb(140,86,75)',
    'rgb(227,119,194)',
    'rgb(127,127,127)',
    'rgb(188,189,34)',
    'rgb(23,190,207)'
]

function octave_errors(data) {
    var graph = document.getElementById('octave-errors-plot');
    var axesdata = [];
    var index = 1;
    for (const [algo, algodata] of Object.entries(data)) {
        axesdata.push({
            x: algodata['snrs'],
            y: algodata['low'],
            xaxis: 'x' + index,
            yaxis: 'y' + index,
            line: {color: colors[index-1]},
            marker: {symbol: "triangle-down"},
            mode: 'markers',
            showlegend: false,
            name: "low Octave Errors"
        });
        axesdata.push({
            x: algodata['snrs'],
            y: algodata['high'],
            xaxis: 'x' + index,
            yaxis: 'y' + index,
            line: {color: colors[index-1]},
            marker: {symbol: "triangle-up"},
            mode: 'markers',
            showlegend: false,
            name: "high Octave Errors"
        });
        var total = algodata['remaining']
        for (let n=0; n<total.length; n++) {
            total[n] += algodata['low'][n]
            total[n] += algodata['high'][n];
        }
        axesdata.push({
            x: algodata['snrs'],
            y: total,
            xaxis: 'x' + index,
            yaxis: 'y' + index,
            line: {color: colors[index-1]},
            mode: 'lines',
            showlegend: true,
            name: algo,
            fill: 'tozeroy'
        });
        index = index + 1;

    }

    var layout = {
        grid: {rows:5, columns: 4, pattern: 'independent'},
        margin: {t: 0}
    };
    for (var n=1; n<=20; n++) {
        layout['yaxis' + n] = {
            range: [-0.05, 1.05],
        };
        if ((n-1) % 4 == 0) {
            layout['yaxis' + n] = {
                range: [-0.05, 1.05],
                title: 'GPE',
                tickvals: [0, 0.25, 0.5, 0.75, 1],
                ticktext: [0, 0.25, 0.5, 0.75, 1]
            }
        } else {
            layout['yaxis' + n] = {
                range: [-0.05, 1.05],
                tickvals: [0, 0.25, 0.5, 0.75, 1],
                ticktext: ['', '', '', '', '']
            }
        }
        if (n > 16) {
            layout['xaxis' + n] = {
                title: 'SNR in dB'
            };
        } else {
            layout['xaxis' + n] = {
                tickvals: [-20, -10, 0, 10, 20],
                ticktext: ['', '', '', '', '']
            };
        }
    }

    Plotly.newPlot(graph, axesdata, layout);
}

function error_summary(data) {
    var graph = document.getElementById('error-summary-plot');
    var axesdata = [];
    var index = 1;
    for (const [algo, algodata] of Object.entries(data)) {
        axesdata.push({
            x: algodata['snr'],
            y: algodata['gpe'],
            xaxis: 'x' + index,
            yaxis: 'y' + index,
            line: {color: colors[index-1]},
            mode: 'lines',
            showlegend: true,
            name: algo,
        });
        if (algodata['nans']) {
            axesdata.push({
                x: algodata['snr'],
                y: algodata['nans'],
                xaxis: 'x' + index,
                yaxis: 'y' + index,
                line: {color: colors[index-1]},
                marker: {symbol: "circle-open"},
                mode: 'markers',
                showlegend: false,
                name: "Without Estimates"
            });
            axesdata.push({
                x: algodata['snr'],
                y: algodata['false_positives'],
                xaxis: 'x' + index,
                yaxis: 'y' + index,
                line: {color: colors[index-1]},
                marker: {symbol: "cross"},
                mode: 'markers',
                showlegend: false,
                name: "False Positives"
            });
            axesdata.push({
                x: algodata['snr'],
                y: algodata['false_negatives'],
                xaxis: 'x' + index,
                yaxis: 'y' + index,
                line: {color: colors[index-1]},
                marker: {symbol: "x"},
                mode: 'markers',
                showlegend: false,
                name: "False Negatives"
            });
        }
        index = index + 1;

    }

    var layout = {
        grid: {rows:5, columns: 4, pattern: 'independent'},
        margin: {t: 0}
    };
    for (var n=1; n<=20; n++) {
        if ((n-1) % 4 == 0) {
            layout['yaxis' + n] = {
                range: [-0.05, 1.05],
                title: 'GPE',
                tickvals: [0, 0.25, 0.5, 0.75, 1],
                ticktext: [0, 0.25, 0.5, 0.75, 1]
            }
        } else {
            layout['yaxis' + n] = {
                range: [-0.05, 1.05],
                tickvals: [0, 0.25, 0.5, 0.75, 1],
                ticktext: ['', '', '', '', '']
            }
        }
        if (n > 16) {
            layout['xaxis' + n] = {
                title: 'SNR in dB'
            };
        } else {
            layout['xaxis' + n] = {
                tickvals: [-20, -10, 0, 10, 20],
                ticktext: ['', '', '', '', '']
            };
        }
    }
    Plotly.newPlot(graph, axesdata, layout);
}

var symbols = {
    'CMU-Arctic': 'triangle-up-open',
    'FDA': 'triangle-down-open',
    'KEELE': 'triangle-left-open',
    'MOCHA-TIMIT': 'triangle-right-open',
    'PTDB-TUG': 'star-open',
    'TIMIT': 'diamond-open',
}

function compare_corpora(data) {
    var graph = document.getElementById('compare-corpora-plot');
    var axesdata = [];
    var index = 1;
    for (const [algoname, algodata] of Object.entries(data)) {
        axesdata.push({
            x: algodata['snr'],
            y: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            xaxis: 'x' + index,
            yaxis: 'y' + index,
            line: {color: colors[index-1]},
            mode: 'lines',
            showlegend: true,
            name: algoname,
        });
        for (const [corpus, gpe] of Object.entries(algodata)) {
            if (corpus == 'snr') {
                continue
            }
            axesdata.push({
                x: algodata['snr'],
                y: gpe,
                xaxis: 'x' + index,
                yaxis: 'y' + index,
                line: {color: colors[index-1], width: 1},
                marker: {symbol: symbols[corpus]},
                mode: 'lines+markers',
                showlegend: false,
                name: corpus
            });
        }
        index = index + 1;
    }

    var layout = {
        grid: {rows:5, columns: 4, pattern: 'independent'},
        margin: {t: 0}
    };
    for (var n=1; n<=20; n++) {
        if ((n-1) % 4 == 0) {
            layout['yaxis' + n] = {
                range: [-0.3, 0.3],
                title: 'ΔGPE',
                tickvals: [-0.25, 0, 0.25],
                ticktext: [-0.25, 0, 0.25],
            }
        } else {
            layout['yaxis' + n] = {
                range: [-0.3, 0.3],
                tickvals: [-0.25, 0, 0.25],
                ticktext: ['', '', '']
            }
        }
        if (n > 16) {
            layout['xaxis' + n] = {
                title: 'SNR in dB'
            };
        } else {
            layout['xaxis' + n] = {
                tickvals: [-20, -10, 0, 10, 20],
                ticktext: ['', '', '', '', '']
            };
        }
    }

    Plotly.newPlot(graph, axesdata, layout);
}



window.onload = function () {
    fetch("octave-errors.json")
        .then(response => response.json())
        .then(data => octave_errors(data));
    fetch("error-summary.json")
        .then(response => response.json())
        .then(data => error_summary(data));
    fetch("compare-corpora.json")
        .then(response => response.json())
        .then(data => compare_corpora(data));
}
