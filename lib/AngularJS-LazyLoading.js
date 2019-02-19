/*
	eslint no-invalid-this: 0
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

	// private

		// methods

			/**
			* Return promise & resolve it
			* @returns {Promise} Result operation
			*/
			function _resolve () {

				return $q((resolve) => {
					resolve();
				});

			}

			/**
			* Loader
			* @param {object} element DOM Element
			* @returns {Promise} Result operation
			*/
			function _load (element) {

				return $q((resolve, reject) => {

					let done = false;

					element.onerror = (e) => {
						reject(e);
					};

					/**
					* End load event
					* @param {object} e Event
					* @returns {void}
					*/
					function onreadystatechange (e) {

						$timeout(() => {

							if (!done && (!this.readyState || "loaded" === this.readyState || "complete" === this.readyState)) {

								done = true;

								element.onload = null;
								element.onreadystatechange = null;

								resolve();

							}
							else {
								reject(e);
							}

						});

					}

					element.onload = onreadystatechange;
					element.onreadystatechange = onreadystatechange;

				}).catch((err) => {

					if (this.logs) {
						$log.error(err);
					}

					return $q((resolve, reject) => {
						reject(err);
					});

				});

			}

	// public

		// attributes

			this.scripts = [];
			this.styles = [];
			this.logs = false;

		// methods

			this.script = (url) => {

				if (this.scripts.includes(url)) {

					if (this.logs) {
						$log.warn(url, "script already loaded");
					}

					return _resolve();

				}
				else {

					return $q((resolve, reject) => {

						const script = $document[0].createElement("script");

						script.src = url;
						script.crossorigin = "anonymous";
						script.type = "text/javascript";
						script.async = true;

						$document[0].body.appendChild(script);

						_load(script).then(resolve).catch(reject);

					}).then(() => {

						this.scripts.push(url);

						if (this.logs) {
							$log.info(url, "script loaded");
						}

						return _resolve();

					});

				}

			};

			this.style = (url) => {

				if (this.styles.includes(url)) {

					if (this.logs) {
						$log.warn(url, "style already loaded");
					}

					return _resolve();

				}
				else {

					return $q((resolve, reject) => {

						const style = $document[0].createElement("link");

						style.href = url;
						style.rel = "stylesheet";
						style.async = true;

						$document[0].head.appendChild(style);

						_load(style).then(resolve).catch(reject);

					}).then(() => {

						this.styles.push(url);

						if (this.logs) {
							$log.info(url, "style loaded");
						}

						return _resolve();

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
