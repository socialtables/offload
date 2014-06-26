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
		process.stdout.write(process.env.OFFLOAD_WORKSPACE);
		process.exit();
	}
	else if(process.env.OFFLOAD_WORKSPACE === undefined){
		console.error("OFFLOAD_WORKSPACE is not defined");
		process.exit(1);
	}
	else {
		console.error("OFFLOAD_WORKSPACE value does not exist", process.env.OFFLOAD_WORKSPACE);
		process.exit(1);
	}
});
