export function parse(arrayBuffer, ast) {
	const bytecode = new DataView(arrayBuffer);
	return new Promise(function(resolve, reject) {
		checkHeaderMagic(bytecode, reject);
		const nMods = bytecode.getUint32(16, true);
		let mods = [];
		let pos = 20;
		for(let i = 0; i < nMods; i++) {
			const [mod, newPos] = parseModule(bytecode, pos, reject, ast);
			mods.push(mod);
			pos = newPos;
		}
		resolve(mods);
	});
}

export class ParseError extends Error {
	constructor(type, pos, msg, next) {
		super(msg);
		this.type = type;
		this.pos = pos;
		this.msg = msg;
		this.next = next;
	}

	toString() {
		let str = "[" + this.type + "] " + this.msg + " (at byte " + this.pos + ")";
		if(this.next) {
			str += "\n";
			str += this.next.toString();
		}
		return str;
	}
}

function checkHeaderMagic(bytecode, reject) {
	// The header magic is "oftlisp anfirbc\0".
	const magic = [0x6f, 0x66, 0x74, 0x6c, 0x69, 0x73, 0x70, 0x20, 0x61, 0x6e,
		0x66, 0x69, 0x72, 0x62, 0x63, 0x00];
	for(const i in magic) {
		const w = magic[i];
		const g = bytecode.getUint8(i);
		if(w !== g) {
			reject(new ParseError("BADMAGIC", i, "The header magic was invalid"));
		}
	}
}

function parseModule(bytecode, pos, reject, ast) {
	const nDecls = bytecode.getUint32(pos, true);
	let decls = {};
	pos += 4;
	for(let i = 0; i < nDecls; i++) {
		const [name, decl, newPos] = parseDecl(bytecode, pos, reject, ast);
		decls[name] = decl;
		pos = newPos;
	}
	return [decls, pos];
}

function parseDecl(bytecode, pos, reject, ast) {
	const [name, pos2] = parseSymbol(bytecode, pos, reject, ast);
	const [expr, pos3] = parseExpr(bytecode, pos2, reject, ast);
	return [name, expr, pos3];
}

function parseExpr(bytecode, pos, reject, ast) {
	const type = bytecode.getUint8(pos);
	if(type === 0x10) {
		const [func, newPos] = parsePrim(bytecode, pos+1, reject, ast);
		const nArgs = bytecode.getUint32(newPos, true);
		let args = [];
		pos = newPos + 4;
		for(let i = 0; i < nArgs; i++) {
			const [arg, newPos] = parsePrim(bytecode, pos, reject, ast);
			args.push(arg);
			pos = newPos;
		}
		return [ast.call(func, args, reject), pos];
	} else if(type === 0x11) {
		const [c, pos2] = parsePrim(bytecode, pos+1, reject, ast);
		const [t, pos3] = parseExpr(bytecode, pos2, reject, ast);
		const [e, pos4] = parseExpr(bytecode, pos3, reject, ast);
		return [ast.if(c, t, e, reject), pos4];
	} else if(type === 0x12) {
		const [a, pos2] = parseExpr(bytecode, pos+1, reject, ast);
		const [b, pos3] = parseExpr(bytecode, pos2, reject, ast);
		return [ast.let(null, a, b, reject), pos3];
	} else if(type === 0x13) {
		const [n, pos2] = parseSymbol(bytecode, pos+1, reject, ast);
		const [a, pos3] = parseExpr(bytecode, pos2, reject, ast);
		const [b, pos4] = parseExpr(bytecode, pos3, reject, ast);
		return [ast.let(n, a, b, reject), pos4];
	} else {
		return parsePrim(bytecode, pos, err => {
			reject(new ParseError("BADEXPR", pos, "The type byte " + type +
				" does not correspond to an expr", err));
		}, ast);
	}
}

function parsePrim(bytecode, pos, reject, ast) {
	const type = bytecode.getUint8(pos);
	if(type === 0x08) {
		const [args, pos2] = parseArgs(bytecode, pos+1, reject, ast);
		const [body, pos3] = parseExpr(bytecode, pos2, reject, ast);
		return [ast.fn(null, args, body, reject), pos3];
	} else if(type === 0x09) {
		const [name, pos2] = parseSymbol(bytecode, pos+1, reject, ast);
		const [args, pos3] = parseArgs(bytecode, pos2, reject, ast);
		const [body, pos4] = parseExpr(bytecode, pos3, reject, ast);
		return [ast.fn(name, args, body, reject), pos4];
	} else if(type === 0x0a) {
		const [name, newPos] = parseSymbol(bytecode, pos+1, reject, ast);
		return [ast.var(name, reject), newPos];
	} else if(type === 0x0b) {
		const nPrims = bytecode.getUint32(pos+1, true);
		let prims = [];
		pos += 5;
		for(let i = 0; i < nPrims; i++) {
			const [prim, newPos] = parsePrim(bytecode, pos, reject, ast);
			prims.push(prim);
			pos = newPos;
		}
		return [ast.vec(prims, reject), pos];
	} else {
		return parseValue(bytecode, pos, err => {
			reject(new ParseError("BADPRIM", pos, "The type byte " + type +
				" does not correspond to a prim", err));
		}, ast);
	}
}

function parseArgs(bytecode, pos, reject, ast) {
	const nArgs = bytecode.getUint32(pos, true);
	let args = [];
	pos += 4;
	for(let i = 0; i < nArgs; i++) {
		const [arg, newPos] = parseSymbol(bytecode, pos, reject, ast);
		args.push(arg);
		pos = newPos;
	}
	return [args, pos];
}

function parseValue(bytecode, pos, reject, ast) {
	const type = bytecode.getUint8(pos);
	if(type === 0x00) {
		return [ast.nil(reject), pos+1];
	} else if(type === 0x01) {
		const [head, pos2] = parseValue(bytecode, pos+1, err => {
			reject(new ParseError("BADCONS", pos+1, "Failed to parse the head of a cons", err));
		}, ast);
		const [tail, pos3] = parseValue(bytecode, pos2, err => {
			reject(new ParseError("BADCONS", pos+1, "Failed to parse the tail of a cons", err));
		}, ast);
		return [ast.cons(head, tail, reject), pos3];
	} else if(type === 0x02) {
		return parseSymbol(bytecode, pos+1, reject, ast);
	} else if(type === 0x03) {
		const ctor = (s, reject) => ast.string(s, reject);
		return parseStringish(bytecode, pos+1, ctor, reject);
	} else if(type === 0x04) {
		const n = bytecode.getUint8(pos+1);
		return [ast.byte(n, reject), pos+2];
	} else if(type === 0x05) {
		const n = bytecode.getUint32(pos+1, true);
		return [ast.fixnum(n, reject), pos+5];
	} else {
		reject(new ParseError("BADVALUE", pos, "The type byte " + type +
			" does not correspond to a value"));
	}
}

function parseSymbol(bytecode, pos, reject, ast) {
	const ctor = (s, reject) => ast.symbol(s, reject);
	return parseStringish(bytecode, pos, ctor, reject);
}

function parseStringish(bytecode, pos, ctor, reject) {
	const length = bytecode.getUint32(pos, true);
	const bytes = bytecode.buffer.slice(pos+4, pos+4+length);
	return [ctor(bytes, reject), bytes];
}
