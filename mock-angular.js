/**
 * Angular JS Backend Mock module
 * Runs in browser/AngularJS environment
 *
 * (c) 2015 Vinay Agarwal vinkaga@gmail.com
 * License: MIT
 */
/**
 * (c) Carlos Atencio
 * License: BSD-2-Clause
 * https://github.com/atecarlos/protractor-http-mock
 */
(function(window, angular, undefined) {
	'use strict';

	/**
	 * Parse query string
	 * https://github.com/sindresorhus/query-string
	 * by Sindre Sorhus
	 * MIT License
	 * @param str
	 * @returns {*}
	 */
	function queryParams(str) {
		if (typeof str !== 'string') {
			return {};
		}

		str = str.trim().replace(/^(\?|#)/, '');

		if (!str) {
			return {};
		}

		return str.trim().split('&').reduce(function(ret, param) {
			var parts = param.replace(/\+/g, ' ').split('=');
			var key = parts[0];
			var val = parts[1];

			key = decodeURIComponent(key);
			// missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			val = val === undefined ? null : decodeURIComponent(val);

			if (!ret.hasOwnProperty(key)) {
				ret[key] = val;
			} else if (Array.isArray(ret[key])) {
				ret[key].push(val);
			} else {
				ret[key] = [ret[key], val];
			}

			return ret;
		}, {});
	}

	/**
	 * Apply request or response transform
	 * @param data
	 * @param headers
	 * @param status
	 * @param fns
	 * @returns {*}
	 */
	function applyTransform(data, headers, status, fns) {
		if (typeof fns === 'function') {
			data = fns(data, headers, status);
		} else {
			for (var i = 0; i < fns.length; i++) {
				data = fns[i](data, headers, status);
			}
		}
		return data;
	}

	/**
	 * Any missing property on mock matches everything
	 * @param config
	 * @param mock
	 * @returns bool
	 */
	function isMatch(config, mock) {
		if (angular.isFunction(mock)) {
			return !!mock(config.method, config.url, config.params, config.data, config.headers);
		}
		mock = mock || {};
		var fail = false;
		if (mock.method) {
			fail = fail || (config.method ? config.method.toLowerCase() : 'get') != mock.method.toLowerCase();
		}
		if (mock.url && angular.isString(config.url) && angular.isString(mock.url)) {
			fail = fail || config.url.split('?')[0] != mock.url.split('?')[0];
		}
		if (mock.params || angular.isString(config.url) && config.url.split('?')[1]) {
			var configParams = angular.extend(queryParams(config.url.split('?')[1]), config.params);
			var mockParams = angular.isString(mock.url) ? queryParams(mock.url.split('?')[1]) : {};
			mockParams = angular.extend(mockParams, mock.params);
			fail = fail || !angular.equals(configParams, mockParams);
		}
		if (mock.data) {
			fail = fail || !angular.equals(config.data, mock.data);
		}
		// Header props can be functions
		if (mock.headers) {
			var headers = {};
			angular.forEach(config.headers, function(value, key) {
				if (angular.isFunction(value)) {
					value = value(config);
				}
				if (value) {
					headers[key] = value;
				}
			});
			fail = fail || !angular.equals(headers, mock.headers);
		}
		return !fail;
	}

	/**
	 * Header getter similar to that in $http
	 * @param headers
	 * @returns {Function}
	 */
	function headersGetter(headers) {
		headers = headers || {};
		return function(name) {
			return headers[name];
		}
	}

	/**
	 * Explodes mock configs to usable form
	 * Each mock is an array containing
	 *   	config, delay, response
	 * request
	 * 		method, url, params, data, headers
	 * response
	 *   	data to be returned or function()
	 *
	 * @param configs Array
	 * @returns {Array}
	 */
	function explodeMocks(configs) {
		function explode(config, delay, response) {
			// Config can be array, function or string (function contents)
			config = angular.isArray(config) ? explodeConfig.apply(null, config) : (
				angular.isFunction(config) ? config : Function("return " + config)()
			);
			return {
				config: config,
				delay: delay,
				response: response
			};
		}
		function explodeConfig(method, url, params, data, headers) {
			return {
				method: method,
				url: url,
				params: params,
				data: data,
				headers: headers
			}
		}
		var mocks = [];
		angular.forEach(configs, function(value, key) {
			mocks.push(explode.apply(null, value));
		});
		return mocks;
	}

	angular.module('vinkaga.mockBackend', []).config(['$provide', '$httpProvider', function($provide, $httpProvider) {

		$provide.decorator('$http', ['$delegate', '$q', '$injector', 'vinkaga.mockBackend.mock', function($http, $q, $injector, mockConfig) {

			var interceptors = $httpProvider.interceptors;
			var mocks = explodeMocks(mockConfig);

			/**
			 * Gets interceptor instance either from service or the function
			 * @param interceptorExpression
			 * @returns {*}
			 */
			function getInterceptor(interceptorExpression) {
				if (angular.isString(interceptorExpression)) {
					return $injector.get(interceptorExpression);
				} else {
					return $injector.invoke(interceptorExpression);
				}
			}

			/**
			 * Apply request interceptors in forward order
			 * @param config
			 * @returns {*}
			 */
			function applyRequestInterceptors(config) {
				for (var i = 0; i < interceptors.length; i++) {
					var interceptor = getInterceptor(interceptors[i]);
					if (interceptor.request) {
						config = interceptor.request(config);
					}
				}
				if (config.transformRequest) {
					config.data = applyTransform(config.data, config.headers, undefined, config.transformRequest);
				}
				return config;
			}

			/**
			 * Apply response interceptors in reverse order
			 * @param response
			 * @returns {*}
			 */
			function applyResponseInterceptors(response) {
				if (response.config.transformResponse) {
					response.data = applyTransform(response.data, response.headers, response.status, response.config.transformResponse);
				}
				for (var i = interceptors.length - 1; i >= 0; i--) {
					var interceptor = getInterceptor(interceptors[i]);
					if (interceptor.response) {
						response = interceptor.response(response);
					}
				}
				return response;
			}

			/**
			 * Get mock config if any
			 * @param config
			 * @returns {*}
			 */
			function getMock(config) {
				for (var i = 0; i < mocks.length; i++) {
					if (isMatch(config, mocks[i].config)) {
						return mocks[i];
					}
				}
				return undefined;
			}

			/**
			 * Shortcut methods
			 * @param names
			 */
			function createShortMethods(names) {
				angular.forEach(arguments, function(name) {
					httpDecorated[name] = function(url, config) {
						return httpDecorated(angular.extend({}, config || {}, {
							method: name,
							url: url
						}));
					};
				});
			}

			/**
			 * Shortcut methods with data
			 * @param name
			 */
			function createShortMethodsWithData(name) {
				angular.forEach(arguments, function(name) {
					httpDecorated[name] = function(url, data, config) {
						return httpDecorated(angular.extend({}, config || {}, {
							method: name,
							url: url,
							data: data
						}));
					};
				});
			}

			/**
			 * Insert optional delay in response
			 * @param mock
			 * @param response
			 * @returns {*}
			 */
			function delay(mock, response) {
				if (!mock || !mock.delay) {
					return response;
				}
				return $q(function(resolve, reject) {
					setTimeout(function() {
						resolve(response);
					}, mock.delay);
				});
			}

			/**
			 * Create promise for mock response
			 * @param response
			 * @returns {*}
			 */
			function responsePromise(response) {
				response.status = response.status || 200;
				return $q(function(resolve, reject) {
					(response.status >= 200 && response.status <= 299 ? resolve : reject)(response);
				});
			}

			/**
			 * $http decorator that mocks requests matching configuration
			 * @param config
			 * @returns {*}
			 */
			function httpDecorated(config) {
				var tConfig = applyRequestInterceptors(angular.copy(config));
				var mock = getMock(tConfig);
				var response;
				if (mock) {
					response = angular.isFunction(mock.config) ?
						mock.config(tConfig.method, tConfig.url, tConfig.params, tConfig.data, tConfig.headers) :
						angular.copy(mock.response);
				}
				if (!angular.isObject(response)) {
					return delay(mock, $http(config));
				}

				response.config = tConfig;
				response.headers = headersGetter(response.headers);

				response = applyResponseInterceptors(response);
				return delay(mock, responsePromise(response));
			}

			httpDecorated.defaults = $http.defaults;
			createShortMethods('get', 'delete', 'head', 'jsonp');
			createShortMethodsWithData('post', 'put', 'patch');
			return httpDecorated;
		}]);

	}]);

	angular.noop();

})(window, window.angular);
