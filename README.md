# Offload

Offload CPU intensive tasks with a POST

## Running

```
nvm use 0.11.*
node --harmony app.js
```

## app.js

```
var offload = require("offload");
var app = offload();

// Spawn process job
app.job("list-all", {cmd:"ls", args:["-l", "-a"]});

// Callback job
app.job("callback-job", function(body, cb){
	cb(null, body);
});

// Generator function job
app.job("gen-job", function*(body){
	return body;
});

// Custom route hosting the stats for gen-job
app.get("/custom-route", function*(){
	this.body = app.stats("gen-job");
});

// Permission handling for all STANDARD route POST requests.
app.permitPost(function*(next){
	var permit = true;
	if(permit){
		yield next;
	}
	else{
		this.status=401;
	}
});

// Permission handling for all STANDARD route GET requests.
// This does not apply to anything created via app.get
app.permitGet(function*(next){
	var permit = true;
	if(permit){
		yield next;
	}
	else{
		this.status=401;
	}
});

module.exports = app.listen(3000);
```