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

## Cleanup

In general, `offload` jobs have to clean up after themselves -- which is to say
any resources used by a job should be disposed of by the job itself. There is
one exception: `offload` provides a temporary directory for the common case of
working with a few files.

The workspace is a randomly-named temporary location in the operating system's
default temporary directory; `offload` creates a new one for each job and ensures
it is deleted after the job ends. It can be accessed through the `OFFLOAD_WORKSPACE`
environment variable for jobs spawned as separate processes, or `this.workspace`
for jobs implemented as Javascript functions.
