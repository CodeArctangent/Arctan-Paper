var offsetx = -512 / 2;
var offsety = -512 / 2;
var panx = -300;
var pany = 0;
var zoom = 700;
var palette = [];

function init() {
    generatePalette(1024, 16, 256, 64);
}

function generatePalette(colors, rd, gd, bd) {
    var roffset = 24;
    var goffset = 16;
    var boffset = 0;
    for (var i = 0; i < colors; i++) {
        palette[i] = { r: roffset, g: goffset, b: boffset };
        if (i < rd) {
            roffset += 3;
        } else if (i < gd) {
            goffset += 3;
        } else if (i < bd) {
            boffset += 3;
        }
    }
}

function setOffset(width, height) {
    offsetx = -width / 2;
    offsety = -height / 2;
}

function iterate(x, y, maxiterations) {
    var x0 = (x + offsetx + panx) / zoom;
    var y0 = (y + offsety + pany) / zoom;
    var a = 0;
    var b = 0;
    var rx = 0;
    var ry = 0;
    var iterations = 0;
    while (iterations < maxiterations && (rx * rx + ry * ry <= 4)) {
        rx = a * a - b * b + x0;
        ry = 2 * a * b + y0;
        a = rx;
        b = ry;
        iterations++;
    }
    var color;
    if (iterations == maxiterations) {
        color = { r: 0, g: 0, b: 0 };
    } else {
        var index = Math.floor((iterations / (maxiterations - 1)) * 255);
        color = palette[index];
    }
    return color;
}

function zoomFractal(x, y, factor, zoomin) {
    if (zoomin) {
        zoom *= factor;
        panx = factor * (x + offsetx + panx);
        pany = factor * (y + offsety + pany);
    } else {
        zoom /= factor;
        panx = (x + offsetx + panx) / factor;
        pany = (y + offsety + pany) / factor;
    }
}

init();