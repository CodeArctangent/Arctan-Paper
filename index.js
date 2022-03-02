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

class BetterTextMetrics { // Replace the shitty normal text metrics that canvas uses which has inaccurate width, and doesnt support height??
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

	get canvas() {
		return this.ctx.canvas;
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

	// Special Functions

	beginRenderLoop(callback) {
		this.time = 0;
		this.frame = window.requestAnimationFrame(() => {
			this.renderLoop();
		});
		this.renderFunc = callback;
	}

	pauseRenderLoop() {
		window.cancelAnimationFrame(this.frame);
	}

	renderLoop() {
		this.time += 16.666667; // 1000 / 60 - 60 frames per second
		this.frame = window.requestAnimationFrame(() => {
			this.renderFunc(this.time, this.time / 1000);
			this.renderLoop();
		});
	}

	// Custom drawing functions

	debugAxis(x, y, radius) {
		this.save();
		this.fillStyle = 'white';
		this.ctx.font = '16px "Times New Roman"';
		this.lineWidth = 2;
		this.strokeStyle = 'rgb(255, 0, 0)';
		this.line(x, y, x + radius, y);
		this.strokeStyle = 'rgb(0, 255, 0)';
		this.line(x, y, x, y + radius);
		let str = this.cart ? 'Cartesian Coords' : 'Non-Cartesian Coords';
		let text = this.measureText(str);
		this.strokeStyle = 'gray';
		this.lineWidth = 1;
		this.strokeRect(x + 2, y + 2, text.width + 4, text.height + 4);
		this.fillText(str, x + 4, y + 4);
		this.restore();
	}

	clear() {
		this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
	}

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

	pixel(x, y, color) {
		this.ctx.save();
		this.ctx.fillStyle = color;
		this.fillRect(x, y, 1, 1);
		this.ctx.restore();
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
		let txt = this.measureText(text);
		y = this.cart ? this.cvs.height - y : y;
		this.ctx.fillText(text, x, y, mw);
		return this;
	}

	strokeText(text, x, y, mw) {
		let height = this.measureText(text).height;
		y = this.cart ? this.cvs.height - y - height : y;
		this.ctx.strokeText(text, x, y, mw);
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
		y = this.cart ? this.cvs.height - y : y;
		ty = this.cart ? this.cvs.height - ty : ty;
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

module.exports = {
	Paper,
	createImageBitmap
};