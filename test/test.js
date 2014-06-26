var fs = require("fs");
var crypto = require("crypto");

var server = require("./app.js");
var req = require("supertest")(server);

function asyncTester(done, fn){
	return function(err, data){
		if(err){
			done(err);
		}
		else{
			try{
				fn(data);
				done();
			}
			catch(err){
				done(err);
			}
		}
	}
}

describe("JOB ENV", function(){

	describe("with a cmd job", function(){
		var workspace_data = {
			path: null,
			code: null
		}

		before(function(done){
			req.post("/jobs/env-test").end(asyncTester(done, function(data){
				workspace_data.path = data.text;
				workspace_data.code = data.statusCode;
			}));
		});

		it("should have OFFLOAD_WORKSPACE", function(){
			workspace_data.code.should.equal(200);
		});

		it("should clean up its OFFLOAD_WORKSPACE", function(){
			if (fs.existsSync(workspace_data.path)) {
				throw new Error("Workspace " + result + " still present!");
			}
		});
	});

});

describe("GET", function(){
	describe("/jobs", function(){
		it("should return data", function(done){
			req.get("/jobs").end(asyncTester(done, function(data){
				data.body.should.have.property("md5");
				var jobKeys = Object.keys(data.body);
				for(var i=0; i<jobKeys.length; i++){
					var jobKey = jobKeys[i];
					data.body[jobKey].should.have.property("running");
					data.body[jobKey].should.have.property("success");
					data.body[jobKey].should.have.property("error");
				}
			}));
		});

		it("should run permitGet", function(done){
			req.get("/jobs").end(asyncTester(done, function(data){
				data.headers.should.have.property("permit-process", "get");
			}));
		});
	});
	describe("custom route", function(){
		it("should run as desired");
		it("should still chain multiple middleware");
	});
});

describe("POST to", function(){
	describe("a valid job", function(){
		it("should return data", function(done){
			req.post("/jobs/good-exit").end(asyncTester(done, function(data){
				data.should.have.property("statusCode", 200);
				data.text.should.equal("out");
			}));
		});

		it("with a body should return result as if it was piped into the command", function(done){
			var name = "offload";
			var hash = crypto.createHash('md5').update(name).digest('hex');
			req.post("/jobs/md5").send(name).end(asyncTester(done, function(data){
				data.text.should.equal(hash);
			}));
		});

		it("should get 500 on a job fail", function(done){
			req.post("/jobs/bad-exit").end(asyncTester(done, function(data){
				data.statusCode.should.equal(500);
				data.text.should.equal("Job Error");
			}));
		});

		it("should emit and error event on a job fail", function(done){
			var error = null;
			server.on("500", function(msg){
				error = msg;
			});

			var body = {name:"name"};
			req.post("/jobs/bad-exit").send(body).expect(500).end(asyncTester(done, function(data){
				if(error===null){
					throw new Error("error event was never trigged");
				}
				else{
					error.should.have.property("job", "bad-exit");
					error.should.have.property("data", JSON.stringify(body));
					error.should.have.property("err");
					error.err.should.have.property("cmd", "node");
					error.err.should.have.property("error", "err");
				}
			}));
		});

		it("should run permitPost", function(done){
			req.post("/jobs/good-exit").end(asyncTester(done, function(data){
				data.headers.should.have.property("permit-process", "post");
			}));
		});

		describe("that uses callback", function(){
			it("should respond as expected if a real callback");
		});

		describe("that uses generator function", function(){
			it("should respond as expected if a real generator function is supplied");
		});

	});

	describe("an invalid job", function(){
		it("that is not assigned", function(done){
			req.post("/jobs/not-assigned").end(asyncTester(done, function(data){
				data.statusCode.should.equal(404);
			}));
		});
	});
});
