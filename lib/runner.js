var util = require("util");
var thunkify = require("thunkify");
var spawn = require("child_process").spawn;
var debug = require("debug")("offload:runner");


var runner = function(cmd, args, body, cb){

	debug("preping job");

	var envCopy = util._extend({}, process.env);
	envCopy.OFFLOAD_WORKSPACE = this.workspace;

	var opts = {
		stdio: 'pipe',
		cwd: process.cwd(),
		env: envCopy
	};

	var jobProcess = spawn(cmd, args, opts);
	debug("sending data to cmd");
	//handle if body is undefined
	jobProcess.stdin.write(body);
	jobProcess.stdin.end();

	var result = null;

	jobProcess.stdout.on("data", function(data){
		debug("new data received - buffer");
		if (result === null) {
			result = data;
		}
		else{
			result = Buffer.concat([result, data]);
		}
	});

	var error = "";

	jobProcess.stderr.on("data", function(data){
		debug("new error or warning recived");
		error += data.toString();
	});

	jobProcess.on("exit", function(code){
		if (code != 0) {
			debug("job done with error");
			cb({cmd:cmd, args:args, error:error});
		}
		else{
			cb(null, result);
			debug("job done");
		}
	});
}


module.exports = thunkify(runner);
