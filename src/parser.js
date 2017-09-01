import { Args, Decl, ExprCall, LiteralByte, LiteralCons, LiteralFixnum,
	LiteralNil, LiteralString, LiteralSymbol, Module, PrimFn, PrimVar } from "./ast.js";
import { bytesToSymbol } from "./bytes.js";
import Cursor from "./parser/cursor.js";
import ParseError from "./parser/error.js";

export default function parse(arrayBuffer) {
	const bytecode = new DataView(arrayBuffer);
	checkHeaderMagic(bytecode);
	const cursor = new Cursor(bytecode, 16);
	const modules = cursor.readMany(readModule);
	cursor.mustEof();
	return modules;
}

function checkHeaderMagic(bytecode) {
	// The header magic is "oftlisp anfirbc\0".
	const magic = [0x6f, 0x66, 0x74, 0x6c, 0x69, 0x73, 0x70, 0x20, 0x61, 0x6e,
		0x66, 0x69, 0x72, 0x62, 0x63, 0x00];
	for(const i in magic) {
		const w = magic[i];
		const g = bytecode.getUint8(i);
		if(w !== g) {
			throw new ParseError("BADMAGIC", i, "The header magic was invalid");
		}
	}
}

function readModule(cursor) {
	function readPort(cursor) {
		const name = cursor.readSymbol();
		const vals = cursor.readMany(c => c.readSymbol());
		return [name, vals];
	}

	const [name, exports] = readPort(cursor);
	const imports = cursor.readMany(readPort);
	const decls = cursor.readMany(readDecl);
	return new Module(name, exports, imports, decls);
}

function readDecl(cursor) {
	const name = cursor.readSymbol();
	const expr = readExpr(cursor);
	return new Decl(name, expr);
}

function readExpr(cursor) {
	const type = cursor.readByte();
	if(type === 0x10) {
		const fn = readExpr(cursor);
		const args = cursor.readMany(readExpr);
		return new ExprCall(fn, args);
	} else {
		return readPrim(cursor.back());
	}
}

function readPrim(cursor) {
	const type = cursor.readByte();
	if(type === 0x08) {
		const args = readArgs(cursor);
		const body = readExpr(cursor);
		return new PrimFn(null, args, body);
	} else if(type === 0x09) {
		const name = cursor.readSymbol();
		const args = readArgs(cursor);
		const body = readExpr(cursor);
		return new PrimFn(name, args, body);
	} else if(type === 0x0a) {
		return new PrimVar(cursor.readSymbol());
	} else if(type === 0x0b) {
		throw new Error("TODO 11");
	} else {
		return readValue(cursor.back());
	}
}

function readArgs(cursor) {
	function readOptional(cursor) {
		const name = cursor.readSymbol();
		const defV = readValue(cursor);
		return [name, defV];
	}

	const required = cursor.readMany(c => c.readSymbol());
	const optional = cursor.readMany(readOptional);
	const restBytes = cursor.readBytes();
	let rest = null;
	if(restBytes.byteLength > 0) {
		rest = bytesToSymbol(restBytes);
	}
	return new Args(required, optional, rest);
}

function readValue(cursor) {
	const type = cursor.readByte();
	if(type === 0x00) {
		return new LiteralNil();
	} else if(type === 0x01) {
		const head = readValue(cursor);
		const tail = readValue(cursor);
		return new LiteralCons(head, tail);
	} else if(type === 0x02) {
		return new LiteralSymbol(cursor.readSymbol());
	} else if(type === 0x03) {
		return new LiteralString(cursor.readString());
	} else if(type === 0x04) {
		return new LiteralByte(cursor.readByte());
	} else if(type === 0x05) {
		return new LiteralFixnum(cursor.readWord());
	} else {
		throw new Error("TODO readValue " + type);
	}
}
