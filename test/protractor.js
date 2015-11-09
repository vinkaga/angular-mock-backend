var mock = require('../cov/instrument/');

describe('requests made', function(){

	it('Should mock with function', function(){
		function delaygroup(method, url, params, data, headers) {
			var hdrs = {'Content-Type':'application/json'};
			return method.toLowerCase() == 'get' && url == '/groups' && angular.equals(headers, hdrs)
				? {data:[{name:'first'},{name:'second'}]} : undefined;
		}
		mock.mock([
			[['get', '/oranges?size=10', undefined, undefined, {'Content-Type':'application/json'}], 500, undefined],
			[['get', '/users'], 	0, 		{data:[{name:'john'},{name:'angular'}]}],
			[delaygroup, 			800, 	undefined],
			[[undefined, undefined, undefined, {name:'post_fail'}], 	0, 		{status:401}],
		]);

		browser.get('http://localhost:8000');
		var stamp = Date.now();

		browser.wait(protractor.until.elementsLocated(By.id('apples')), 1000);
		element.all(By.id('apples')).then(function(apples) {
			expect(apples.length).toBe(2);
			expect(apples[0].getText()).toBe('gala_add');
			expect(apples[1].getText()).toBe('golden_add');
		});

		browser.wait(protractor.until.elementsLocated(By.id('users')), 1000);
		element.all(By.id('users')).then(function(users) {
			expect(users.length).toBe(2);
			expect(users[0].getText()).toBe('john_add');
			expect(users[1].getText()).toBe('angular_add');
		});

		browser.wait(protractor.until.elementsLocated(By.id('oranges')), 1200);
		element.all(By.id('oranges')).then(function(oranges){
			expect(oranges.length).toBe(3);
			expect(oranges[0].getText()).toBe('tangerine_orange_add');
			expect(oranges[1].getText()).toBe('cutie_orange_add');
			expect(oranges[2].getText()).toBe('grapefruit_orange_add');
			expect(Date.now() - stamp).toBeGreaterThan(500);
		});

		browser.wait(protractor.until.elementsLocated(By.id('groups')), 2000);
		element.all(By.id('groups')).then(function(groups){
			expect(groups.length).toBe(2);
			expect(groups[0].getText()).toBe('first_group_add');
			expect(groups[1].getText()).toBe('second_group_add');
			expect(Date.now() - stamp).toBeGreaterThan(800);
		});
	});
});
