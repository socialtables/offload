var koa = require("koa");
var router = require("koa-router");
var debug = require("debug")("offload");
var runner = require("./lib/runner");
var thunkify = require("thunkify");
var rawBody = require("raw-body");

module.exports = function(permitPost, permitGet){

	/**
	 * `noop` just pushes things to next and is here so people don't have
	 * to set up permissions for post and get
	 */

	function* noop(next){ 
		debug("auto permit", this.request.method, " of ", this.request.url);
		yield next;
	};

	/**
	 * `config` holds all user defined bits of information for this instance
	 * of offload
	 */

	var config = {
		permitPost: permitPost || noop,
		permitGet: permitGet || permitPost || noop,
		jobs: {}
	}

	/**
	 * `checkJob` checks that the provided job id matches a job in the config object.
	 * if the job doesn't match, a 404 is triggered. If it does the job is added to
	 * `this.job` so that the next generator won't have to find it again
	 */

	function* checkJob(next){
		var jobId = this.params.job;
		debug("checking job", jobId, "has been registed with offload");
		var job = config.jobs[jobId];
		if(job==undefined){
			debug("invalid job id");
			this.status = 404;
			this.body = {error:"Invalid Job Id"};
		}
		else{
			debug("valid job id");
			this.job = job;
			yield next;
		}
	}

	/**
	 * simple wrappers for the permission checkers
	 * used because passing the value of config.permit*
	 * locks that function into the next-chain and an
	 * implementor might have not yet set their custom
	 * permission checker.
	 */

	function* checkPermitGet(next){
		debug("running get permit");
		yield config.permitGet.call(this, next);
	}

	function* checkPermitPost(next){
		debug("running post permit");
		yield config.permitPost.call(this, next);
	}

	/**
	 * Setting up koa
	 */

	var app = koa();

	app.use(router(app));


	/**
	 * Get basic stats about all jobs
	 */

	app.get("/jobs", checkPermitGet, function*(){
		debug("getting info about all jobs");
		var data = {};
		Object.keys(config.jobs).map(function(j){
			data[j] = config.jobs[j].stats;
		});
		this.body = data;
	});

	/**
	 * trigger a job
	 * assign result to this.body
	 * if error, track error and assign to this.body
	 */

	app.post("/jobs/:job", checkPermitPost, checkJob, function*(){
		debug("starting", this.params.job);
		var ctx = this; //doing this so we can still access it inside the catch block
		ctx.job.stats.running++;
		try{
			// TODO: make this work as a stream...
			// TODO: make this less 
			var body = (yield rawBody(ctx.req)).toString();

			ctx.body = yield ctx.job.fn(body);

			debug("job success", ctx.params.job);
			ctx.job.stats.done++;
		}
		catch(err){
			debug("job error", ctx.params.job, err);
			ctx.status = 500;
			ctx.body = "Job Error";
			ctx.job.stats.error++;
		}
		ctx.job.stats.running--;
	});

	/**
	 * Exposed API
	 * params
	 *	listen: binds offload to a port
	 *	permitPost: another way to setup permissions...
	 * 	permitGet: another way to setup permissions...
	 *  job: regiesters a job with offload
	 * 		name: the jobs id, aka name
	 * 		opts:
	 *			cmd: the cmd to be run
	 *			args: (optional) array of args for cmd
	 *			env: not implemented as it throws an ENOENT error for files that are present...
	 *		opts: fn(body, cb)
	 */

	return {
		listen: function(port){
			debug("listening on "+port);
			return app.listen(port);
		},
		permitPost: function(gen){
			debug("setting permit post");
			config.permitPost = gen;
		},
		permitGet: function(gen){
			debug("setting permit get");
			config.permitGet = gen;
		},
		job: function(name, opts){

			var fn = null;
			if(typeof opts == "object"){

				var cmd = opts.cmd;
				var args = opts.args || [];

				if(typeof cmd != "string"){
					throw new Error("opts.cmd is required and must be a string");
				}
				else if(Object.prototype.toString.call( args ) !== '[object Array]'){
					throw new Error("opts.args must either be not provided to be an array");
				}
				else{

					var fn = function(body){
						return runner(cmd, args, body);
					}
				}
			}
			else{
				throw new Error("Invalid data provided to job");
			}

			debug("adding new job", name, "to offload running", cmd, args.join(" "));
			if(config.jobs[name]){
				throw new Error("Job "+name+" is already defined");
			}
			else if(fn===null){
				throw new Error("Unable to setup job...");
			}
			else{
				config.jobs[name] = {
					fn: fn,
					stats: {
						running: 0,
						done: 0,
						error: 0
					}
				}
			}
		}
	}
}