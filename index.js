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

class BetterTextMetrics {
	constructor(metrics) {
		this.metrics = metrics;
	}

	get width() {
		return Math.abs(this.metrics.actualBoundingBoxLeft) + Math.abs(this.metrics.actualBoundingBoxRight);
	}

	get height() {
		return Math.abs(this.metrics.actualBoundingBoxDescent) + Math.abs(this.metrics.actualBoundingBoxAscent);
	}
}

class Paper {
	constructor(canvas, initWidth, initHeight) {
		let el = document.querySelector(canvas);
		this.ctx = el.getContext('2d');
		this.cvs = el;
		this.image = this.ctx.createImageData(initWidth, initHeight);
		this.ctx.canvas.width = initWidth;
		this.ctx.canvas.height = initHeight;
		this.cart = false;
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

	set style(str) {
		this.ctx.fillStyle = str;
		this.ctx.strokeStyle = str;
		return this;
	}

	set lineWidth(str) {
		this.ctx.lineWidth = str;
		return this;
	}

	get lineWidth() {
		return this.ctx.lineWidth;
	}

	get center() {
		return [this.cvs.width / 2, this.cvs.height / 2];
	}

	set yUp(bool) {
		this.cart = bool;
		return this;
	}

	get yUp() {
		return this.cart;
	}

	set imageSmoothing(bool) {
		this.ctx.imageSmoothingEnabled = bool;
		return this;
	}

	get imageSmoothing() {
		return this.ctx.imageSmoothingEnabled;
	}

	// Custom drawing functions

	beginPath() {
		this.ctx.beginPath();
	}

	closePath() {
		this.ctx.closePath();
	}

	scale(x, y) {
		this.ctx.scale(x, y);
	}

	translate(x, y) {
		this.ctx.translate(x, y);
	}

	save() {
		this.ctx.save();
	}

	restore() {
		this.ctx.restore();
	}

	rect(x, y, width, height) {
		y = this.cart ? this.cvs.height - y - height : y;
		this.ctx.rect(x, y, width, height);
		return this;
	}

	clearRect(x, y, width, height) {
		y = this.cart ? this.cvs.height - y - height : y;
		this.ctx.clearRect(x, y, width, height);
		return this;
	}

	fillRect(x, y, width, height) {
		y = this.cart ? this.cvs.height - y - height : y;
		this.ctx.fillRect(x, y, width, height);
		return this;
	}

	strokeRect(x, y, width, height) {
		y = this.cart ? this.cvs.height - y - height : y;
		this.ctx.strokeRect(x, y, width, height);
		return this;
	}

	arc(x, y, radius, start, end, ccw = false) {
		y = this.cart ? this.cvs.height - y : y;
		start = this.cart ? start + Math.PI : start;
		end = this.cart ? end + Math.PI : end;
		this.ctx.arc(x, y, radius, start, end, ccw);
		return this;
	}

	fillArc(x, y, radius, start, end, ccw = false) {
		this.ctx.beginPath();
		this.arc(x, y, radius, start, end, ccw);
		this.ctx.fill();
		this.ctx.closePath();
		return this;
	}

	strokeArc(x, y, radius, start, end, ccw = false) {
		this.ctx.beginPath();
		this.arc(x, y, radius, start, end, ccw);
		this.ctx.stroke();
		this.ctx.closePath();
		return this;
	}

	circ(x, y, radius) {
		this.arc(x, y, radius, 0, Math.PI * 2);
		return this;
	}

	fillCirc(x, y, radius) {
		this.fillArc(x, y, radius, 0, Math.PI * 2);
		return this;
	}

	strokeCirc(x, y, radius) {
		this.strokeArc(x, y, radius, 0, Math.PI * 2);
		return this;
	}

	measureText(text) {
		return new BetterTextMetrics(this.ctx.measureText(text));
	}

	fillText(text, x, y, mw) {
		let height = this.measureText(text).height;
		y = this.cart ? this.cvs.height - y - height : y;
		this.ctx.fillText(text, x, y, mw);
		return this;
	}

	drawImage(image, ...data) {
		if (data.length == 2)
			data[1] = this.cart ? this.cvs.height - data[1] : data[1];
		else if (data.length == 4)
			data[1] = this.cart ? this.cvs.height - data[1] - data[3] : data[1];
		else if (data.length == 8)
			data[1] = this.cart ? this.cvs.height - data[5] - data[7] : data[1];
		this.ctx.drawImage(image, ...data);
		return this;
	}

	line(x, y, tx, ty) {
		this.ctx.beginPath();
		this.ctx.moveTo(x, y);
		this.ctx.lineTo(tx, ty);
		this.ctx.stroke();
		this.ctx.closePath();
		return this;
	}

	stroke() {
		this.ctx.stroke();
		return this;
	}

	fill() {
		this.ctx.fill();
		return this;
	}

	rotatePoint(x, y, radians) {
		this.ctx.translate(x, y);
		this.ctx.rotate(radians);
		this.ctx.translate(x * -1, y * -1);
		return this;
	}

	rotate(radians) {
		this.ctx.rotate(radians);
		return this;
	}
	
	// Non-normal canvas functions

	resetCustomPixels() {
		this.image = this.ctx.createImageData(this.cvs.width, this.cvs.height);
		return this;
	}
	
	renderCustomPixels(sx, sy) {
		createImageBitmap(this.image).then((img) => {
			this.ctx.drawImage(img, sx, sy);
		});
		return this;
	}

	setPixel(x, y, r, g, b, a) {
		const pos = ((y * (this.image.width * 4)) + (x * 4));
		this.image.data[pos] = r;
		this.image.data[pos + 1] = g;
		this.image.data[pos + 2] = b;
		this.image.data[pos + 3] = a;
		return this;
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
		this.renderCustomPixels(sx, sy);
		return this;
	}

	// Static Methods

	static lerp(stt, end, fac) {
        return stt * (1 - fac) + end * fac;
    }

    static toDegrees(rad) {
        return (180 / Math.PI) * rad;
    }

    static toRadians(deg) {
        return (Math.PI / 180) * deg;
    }
}

// module.exports = {
// 	Paper,
// 	createImageBitmap
// };