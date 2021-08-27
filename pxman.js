class PXMAN {
	constructor(initWidth, initHeight) {
		this.image = ctx.createImageData(initWidth, initHeight);
		this.width = initWidth;
		this.height = initHeight;
	}
	
	render(sx, sy) {
		window.createImageBitmap(this.image).then((img) => {
			ctx.drawImage(img, sx, sy);
		});
	}
	
	setPixel(x, y, r, g, b, a) {
		const pos = ((y * (this.image.width * 4)) + (x * 4));
		this.image.data[pos] = r;
		this.image.data[pos + 1] = g;
		this.image.data[pos + 2] = b;
		this.image.data[pos + 3] = a;
	}
}