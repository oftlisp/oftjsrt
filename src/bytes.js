// Polyfill for TextDecoder.
require("fast-text-encoding");

export function bytesToString(bytes) {
	const decoder = new TextDecoder("utf-8");
	return decoder.decode(bytes);
}

export function bytesToSymbol(str) {
	if(str instanceof ArrayBuffer)
		str = bytesToString(str);
	return Symbol.for(str);
}
