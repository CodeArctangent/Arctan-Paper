function mandelbrot(x, y, detail) {
    let i = 0;
    let cx = -2 + x / 50;
    let cy = -2 + y / 50;
    let zx = 0;
    let zy = 0;

    do {
        xt = zx * zy;
        zx = zx * zx - zy * zy + cx;
        zy = 2 * xt + cy;
        i++;
    } while (i < 255 && zx * zx + zy * zy < detail) 

    let iString = i.toString(16);
    let gs = iString.length == 1 ? "0" + iString : iString;

    return [i, cx, cy, zx, zy, parseInt(gs, 16)];
}

console.log(mandelbrot(50, 50, 4));
