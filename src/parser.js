export function parse(arrayBuffer) {
	const bytecode = new DataView(arrayBuffer);
	return new Promise(function(resolve, reject) {
		checkHeaderMagic(bytecode, reject);
		const nMods = bytecode.getUint32(16, true);
		resolve(nMods);
	});
}

export class ParseError extends Error {
	constructor(type, pos, msg) {
		super(msg);
		this.type = type;
		this.pos = pos;
		this.msg = msg;
	}

	toString() {
		return "[" + this.type + "] " + this.msg + " (at byte " + this.pos + ")";
	}
}

function checkHeaderMagic(bytecode, reject) {
	// The shortest possible bytecode blob is the 16-byte signature plus a zero
	// length specifier, for a total of 20 bytes.
	if(bytecode.byteLength < 20) {
		reject(new ParseError("TOOSHORT", bytecode.byteLength,
			"The bytecode is too short to be valid"));
	}

	// The header magic is "oftlisp anfirbc\0".
	const magic = [0x6f, 0x66, 0x74, 0x6c, 0x69, 0x73, 0x70, 0x20, 0x61, 0x6e,
		0x66, 0x69, 0x72, 0x62, 0x63, 0x00];
	for(const i in magic) {
		const w = magic[i];
		const g = bytecode.getUint8(i);
		if(w !== g) {
			reject(new ParseError("BADMAGIC", i,
				"The header magic was invalid"));
		}
	}
}
