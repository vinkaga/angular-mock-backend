var mock = require('../../index'); // var mock = require('angular-mockBackend');

function mockuser(method, url, params, data, headers) {
	if (method.toLowerCase() == 'get' && url == '/users') {
		return {
			data: [
				{ firstName: 'john', lastName: 'doe'},
				{ firstName: 'angular', lastName: 'js'}
			]
		};
	}
	return undefined;
}
function delaygroup(method, url, params, data, headers) {
	return method.toLowerCase() == 'get' && url == '/groups' ? true : undefined;
}

describe('requests made', function(){

	it('Should mock with function', function(){
		mock.mock([
			[mockuser, 500, undefined],		// Mock data with delay
			[delaygroup, 2000, undefined] 	// Server data with delay
		]);

		browser.get('http://localhost:8000');
		var stamp = Date.now();

		browser.wait(protractor.until.elementsLocated(By.id('users')), 1000);
		element.all(By.id('users')).then(function(users) {
			expect(users.length).toBe(2);
			expect(users[0].getText()).toBe('john doe');
			expect(users[1].getText()).toBe('angular js');
			expect(Date.now() - stamp).toBeGreaterThan(500);
		});

		browser.wait(protractor.until.elementsLocated(By.id('groups')), 3000);
		element.all(By.id('groups')).then(function(groups){
			expect(groups.length).toBe(2);
			expect(groups[0].getText()).toBe('first');
			expect(groups[1].getText()).toBe('second');
			expect(Date.now() - stamp).toBeGreaterThan(2000);
		});
	});
});
