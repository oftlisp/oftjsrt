// Polyfill for TextDecoder.
require("fast-text-encoding");

export default function intern(str) {
	if(typeof str === "string") {
		return Symbol.for(str);
	} else if(str instanceof ArrayBuffer) {
		const decoder = new TextDecoder("utf-8");
		return Symbol.for(decoder.decode(str));
	} else {
		throw new Error("Cannot intern non-string: " + str);
	}
}
