var crypto = require('crypto');
var md5sum = crypto.createHash('md5');

var input = require("../read-input");

input(function(data){
	md5sum.update(data);
	var d = md5sum.digest('hex');
	process.stdout.write(d);
});