var crypto = require('crypto');

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

describe("GET from", function(){
	describe("a valid job", function(){
		it("should return data", function(done){
			req.get("/jobs/good-exit").end(asyncTester(done, function(data){
				data.body.should.have.property("id", "good-exit");
				data.body.should.have.property("stats");
				data.body.stats.should.have.property("running");
				data.body.stats.should.have.property("done");
				data.body.stats.should.have.property("error");
			}));
		});
	});

	it("should run permitGet", function(done){
		req.get("/jobs/good-exit").end(asyncTester(done, function(data){
			data.headers.should.have.property("permit-process", "get");
		}));
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
	});

	it("should get 500 on a job fail", function(done){
		req.post("/jobs/bad-exit").end(asyncTester(done, function(data){
			data.statusCode.should.equal(500);
			data.text.should.equal("Job Error");
		}));
	});

	it("should run permitPost", function(done){
		req.post("/jobs/good-exit").end(asyncTester(done, function(data){
			data.headers.should.have.property("permit-process", "post");
		}));
	});
});