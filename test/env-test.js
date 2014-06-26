#!/usr/bin/env node
/**
 Test script that verifies the presence ofthe OFFLOAD_WORKSPACE environment
 variable and the directory it specifies.
 */
var fs = require("fs");
var input = require("stdin");

input(function(data){
	if (process.env.OFFLOAD_WORKSPACE &&
			fs.existsSync(process.env.OFFLOAD_WORKSPACE)) {
		process.stdout.write("1");
		process.exit();
	}
	else {
		process.stdout.write("-1");
		process.exit(1);
	}
});
