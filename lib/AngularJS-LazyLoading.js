/*
	eslint no-invalid-this: 0, consistent-this: 0, prefer-arrow-callback: 0
*/

"use strict";

/**
* AngularJS LazyLoad service provider
* @param {object} $document Document service for AngularJS
* @param {object} $q Promise service for AngularJS
* @param {object} $timeout Timeout service for AngularJS
* @param {object} $log Logs service for AngularJS
* @returns {Promise} Result operation
*/
function LazyLoading ($document, $q, $timeout, $log) {

	// consts

		const self = this;

	// private

		// methods

			/**
			* Return promise & resolve it
			* @returns {Promise} Result operation
			*/
			function _resolve () {

				return $q(function resolver (resolve) {
					resolve();
				});

			}

			/**
			* Return promise & reject it
			* @param {Error} err : error to send
			* @returns {Promise} Result operation
			*/
			function _reject (err) {

				return $q(function rejecter (resolve, reject) {
					reject(err);
				});

			}

			/**
			* Loader
			* @param {object} element : DOM Element
			* @returns {Promise} Result operation
			*/
			function _load (element) {

				let done = false;

				return $q(function loader (resolve, reject) {

					element.onerror = function onerror () {
						reject(new Error("Impossible to load \"" + (element.src || element.href) + "\" ressource"));
					};

					/**
					* End load event
					* @returns {void}
					*/
					function onreadystatechange () {

						if (!done && (!element.readyState || "loaded" === element.readyState || "complete" === element.readyState)) {
							resolve();
						}

					}

					element.onload = resolve;
					element.onreadystatechange = onreadystatechange;

				}).then(function cleaner () {

					done = true;

					element.onload = null;
					element.onreadystatechange = null;

					return _resolve();

				}).catch(function catcher (err) {

					if (self.logs) {
						$log.error(err);
					}

					return _reject(err);

				});

			}

			/**
			* Synchronous multiple loader for scripts
			* @param {Array} scripts : scripts to load
			* @param {number} i : step
			* @returns {Promise} Result operation
			*/
			function _loadScriptsSynchronously (scripts, i = 0) {

				if (i >= scripts.length) {
					return _resolve();
				}
				else {

					return self.script(scripts[i]).then(function recursiveManager () {
						return i + 1 >= scripts.length ? _resolve() : _loadScriptsSynchronously(scripts, i + 1);
					});

				}

			}

			/**
			* Synchronous multiple loader for styles
			* @param {Array} styles : styles to load
			* @param {number} i : step
			* @returns {Promise} Result operation
			*/
			function _loadStylesSynchronously (styles, i = 0) {

				if (i >= styles.length) {
					return _resolve();
				}
				else {

					return self.style(styles[i]).then(function recursiveManager () {
						return i + 1 >= styles.length ? _resolve() : _loadStylesSynchronously(styles, i + 1);
					});

				}

			}

	// public

		// attributes

			this.scripts = [];
			this.styles = [];
			this.logs = false;

		// methods

			this.script = function script (url) {

				if ("undefined" === typeof url) {
					return _reject(new ReferenceError("Missing \"url\" parameter"));
				}
					else if ("string" !== typeof url) {
						return _reject(new ReferenceError("\"url\" parameter is not a string"));
					}
					else if ("" === url.trim()) {
						return _reject(new Error("\"url\" parameter is empty"));
					}

				else if (self.scripts.includes(url)) {

					if (self.logs) {
						$log.warn(url, "script already loaded");
					}

					return _resolve();

				}
				else {

					return $q(function creator (resolve, reject) {

						const scriptElement = $document[0].createElement("script");

						scriptElement.src = url;
						scriptElement.crossorigin = "anonymous";
						scriptElement.type = "text/javascript";
						scriptElement.async = true;

						try {
							$document[0].body.appendChild(scriptElement);
							resolve(scriptElement);
						}
						catch (e) {
							reject(e);
						}

					}).then(function loader (scriptElement) {

						return _load(scriptElement);

					}).then(function catcher () {

						self.scripts.push(url);

						if (self.logs) {
							$log.info(url, "script loaded");
						}

						return _resolve();

					});

				}

			};

			this.style = function style (url) {

				if ("undefined" === typeof url) {
					return _reject(new ReferenceError("Missing \"url\" parameter"));
				}
					else if ("string" !== typeof url) {
						return _reject(new ReferenceError("\"url\" parameter is not a string"));
					}
					else if ("" === url.trim()) {
						return _reject(new Error("\"url\" parameter is empty"));
					}

				else if (self.styles.includes(url)) {

					if (self.logs) {
						$log.warn(url, "style already loaded");
					}

					return _resolve();

				}
				else {

					return $q(function creator (resolve, reject) {

						const styleElement = $document[0].createElement("link");

						styleElement.href = url;
						styleElement.rel = "stylesheet";
						styleElement.async = true;

						try {
							$document[0].head.appendChild(styleElement);
							resolve(styleElement);
						}
						catch (e) {
							reject(e);
						}

					}).then(function loader (styleElement) {

						return _load(styleElement);

					}).then(function catcher () {

						self.styles.push(url);

						if (self.logs) {
							$log.info(url, "style loaded");
						}

						return _resolve();

					});

				}

			};

			this.group = function group (data) {

				if ("undefined" === typeof data) {
					return _reject(new ReferenceError("Missing \"group\" parameter"));
				}
					else if ("object" !== typeof data) {
						return _reject(new ReferenceError("\"group\" parameter is not an object"));
					}

					else if ("undefined" === typeof data.name) {
						return _reject(new ReferenceError("Missing \"group.name\" parameter"));
					}
						else if ("string" !== typeof data.name) {
							return _reject(new ReferenceError("\"group.name\" parameter is not a string"));
						}
						else if ("" === data.name.trim()) {
							return _reject(new Error("\"group.name\" parameter is empty"));
						}

				else {

					if (self.logs) {
						$log.info("\"" + data.name + "\" group loading...");
					}

					// load styles
					return _resolve().then(function stylesLoader () {

						return _loadStylesSynchronously(
							"object" === typeof data.styles && data.styles instanceof Array ? data.styles : []
						);

					// load scripts
					}).then(function scriptsLoader () {

						return _loadScriptsSynchronously(
							"object" === typeof data.scripts && data.scripts instanceof Array ? data.scripts : []
						);

					}).then(function logger () {

						if (self.logs) {
							$log.info("\"" + data.name + "\" group loaded");
						}

						return _resolve();

					}).catch(function catcher (err) {

						if (self.logs) {
							$log.info("\"" + data.name + "\" group load stopped");
						}

						return _reject(err);

					});

				}

			};

}

angular.module("ngLazyLoading", []).service("$lazyLoading", [
	"$document",
	"$q",
	"$timeout",
	"$log",
	LazyLoading
]);
