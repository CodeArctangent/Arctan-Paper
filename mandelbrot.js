function iterateEquation(Cr, Ci, escapeRadius, iterations) {
    var Zr = 0;
    var Zi = 0;
    var Tr = 0;
    var Ti = 0;
    var n = 0;
    for (; n < iterations && (Tr + Ti) <= escapeRadius; ++n) {
        Zi = 2 * Zr * Zi + Ci;
        Zr = Tr - Ti + Cr;
        Tr = Zr * Zr;
        Ti = Zi * Zi;
    }
    /*
     * Four more iterations to decrease error term;
     * see http://linas.org/art-gallery/escape/escape.html
     */
    for (var e = 0; e < 4; ++e) {
        Zi = 2 * Zr * Zi + Ci;
        Zr = Tr - Ti + Cr;
        Tr = Zr * Zr;
        Ti = Zi * Zi;
    }
    return [n, Tr, Ti];
}
