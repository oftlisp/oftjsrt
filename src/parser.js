import { Decl, Module } from "./ast.js";
import Cursor from "./parse/cursor.js";
import ParseError from "./parse/error.js";

export function parse(arrayBuffer) {
	const bytecode = new DataView(arrayBuffer);
	return new Promise(function(resolve, reject) {
		checkHeaderMagic(bytecode, reject);
		const cursor = new Cursor(bytecode, 16);
		const modules = cursor.readMany(readModule);
		cursor.mustEof();
		resolve(modules);
	});
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
	const expr = []; // TODO
	return new Decl(name, expr);
}
