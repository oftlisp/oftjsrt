import intern from "./symbol.js";

export class Module {
	constructor(name, exports, imports, decls) {
		this.name = name;
		this.exports = exports;
		this.imports = imports;
		this.decls = decls;
	}
}

export class Decl {
	constructor(name, expr) {
		this.name = name;
		this.expr = expr;
	}
}

export class Value {
	constructor(typeName) {
		this.typeName = typeName;
	}
}
