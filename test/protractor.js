var mock = require('../cov/instrument/');

describe('requests made', function(){

	it('Should mock with function', function(){
		function delaygroup(method, url, params, data, headers) {
			return method.toLowerCase() == 'get' && url == '/groups' ? {data:[{name:'first'},{name:'second'}]} : undefined;
		}
		mock.mock([
			[['get', '/oranges'],	500,	undefined],
			[['get', '/users'], 	0, 		{data:[{name:'john'},{name:'angular'}]}],
			[delaygroup, 			800, 	undefined]
		]);

		browser.get('http://localhost:8000');
		var stamp = Date.now();

		browser.wait(protractor.until.elementsLocated(By.id('apples')), 1000);
		element.all(By.id('apples')).then(function(apples) {
			expect(apples.length).toBe(2);
			expect(apples[0].getText()).toBe('gala');
			expect(apples[1].getText()).toBe('golden');
		});

		browser.wait(protractor.until.elementsLocated(By.id('users')), 1000);
		element.all(By.id('users')).then(function(users) {
			expect(users.length).toBe(2);
			expect(users[0].getText()).toBe('john');
			expect(users[1].getText()).toBe('angular');
		});

		browser.wait(protractor.until.elementsLocated(By.id('oranges')), 1200);
		element.all(By.id('oranges')).then(function(oranges){
			expect(oranges.length).toBe(3);
			expect(oranges[0].getText()).toBe('tangerine_orange');
			expect(oranges[1].getText()).toBe('cutie_orange');
			expect(oranges[2].getText()).toBe('grapefruit_orange');
			expect(Date.now() - stamp).toBeGreaterThan(500);
		});

		browser.wait(protractor.until.elementsLocated(By.id('groups')), 2000);
		element.all(By.id('groups')).then(function(groups){
			expect(groups.length).toBe(2);
			expect(groups[0].getText()).toBe('first');
			expect(groups[1].getText()).toBe('second');
			expect(Date.now() - stamp).toBeGreaterThan(800);
		});
	});
});
