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

## API

### app.job(jobName, action)

Register a new job

* jobName: the name of the job. This is used to request the job via `POST /jobs/:jobName`
* action: this defines what should be run when the job is requested.
  * fn(body, callback): if this is a function the body will be the body of the post.
  * generator(body): if this is a generator, the first arg will be the body of the post.
  * obj: if this is an object offload will spawn up a child process and the body of the post will be piped to stdin.
    * cmd: the command to be run. eg: node
    * args: an array of arguments to be send. eg ["index.js", "4000"]

### app.stats(jobName)

Get the stats for a job. Great for being used in custom reporting routes.

### app.permitGet(generator)

Standard KOA styled generator that is run before all GET requests. Can be used for much more than just permission, but should be used for permission too!

### app.permitPost(generator)

Standard KOA styled generator that is run before all POST requets.

### app.workspaceRetention(milliseconds)

Set the time to retain the job workspace directory (see below) after the job finishes. Useful mainly for debugging jobs. Defaults to 0 (i.e. no retention, workspace is deleted as soon as the job ends).

## Workspace

The framework provides a temporary directory for the common case of working with a few
files -- this is a randomly-named temporary location in the operating system's
default temporary directory. A new one is created for each job, and automatically
deleted after the job ends. It can be accessed through the `OFFLOAD_WORKSPACE`
environment variable for jobs spawned as separate processes, or `this.workspace`
for jobs implemented as Javascript functions.

## Cleanup

In general, `offload` jobs have to clean up after themselves -- which is to say
any resources used by a job should be disposed of by the job itself.
