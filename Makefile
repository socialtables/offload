

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--harmony-generators \
		test/test

.PHONY: test