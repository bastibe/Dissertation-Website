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
]

var symbols = {
    'CMU-Arctic': 'triangle-up-open',
    'FDA': 'triangle-down-open',
    'KEELE': 'triangle-left-open',
    'MOCHA-TIMIT': 'triangle-right-open',
    'PTDB-TUG': 'star-open',
    'TIMIT': 'diamond-open',
}

function f0_histogram(data) {
    var graph = document.getElementById('f0-histogram-plot');
    var axesdata = [];
    var index = 1;
    for (const [corpusname, corpusdata] of Object.entries(data)) {
        axesdata.push({
            x: corpusdata['edges'],
            y: corpusdata['density'],
            line: {color: colors[index-1]},
            mode: 'lines',
            showlegend: true,
            name: corpusname,
        });
        index = index + 1;
    }

    var layout = {
        margin: {t: 0},
        xaxis: {title: 'Fundamental Frequency in Hz'},
        yaxis: {title: 'Probability Density'},
    };

    Plotly.newPlot(graph, axesdata, layout);
}

function compare_f0(data) {
    var graph = document.getElementById('compare-f0-plot');
    var axesdata = [];
    var index = 1;
    for (const [corpusname, corpusdata] of Object.entries(data)) {
        axesdata.push({
            x: corpusdata['edges'],
            y: corpusdata['density'],
            line: {color: colors[index-1]},
            mode: 'lines',
            showlegend: true,
            name: corpusname,
        });
        index = index + 1;
    }
    axesdata.push({
        x: [1/1.2, 1/1.2],
        y: [0.001, 100],
        mode: 'lines',
        line: {
            color: 'grey',
            width: 1,
            dash: 'dot',
        },
        showlegend: false,
        name: 'GPE lower boundary',
    });
    axesdata.push({
        x: [1.2, 1.2],
        y: [0.001, 100],
        mode: 'lines',
        line: {
            color: 'grey',
            width: 1,
            dash: 'dot',
        },
        showlegend: false,
        name: 'GPE upper boundary',
    });

    var layout = {
        margin: {t: 0},
        yaxis: {
            title: 'Probability Density (log)',
            type: 'log',
            range: [-3, 2.1],
        },
        xaxis: {
            title: 'Ground Truth / Consensus Truth',
            type: 'log',
            tickvals: [0.333, 0.5, 1, 2, 3],
            ticktext: ['1/3', '1/2', 1, 2, 3]
        }
    };

    Plotly.newPlot(graph, axesdata, layout);
}



window.onload = function () {
    fetch("f0-histogram.json")
        .then(response => response.json())
        .then(data => f0_histogram(data));
    fetch("compare-f0.json")
        .then(response => response.json())
        .then(data => compare_f0(data));
}
