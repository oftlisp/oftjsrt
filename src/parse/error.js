export default class ParseError extends Error {
	constructor(type, pos, msg, next) {
		super(msg);
		this.type = type;
		this.pos = pos;
		this.msg = msg;
		this.next = next;
	}

	// Throws a new error consed onto this one.
	chain(type, pos, msg) {
		throw new ParseError(type, pos, msg, this);
	}

	// Converts the error to a string.
	toString() {
		let str = "[" + this.type + "] " + this.msg + " (" + this.pos + " bytes in)";
		if(this.next) {
			str += "\n";
			str += this.next.toString();
		}
		return str;
	}
}
