var audioCtx = new AudioContext();

var mapsdata = null;
fetch('samples/tracks.json', {method:'GET'}).then(response => {
    response.json().then(data => {
        mapsdata = data;
        refresh_maps();
    });
});

function linspace(start, stop, length) {
    var result = new Array(length);
    var step = (stop-start)/(length-1);
    for (var n=0; n<length; n++) {
        result[n] = start + n*step;
    }
    return result;
}

function split_blocks(data, blocksize, hopsize, samplerate) {
    var length = Math.ceil( (data.length-blocksize) / hopsize );
    var times = new Array(length);
    var blocklist = new Array(length);
    for (var n=0; n<length; n++) {
        idx = n*hopsize;
        times[n] = idx/samplerate;
        blocklist[n] = data.slice(idx, idx+blocksize);
    }
    return [blocklist, times];
}

function hann(length) {
    var result = new Array(length);
    for (var n=0; n<length; n++) {
        result[n] = 0.5 * (1 - Math.cos( (2*Math.PI*n)/(length-1) ));
    }
    return result;
}

function hannpoisson(length, alpha) {
    var normalization = (length-1) / 2;
    var result = new Array(length);
    var idx = linspace(-normalization, normalization, length);
    for (var n=0; n<length; n++) {
        var poisson = Math.exp(-alpha*Math.abs(idx[n] / normalization));
        var hann = 1/2 * (1+Math.cos(Math.PI*idx[n] / normalization));
        result[n] = poisson * hann;
    }
    return result;
}

function logabsrfft(real, window) {
    var imag = new Array(real.length);
    for (var n=0; n<imag.length; n++) {
        real[n] = real[n]*window[n];
        imag[n] = 0;
    }
    transform(real, imag);
    var result = new Array(real.length/2);
    for (var n=0; n<result.length; n++) {
        result[n] = 20*Math.log10(Math.sqrt(real[n]*real[n] + imag[n]*imag[n])/real.length);
    }
    return result;
}

function display_spectrogram(filename, divname, size, tracks) {
    fetch(filename, {method:'GET'}).then(response => {
        response.arrayBuffer().then(arraybuffer => {
            audioCtx.decodeAudioData(arraybuffer).then(audiobuffer => {
                var data = audiobuffer.getChannelData(0);
                var blocksize = 2048;
                var hopsize = 256;
                var [blocks, time] = split_blocks(data, blocksize, hopsize, audiobuffer.sampleRate);
                var window = hann(blocksize);
                var stft = Array.from(blocks, b => Array.from(logabsrfft(b, window)));
                var frequency = linspace(0, audiobuffer.sampleRate/2, stft[0].length)
                var plotdata = [{
                    x: time,
                    y: frequency,
                    z: stft,
                    type: 'heatmap',
                    colorscale: 'Viridis',
                    zmax: 0,
                    zmin: -60,
                    transpose: true,
                    colorbar: { title: 'level in dB FS',
                                titleside: 'right' }
                }];
                if (typeof tracks.true_t !== 'undefined') {
                    plotdata = plotdata.concat({
                        x: tracks.true_t,
                        y: Array.from(tracks.true_f, f => f!=0?f:NaN),
                        name: 'true f0',
                        type: 'scatter',
                        mode: 'lines',
                        line: {color: 'orange'}
                    });
                }
                if (typeof tracks.est_t !== 'undefined') {
                    plotdata = plotdata.concat({
                        x: tracks.est_t,
                        y: Array.from(tracks.est_f, f => f!=0?f:NaN),
                        name: 'estimated f0',
                        type: 'scatter',
                        mode: 'markers',
                        marker: {size: 3},
                        line: {color: 'red'}
                    });
                    plotdata[0].colorbar.ypad = 30;
                    plotdata[0].colorbar.y = 0.4
                }
                var plotlayout = {
                    xaxis: { autorange: true, title: 'time in s' },
                    yaxis: { range: [0, 2000], title: 'frequency in Hz' },
                    margin: { t:20, r:20, b:50, l:100 }
                };
                if (size) {
                    [plotlayout.width, plotlayout.height] = size;
                }
                Plotly.newPlot(divname, plotdata, plotlayout);
            });
        });
    });
}

