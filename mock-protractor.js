/**
 * Protractor Backend Mock module
 * Runs in NodeJS/Protractor environment
 *
 * (c) 2015 Vinay Agarwal vinkaga@gmail.com
 * License: MIT
 */
'use strict';
var path = require('path');
var fs = require('fs');

/**
 *  Load mock module with provided mock configurations
 * @param mocks []
 */
module.exports.mock = function(mocks) {
	mocks = mocks || [];
	browser.removeMockModule('vinkaga.mockBackend');
	browser.addMockModule('vinkaga.mockBackend', getModuleCode(mocks));
};

/**
 * Get AngularJS module code to inject into browser
 * @param mocks []
 * @returns {string}
 */
function getModuleCode(mocks) {
	var filename = path.join(__dirname, './mock-angular.js');
	var code = fs.readFileSync(filename, 'utf8');
	return code.replace(/angular\.noop\(\);/, getModuleConfig(mocks));
}

/**
 * Create module mock config code
 * @param mocks
 * @returns {string}
 */
function getModuleConfig(mocks) {
	// Functions cannot be transferred directly
	// Convert to string
	for (var i = 0; i < mocks.length; ++i) {
		var mock = mocks[i];
		if (typeof mock[0] === 'function') {
			mock[0] = mock[0].toString();
		}
	}
	return "angular.module('vinkaga.mockBackend').constant('vinkaga.mockBackend.mock', " + JSON.stringify(mocks) + ');';
}
