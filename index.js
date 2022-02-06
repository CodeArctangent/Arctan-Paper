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

class Paper extends CanvasRenderingContext2D {
	constructor(canvas, initWidth, initHeight, setCartesian = false) {
		let el = document.querySelector(canvas);
		this.ctx = el.getContext('2d');
		this.cvs = el;
		this.image = this.ctx.createImageData(initWidth, initHeight);
		this.cart = setCartesian;
		this.ctx.canvas.width = initWidth;
		this.ctx.canvas.height = initHeight;
	}

	static fromContext(context, setCartesian = false) {
		let cvs = context.canvas;
		let ncv = new Paper(cvs, cvs.width, cvs.height, setCartesian);
		ncv._context = context;
		return ncv;
	}

	set context(context) {
		this.ctx = context;
	}

	get context() {
		return this.ctx;
	}

	get width() {
		return this.cvs.width;
	}

	get height() {
		return this.cvs.height;
	}



	// Non-normal canvas functions
	
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