module.exports = function(grunt) {

	grunt.initConfig({
		connect: {
			server: {
				options: {
					base: 'test/app'
				}
			}
		},
		instrument: {
			files: ['index.js', 'mock*.js'],
			options: {
				lazy: true,
				basePath: 'cov/instrument/'
			}
		},
		protractor_coverage: {
			options: {
				keepAlive: true,
				noColor: false,
				coverageDir: 'cov/reports',
				args: {
					baseUrl: 'http://localhost:8000'
				}
			},
			local: {
				options: {
					configFile: 'test/protractor.conf'
				}
			}
		},
		makeReport: {
			src: 'cov/reports/**/*.json',
			options: {
				type: 'lcov',
				dir: 'cov/reports',
				print: 'detail'
			}
		}
	});

	grunt.registerTask('default', ['connect', 'instrument', 'protractor_coverage', 'makeReport']);

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-istanbul');
	grunt.loadNpmTasks('grunt-protractor-coverage');

};
