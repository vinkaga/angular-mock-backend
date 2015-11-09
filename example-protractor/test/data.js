var mock = require('../../index'); // var mock = require('angular-mockBackend');
describe('requests made', function(){
	
	it('Should mock with data', function(){
		var data = [
			{ firstName: 'john', lastName: 'doe'},
			{ firstName: 'angular', lastName: 'js'}
		];
		mock.mock([
			[['get', '/users', undefined, undefined, undefined], 500, {data:data}], // Mock data with delay
			[['get', '/groups', undefined, undefined, undefined], 2000, undefined]  // Server data with delay
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
