class PXMAN {
	constructor(initWidth, initHeight, setCartesian) {
		this.image = ctx.createImageData(initWidth, initHeight);
		this.cart = setCartesian;
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