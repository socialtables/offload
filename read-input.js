module.exports = function(fn){
	var input = "";

	process.stdin.on("data", function(data){
		input += data;
	});

	process.stdin.on("close", function(){
		fn(input);
	});
}