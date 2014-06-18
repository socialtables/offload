var offload = require("../index");
var app = offload();

app.job("md5", {cmd:"node", args:["./test/md5.js"]});
app.job("good-exit", {cmd:"node", args:["./test/exit.js", 0]});
app.job("bad-exit",  {cmd:"node", args:["./test/exit.js", 1]});
app.job("cla-not-installed", {cmd:"offload-test-not-installed"});

app.permitPost(function*(next){
	this.set("permit-process", "post");
	yield next;
});

app.permitGet(function*(next){
	this.set("permit-process", "get");
	yield next;
});

module.exports = app.listen(process.env.NODE_PORT || undefined);