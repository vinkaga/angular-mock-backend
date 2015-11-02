# Protractor Example

## How to run
* Open ```example-protractor/app``` directory in a terminal window and run
```sh
python -m SimpleHTTPServer
```
* Open ```example-protractor``` directory in another terminal window and run
```sh
protractor test/protractor.conf
```
## What's going on here
Each of the 2 tests ```data.js``` and ```function.js```
* Mock a server response for GET from ```/users``` with 500ms delay
* Insert a 2 sec delay in server's response for ```/groups```

The mocks are specified as data in ```data.js``` and as functions in ```function.js```.
