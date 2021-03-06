var thunkify = require("thunkify");
var offload = require("../index");
var app = offload();
var fs = require("fs");

var pause = function(msg, cb){
	setTimeout(function(){
		cb(null, msg);
	}, 500);
}

var coPause = thunkify(pause);

app.job("md5", {cmd:"node", args:["./test/md5.js"]});
app.job("good-exit", {cmd:"node", args:["./test/exit.js", 0]});
app.job("bad-exit",  {cmd:"node", args:["./test/exit.js", 1]});
app.job("callback", function(body, cb){
	cb(null, body);
});
app.job("gen", function*(body){
	return yield coPause(body);
});

app.job("env-test", {cmd:"node", args:["./test/env-test.js"]});

app.job("env-test-cb", function(body, cb){
	if (this.workspace &&
			fs.existsSync(this.workspace)) {
		process.stdout.write(this.workspace);
		cb(null, this.workspace);
	}
	else if(this.workspace === undefined){
		cb(new Error("this.workspace is not defined"));
	}
	else {
		cb(null, "this.workspace value does not exist: "+ this.workspace);
	}
});

app.permitPost(function*(next){
	this.set("permit-process", "post");
	yield next;
});

app.permitGet(function*(next){
	this.set("permit-process", "get");
	yield next;
});

module.exports = app.listen(process.env.NODE_PORT || undefined);
module.exports.on = app.on;