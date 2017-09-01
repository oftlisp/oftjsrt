const fs = require("mz/fs");
const oftjsrt = require("../oftjsrt.js");
const P = require("path");
const should = require("should");

describe("Parser", function() {
	it("exists", function() {
		oftjsrt.parse.should.be.a.Function();
	});
	it("works for an empty bytecode", function() {
		return parseBC("empty").then(function(mods) {
			mods.length.should.equal(0);
		});
	});
	it("works for hello world", function() {
		return parseBC("hello").then(function(mods) {
			// Check the number of modules.
			mods.length.should.equal(1);
			const mod = mods[0];

			// Check the module name.
			Symbol.keyFor(mod.name).should.equal("std/internal/examples/hello-world");

			// Check the module exports.
			mod.exports.length.should.equal(1);
			mod.exports.map(Symbol.keyFor).should.match(["main"]);

			// Check the module imports.
			mod.imports.length.should.equal(0);

			// Check the number of decls.
			mod.decls.length.should.equal(1);
			const decl = mod.decls[0];

			// Check that the decoded expression is correct.
			//
			// In general, this is a bad idea, as it precludes optimizations
			// performed by the initial compiler. However, the hello world
			// example is simple enough that no optimizations should affect it.
			// TODO
		});
	});
});

function parseBC(name) {
	const path = P.join(__dirname, name + ".anfir");
	return fs.readFile(path)
		.then(file => file.buffer)
		.then(oftjsrt.parse);
}
