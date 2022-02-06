createImageBitmap = async function (data) {
	return new Promise((resolve, reject) => {
		let dataURL;
		if (data instanceof Blob) {
			dataURL = URL.createObjectURL(data);
		} else if (data instanceof ImageData) {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = data.width;
			canvas.height = data.height;
			ctx.putImageData(data,0,0);
			dataURL = canvas.toDataURL();
		} else {
			throw new Error('createImageBitmap does not handle the provided image source type');
		}
		const img = document.createElement('img');
		img.addEventListener('load',function () {
			resolve(this);
		});
		img.src = dataURL;
	});
};

class Paper {
	constructor(canvas, initWidth, initHeight) {
		let el = document.querySelector(canvas);
		this.ctx = el.getContext('2d');
		this.cvs = el;
		this.image = this.ctx.createImageData(initWidth, initHeight);
		this.ctx.canvas.width = initWidth;
		this.ctx.canvas.height = initHeight;
	}

	static fromContext(context) {
		let cvs = context.canvas;
		let ncv = new Paper(cvs, cvs.width, cvs.height);
		ncv._context = context;
		return ncv;
	}

	set context(context) {
		this.ctx = context;
		return this;
	}

	get context() {
		return this.ctx;
	}

	set width(width) {
		this.cvs.width = width;
		return this;
	}

	get width() {
		return this.cvs.width;
	}

	set height(height) {
		this.cvs.height = height;
		return this;
	}

	get height() {
		return this.cvs.height;
	}

	set cartesian(bool) {
		this.cart = bool;
		return this;
	}

	get cartesian() {
		return this.cart;
	}
	
	// Variables

	set fillStyle(str) {
		this.ctx.fillStyle = str;
		return this;
	}

	get fillStyle() {
		return this.ctx.fillStyle;
	}

	set strokeStyle(str) {
		this.ctx.strokeStyle = str;
		return this;
	}

	get strokeStyle() {
		return this.ctx.strokeStyle;
	}

	set lineWidth(str) {
		this.ctx.lineWidth = str;
		return this;
	}

	get lineWidth() {
		return this.ctx.lineWidth;
	}

	// Custom drawing functions

	clearRect(x, y, width, height) {
		y = this.cart ? this.cvs.height - y : y;
		height = this.cart ? height * -1 : height;
		this.ctx.clearRect(x, y, width, height);
		return this;
	}

	fillRect(x, y, width, height) {
		y = this.cart ? this.cvs.height - y : y;
		height = this.cart ? height * -1 : height;
		this.ctx.fillRect(x, y, width, height);
		return this;
	}

	strokeRect(x, y, width, height) {
		y = this.cart ? this.cvs.height - y : y;
		height = this.cart ? height * -1 : height;
		this.ctx.strokeRect(x, y, width, height);
		return this;
	}

	// Non-normal canvas functions

	resetCustomPixels() {
		this.image = this.ctx.createImageData(this.cvs.width, this.cvs.height);
	}
	
	renderCustomPixels(sx, sy) {
		createImageBitmap(this.image).then((img) => {
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

module.exports = {
	Paper,
	createImageBitmap
};