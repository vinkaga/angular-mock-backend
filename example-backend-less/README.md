# Backend-less Example

## How to run
* Copy ```bower_components/angular-mockBackend/mock-angular.js``` to ```example-backend-less/app``` folder.
* Open ```example-backend-less/app``` directory in a terminal window and run
```sh
python -m SimpleHTTPServer
```
* Browse to ```http://localhost:8000``` to see the mocked server response and delay.

## What's going on here
* Request for ```/users``` is mocked with 500ms delay
* Request for ```/groups``` is passed to the server but inserts a 2 second delay

```/users``` mock is specified as data while ```/groups``` delay is specified as a function.
