# angularjs-lazyloading
A simple way to lazyload scripts & css with AngularJS

## add to app

```javascript
"use strict";

const app = angular.module("MyApp", [ "ngLazyLoading" ]);
```

## add to controller

```javascript
"use strict";

app.directive("MyController", [ "$lazyLoading", ($lazyLoading) => {

	// private

		// attributes

			const _urlJS = "http://my-url.com/my-script.js";
			const _urlCSS = "http://my-url.com/my-style.css";

	// init

	$lazyLoading.logs = true; // default = false

	$lazyLoading.script(_urlJS).then(() => {
		return $lazyLoading.style(_urlCSS)
	}).then(() => {

		console.log("loaded");

	}).catch((err) => {
		console.error(err);
	});

}]);
```

## load multiple files in a synchronous way

```javascript
"use strict";

app.directive("MyController", [ "$lazyLoading", ($lazyLoading) => {

	// private

		// attributes

			const _urlJS = "http://my-url.com/my-script.js";
			const _urlCSS = "http://my-url.com/my-style.css";

	// init

	$lazyLoading.logs = true; // default = false

	$lazyLoading.group({
		"name": "myGroup",
		"scripts": [ _urlJS ],
		"styles": [ _urlCSS ]
	}).then(() => {

		console.log("loaded");

	}).catch((err) => {
		console.error(err);
	});

}]);
```
