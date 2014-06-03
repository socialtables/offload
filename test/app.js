var offload = require("../index");
var app = offload();

app.job("md5", "node", ["./test/md5.js"]);
app.job("good-exit", "node", ["./test/exit.js", 0]);
app.job("bad-exit", "node", ["./test/exit.js", 1]);

app.permitPost(function*(next){
	this.set("permit-process", "post");
	yield next;
})

app.permitGet(function*(next){
	this.set("permit-process", "get");
	yield next;
});

module.exports = app.listen();