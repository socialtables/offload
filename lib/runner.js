var thunkify = require("thunkify");
var spawn = require("child_process").spawn;
var debug = require("debug")("offload:runner");

var cmd = function(cmd, args, env, body, cb){

	debug("preping job");
	var opts = {
		env: env,
		stdio: 'pipe',
		cwd: process.cwd()
	}

	var jobProcess = spawn(cmd, args, opts);

	//jobProcess.stderr.setEncoding('utf8');
	//jobProcess.stdout.setEncoding('utf8');

	debug("sending data to cmd");
	jobProcess.stdin.write(body);
	jobProcess.stdin.end();

	var result = "";

	jobProcess.stdout.on("data", function(data){
		var data = data.toString();
		debug("new data received");
		result += data;
	});

	var error = "";

	jobProcess.stderr.on("data", function(data){
		debug("new error or warning recived");
		error += data.toString();
	});

	jobProcess.on("close", function(code){
		if(code!=0){
			debug("job done with error");
			cb(new Error(error));
		}
		else{
			debug("job done");
			cb(null, result);
		}
	});
}


module.exports = thunkify(cmd);