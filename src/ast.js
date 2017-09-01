export class Context {
	constructor() {
		this.symbolHeap = {};
	}
}

export function intern(str) {
	if(typeof str === "string") {
		return Symbol.for(str);
	} else if(str instanceof ArrayBuffer) {
		const decoder = new TextDecoder("utf-8");
		return Symbol.for(decoder.decode(str));
	} else {
		throw new Error("Cannot intern non-string: " + str);
	}
}

export class Value {
	constructor(typeName) {
		this.typeName = typeName;
	}
}

export class ValueSymbol extends Value {
	constructor(sym) {
		super("Symbol");
		this.value = intern(sym);
	}
}
