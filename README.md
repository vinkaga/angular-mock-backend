# Angular Mock Backend
[![Build Status](https://snap-ci.com/vinkaga/angular-mock-backend/branch/master/build_image)](https://snap-ci.com/vinkaga/angular-mock-backend/branch/master) [![Coverage Status](https://coveralls.io/repos/vinkaga/angular-mock-backend/badge.svg?branch=master&service=github)](https://coveralls.io/github/vinkaga/angular-mock-backend?branch=master)


Angular Mock Backend is

1. An [AngularJS](https://github.com/angular/angular.js) module to mock some (or all) server requests (optionally with delay) for backend-less development.
2. A [Protractor](https://github.com/angular/protractor) module to help test client by mocking some (or all) server requests (optionally with delay).

This module provides functionality somewhat similar to that provided by [ngMockE2E $httpBackend](https://docs.angularjs.org/api/ngMockE2E/service/$httpBackend). But it does not use [ngMockE2E $httpBackend](https://docs.angularjs.org/api/ngMockE2E/service/$httpBackend) for its implementation.
## Installation
```sh
npm install angular-mock-backend --save-dev
bower install angular-mock-backend --save-dev
```
## Example
### Backend-less Development
Include provided ```mock-angular.js``` in your ```index.html``` and use ```vinkaga.mockBackend``` as your application dependency. Then include the following JavaScript
```JavaScript
var mocks = [
    [['get', '/users', undefined, undefined, undefined], 200, {data:[
        {firstName: 'john', lastName: 'doe'},
        {firstName: 'angular', lastName: 'js'}
    ]}]
];
angular.module('vinkaga.mockBackend').constant('vinkaga.mockBackend.mock', mocks);
```
This will mock GET for ```/users``` with the specified data and 200ms delay. For a full working example, see [example-backend-less](example-backend-less).
### Protractor Tests
In your [Protractor](https://github.com/angular/protractor) test script, insert the following code before tests
```JavaScript
var mock = require('angular-mockBackend');
mock.mock([
	[['get', '/users', undefined, undefined, undefined], 200, {data:[
    	{firstName: 'john', lastName: 'doe'},
    	{firstName: 'angular', lastName: 'js'}
    ]}],
]);
```
This will mock GET for ```/users``` with the specified data and 200ms delay in [Protractor](https://github.com/angular/protractor) tests. For a full working example, see [example-protractor](example-protractor).
## API
### Mock Definitions
Array of individual mock definitions, where each mock definition itself is an array of
```JavaScript
[config, delay, response]
```
#### config
Either an array or function as follows
```JavaScript
[method, url, params, data, headers]
// or
function(method, url, params, data, headers) {...}
```
If config definition is a function, the third parameter of mock definition (```response```) is ignored. Instead the value returned by the function is used in place of ```response```.
#### delay
A number in milliseconds. Negative numbers will have an unpredictable effect.
#### response
If ```config``` is specified as a function, it's the value returned by the ```config``` function. Otherwise, it is the third parameter of the mock definition. It is treated as follows

Value  | Description
------------- | -------------
object  | Matching requests are mocked and delay is applied. The returned data is ```response.data``` and the returned status is ```response.status```.
truthy but not object  | Matching requests are passed to the server after applying the delay.
falsy | Matching requests are not affected.

### Backend-less Development
For backend-less development, use mock definitions as follows
```JavaScript
angular.module('vinkaga.mockBackend').constant('vinkaga.mockBackend.mock', <array of mock definitions>);
```
### Protractor Tests
For Protractor tests, use mock definitions as follows
```JavaScript
var mock = require('angular-mockBackend');
mock.mock(<array of mock definitions>);
```

## Credits
* [Carlos Atencio](https://github.com/atecarlos) for [protractor-http-mock](https://github.com/atecarlos/protractor-http-mock)
* [Sindre Sorhus](https://github.com/sindresorhus) for [query-string](https://github.com/sindresorhus/query-string)
