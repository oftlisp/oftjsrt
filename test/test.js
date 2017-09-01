const expect = require("chai").expect;
const fs = require("fs");
const oftjsrt = require("../oftjsrt.js");
const P = require("path");

describe("Parser", function() {
	function parseBC(name) {
		const path = P.join(__dirname, name + ".anfir");
		const buffer = new Uint8Array(fs.readFileSync(path)).buffer;
		return oftjsrt.parse(buffer);
	}

	it("exists", function() {
		expect(oftjsrt.parse).to.be.a("function");
	});
	it("works for an empty bytecode", function() {
		const mods = parseBC("empty");
		expect(mods.length).to.equal(0);
	});
	it("works for hello world", function() {
		const mods = parseBC("hello");

		// Check the number of modules.
		expect(mods.length).to.equal(1);
		const mod = mods[0];

		// Check the module name.
		expect(Symbol.keyFor(mod.name)).to.equal("std/internal/examples/hello-world");

		// Check the module exports.
		expect(mod.exports.length).to.equal(1);
		expect(mod.exports.map(Symbol.keyFor)).to.deep.equal(["main"]);

		// Check the module imports.
		expect(mod.imports.length).to.equal(0);

		// Check the number of decls.
		expect(mod.decls.length).to.equal(1);
		const decl = mod.decls[0];

		// Check that the decoded expression is correct.
		//
		// In general, this is a bad idea, as it precludes optimizations
		// performed by the initial compiler. However, the hello world
		// example is simple enough that no optimizations should affect it.
		expect(decl).to.deep.equal(new oftjsrt.ast.Decl(Symbol.for("main"),
			new oftjsrt.ast.PrimFn(Symbol.for("main"),
				new oftjsrt.ast.Args([], [], null),
				new oftjsrt.ast.ExprCall(
					new oftjsrt.ast.PrimVar(Symbol.for("println")),
					[new oftjsrt.ast.LiteralString("Hello, world!")]))));
	});
});

describe("Context", function() {
	it("exists", function() {
		expect(oftjsrt.Context).to.exist;
	});
	describe("Prime Sieve", function() {
		it("works", function() {
			const ctx = new oftjsrt.Context();
		});
	});
});
