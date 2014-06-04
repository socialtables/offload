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

app.job("list-all", {cmd:"ls", args:["-l", "-a"]});

app.permitPost(function*(next){
	var permit = true;
	if(permit){
		yield next;
	}
	else{
		this.status=401;
	}
});

app.permitGet(function*(next){
	var permit = true;
	if(permit){
		yield next;
	}
	else{
		this.status=401;
	}
});

module.exports = app.listen();
```