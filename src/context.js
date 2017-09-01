import defaultBuiltinModules from "./builtins.js";
import parse from "./parser.js";

export default class Context {
	constructor(builtinModules) {
		if(!builtinModules) {
			builtinModules = defaultBuiltinModules;
		}
		this.modules = builtinModules;
	}

	// Loads modules from the given bytecode, inserting them into the context.
	loadBytecode(bytecode) {
		const modules = parse(bytecode);
		// TODO
		throw modules;
	}
}
