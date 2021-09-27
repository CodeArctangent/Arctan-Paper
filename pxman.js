class PXMAN {
	constructor(context, initWidth, initHeight, setCartesian = false) {
		this.ctx = context;
		this.image = this.ctx.createImageData(initWidth, initHeight);
		this.cart = setCartesian;
		this.ctx.canvas.width = initWidth;
		this.ctx.canvas.height = initHeight;
	}
	
	render(sx, sy) {
		window.createImageBitmap(this.image).then((img) => {
			this.ctx.drawImage(img, sx, sy);
		});
	}
	
	setPixel(x, y, r, g, b, a) {
		const pos = ((y * (this.image.width * 4)) + (x * 4));
		this.image.data[pos] = r;
		this.image.data[pos + 1] = g;
		this.image.data[pos + 2] = b;
		this.image.data[pos + 3] = a;
	}

	HexToRGB(hex) {
		var rgbHex = hex.match(/.{1,2}/g);
		return [
			parseInt(rgbHex[0], 16),
			parseInt(rgbHex[1], 16),
			parseInt(rgbHex[2], 16)
		];
	}
	
	getPixel(x, y) {
		const pos = ((y * (this.image.width * 4)) + (x * 4));
		let rgba = [this.image.data[pos],
		this.image.data[pos + 1],
		this.image.data[pos + 2],
		this.image.data[pos + 3]];
		return rgba;
	}

	runComponent(sx, sy, callback) {
		for (let y = 0; y < this.image.height; ++y) {
			for (let x = 0; x < this.image.width; ++x) {
				let [r, g, b, a] = callback(x, y * -1 + this.image.height, this.image.width, this.image.height);
				this.setPixel(x, y, r, g, b, a);
			}
		}
		this.render(sx, sy);
	}
}