# Angular-LazyLoading
A simple way to lazyload scripts with AngularJS

## add to app

```javascript
"use strict";

const app = angular.module("MyApp", [ "ngLazyLoading" ]);
```

## add to controller

```javascript
app.directive("MyController", [ "$lazyLoading", "$q", ($lazyLoading, $q) => {

	// private

		// attributes

			const _urlJS = "http://my-url.com/my-script.js";
			const _urlCSS = "http://my-url.com/my-style.css";

	// init

	$lazyLoading.script(_urlJS).then(() => {
		return $lazyLoading.style(_urlCSS)
	}).then(() => {

		console.log("loaded");

	}).catch((err) => {
		console.error(err);
	});

}]);

```
