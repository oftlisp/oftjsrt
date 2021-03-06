# oftjsrt

A Javascript runtime for the bytecode produced by `oftb compile -f anfir`.

## Usage

```javascript
var runtime = new OftJSRT();

var arrayBuffer = /* get an ArrayBuffer of bytecode somehow */;
runtime.load(arrayBuffer);

var url = /* A URL as a string */;
runtime.load_from(url).then(function() {
	// ...
}).catch(function(err) {
	console.error(err);
});

runtime.call("github.com/my/cool/module", "function-name").then(function(value) {
	console.log(value);
}).catch(function(err) {
	console.error(err);
});
```

## Required Features

 - [Promise](https://caniuse.com/#feat=promises)
 - [TextDecoder](https://caniuse.com/#feat=textencoder)

Currently, TextDecoder is polyfilled via `fast-text-encoding`.

Due to their ubiquity, Promises are not polyfilled.
Any Promise implementation that implements the Promises/A+ spec will work.
