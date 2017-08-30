import path from "path";

import buble from "rollup-plugin-buble";
import eslint from "rollup-plugin-eslint";
import license from "rollup-plugin-license";
import uglify from "rollup-plugin-uglify";

export default {
	"input": "src/main.js",
	"name": "oftjsrt",
	"output": {
		"file": "oftjsrt.js",
		"format": "umd"
	},
	"plugins": [
		eslint(),
		buble(),
		uglify(),
		license({
			banner: {
				file: path.join(__dirname, "LICENSE.md"),
			}
		}),
	],
	"sourcemap": true
};
