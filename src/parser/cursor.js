import { bytesToString, bytesToSymbol } from "../bytes.js";
import ParseError from "./error.js";

export default class Cursor {
	constructor(buffer, initialPos) {
		this.buffer = buffer;
		this.pos = initialPos || 0;
	}

	// Backs up by one character.
	back() {
		this.pos--;
		return this;
	}

	// Throws an error at the current position.
	error(type, msg, next) {
		throw new ParseError(type, this.pos, msg, next);
	}

	// Throws an error if there is any remaining content.
	mustEof() {
		if(this.buffer.byteLength > this.pos) {
			this.error("TRAILING", "Trailing bytes");
		}
	}

	// Advances one byte, returning it.
	readByte() {
		return this.buffer.getUint8(this.pos++);
	}

	// Reads a length word, then reads that many bytes. Returns the non-length
	// bytes read.
	readBytes() {
		const len = this.readLength();
		const bytes = this.buffer.buffer.slice(this.pos, this.pos+len);
		this.pos += len;
		return bytes;
	}

	// Advances one unsigned 32-bit word, returning it.
	readLength() {
		const word = this.buffer.getUint32(this.pos, true);
		this.pos += 4;
		return word;
	}

	// Reads a length word,  then runs the reader function that many times,
	// returning the aggregated results.
	readMany(readOne) {
		const len = this.readLength();
		let out = [];
		for(let i = 0; i < len; i++) {
			out.push(readOne(this));
		}
		return out;
	}

	// Reads bytes as in readBytes(), then converts them to a string.
	readString() {
		return bytesToString(this.readBytes());
	}

	// Reads bytes as in readBytes(), then interns them into a symbol.
	readSymbol() {
		return bytesToSymbol(this.readBytes());
	}

	// Advances one signed 32-bit word, returning it.
	readWord() {
		const word = this.buffer.getInt32(this.pos, true);
		this.pos += 4;
		return word;
	}
}
