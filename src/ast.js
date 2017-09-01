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

export class Expr {
	constructor(typeName) {
		this.typeName = typeName;
	}
}

export class ExprCall extends Expr {
	constructor(fn, args) {
		super("Call");
		this.fn = fn;
		this.args = args;
	}
}

export class Prim extends Expr {
	constructor(typeName) {
		super("Prim(" + typeName + ")");
	}
}

export class PrimFn extends Expr {
	constructor(name, args, body) {
		super("Fn");
		this.name = name;
		this.args = args;
		this.body = body;
	}
}

export class PrimVar extends Expr {
	constructor(name) {
		super("Var");
		this.name = name;
	}
}

export class Literal extends Prim {
	constructor(typeName) {
		super("Literal(" + typeName + ")");
	}
}

export class LiteralByte extends Literal {
	constructor(value) {
		super("Byte");
		this.value = value;
	}
}

export class LiteralCons extends Literal {
	constructor(head, tail) {
		super("Cons");
		this.head = head;
		this.tail = tail;
	}
}

export class LiteralFixnum extends Literal {
	constructor(value) {
		super("Fixnum");
		this.value = value;
	}
}

export class LiteralNil extends Literal {
	constructor() {
		super("Nil");
	}
}

export class LiteralString extends Literal {
	constructor(value) {
		super("String");
		this.value = value;
	}
}

export class LiteralSymbol extends Literal {
	constructor(value) {
		super("Symbol");
		this.value = value;
	}
}

export class Args {
	constructor(req, opt, rst) {
		this.req = req;
		this.opt = opt;
		this.rst = rst;
	}
}