function ifd_spectrum(block, window) {
    var imag = new Array(window.length);
    var real = new Array(window.length);
    var result = new Array(window.length/2);
    // first spectrum
    for (var n=0; n<window.length; n++) {
        real[n] = block[n]*window[n];
        imag[n] = 0;
    }
    transform(real, imag);
    for (var n=0; n<result.length; n++) {
        result[n] = Math.atan2(imag[n], real[n]);
    }

    // second spectrum
    var dt = block.length - window.length;
    for (var n=0; n<window.length; n++) {
        real[n] = block[n+dt]*window[n];
        imag[n] = 0;
    }
    transform(real, imag);
    var baseband_phase_change = linspace(0, Math.PI*dt, result.length);
    for (var n=0; n<result.length; n++) {
        result[n] = Math.atan2(imag[n], real[n]) - result[n];
        result[n] -= baseband_phase_change[n];
        if (result[n] > Math.PI) {
            result[n] -= Math.ceil((result[n]-Math.PI)/(2*Math.PI))*2*Math.PI;
        }
        if (result[n] < -Math.PI) {
            result[n] -= Math.floor((result[n]+Math.PI)/(2*Math.PI))*2*Math.PI;
        }
        result[n] *= 80 / Math.PI;
    }
    return result;
}

function display_ifd(filename, divname, size) {
    fetch(filename, {method:'GET'}).then(response => {
        response.arrayBuffer().then(arraybuffer => {
            audioCtx.decodeAudioData(arraybuffer).then(audiobuffer => {
                var data = audiobuffer.getChannelData(0);
                var dt = Math.floor(audiobuffer.sampleRate / 160);
                var blocksize = 2048+dt;
                var hopsize = 256;
                var [blocks, time] = split_blocks(data, blocksize, hopsize, audiobuffer.sampleRate);
                var window = hannpoisson(blocksize-dt, 2);
                var ifd = Array.from(blocks, b => Array.from(ifd_spectrum(b, window)));
                var frequency = linspace(0, audiobuffer.sampleRate/2, ifd[0].length)
                var plotdata = [{
                    x: time,
                    y: frequency,
                    z: ifd,
                    zmin: -80,
                    zmax: 80,
                    type: 'heatmap',
                    colorscale: twilight(),
                    transpose: true,
                    colorbar: { title: 'IFD in Hz',
                                titleside: 'right' }
                }];
                var plotlayout = {
                    xaxis: { autorange: true, title: 'time in s' },
                    yaxis: { range: [0, 4000], title: 'frequency in Hz' },
                    margin: { t:20, r:20, b:50, l:100 }
                };
                if (size) {
                    [plotlayout.width, plotlayout.height] = size;
                }
                Plotly.newPlot(divname, plotdata, plotlayout);
            });
        });
    });
}


function twilight() {
    var colors = ['rgb(0.15460852, 0.03000286, 0.18789489)',
                  'rgb(0.2327317 , 0.05712593, 0.22495882)',
                  'rgb(0.36188334, 0.09027973, 0.28681618)',
                  'rgb(0.48858861, 0.13099415, 0.31359736)',
                  'rgb(0.59580496, 0.20647443, 0.31193222)',
                  'rgb(0.67806939, 0.30681452, 0.31584052)',
                  'rgb(0.73768789, 0.41957169, 0.34821851)',
                  'rgb(0.77613869, 0.53950688, 0.42753006)',
                  'rgb(0.80432873, 0.65900778, 0.56115682)',
                  'rgb(0.84614733, 0.77096352, 0.72954568)',
                  'rgb(0.91589042, 0.87825797, 0.89580632)',
                  'rgb(0.95588623, 0.91961077, 0.95812116)',
                  'rgb(0.80804251, 0.83322322, 0.85463767)',
                  'rgb(0.65495439, 0.75260107, 0.7950067 )',
                  'rgb(0.52418136, 0.66680884, 0.76840101)',
                  'rgb(0.43330824, 0.57287707, 0.75267815)',
                  'rgb(0.38654279, 0.47038193, 0.73348035)',
                  'rgb(0.37258013, 0.35908705, 0.69749231)',
                  'rgb(0.36540817, 0.24084915, 0.63060103)',
                  'rgb(0.33609404, 0.12994744, 0.51184794)',
                  'rgb(0.25965113, 0.06941247, 0.34424417)',
                  'rgb(0.15460852, 0.03000286, 0.18789489)'];
    return Array.from(colors, (color, idx) => [idx/(colors.length-1), color]);
}

function refresh_maps() {
    var speaker = document.getElementById("maps:speaker").value;
    var snr = document.getElementById("maps:snr").value;
    var noise = document.getElementById("maps:noise").value;
    display_maps(speaker + noise + snr + ".wav");
}

function display_maps(filename) {
    document.getElementById("maps:player").src = 'samples/' + filename;
    display_spectrogram('samples/' + filename, "maps", [650, 300], mapsdata[filename]);
}

fetch('Mann_short.json', {method:'GET'}).then(response => {
    response.json().then(data => {
        display_spectrogram("Mann_short.wav", "introspectrogram", [650, 300], data);
    });
});
