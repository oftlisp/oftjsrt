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
			mods.length.should.equal(0);
		});
	});
});

function parseBC(name) {
	const path = P.join(__dirname, name + ".anfir");
	return fs.readFile(path)
		.then(file => file.buffer)
		.then(oftjsrt.parse);
}
