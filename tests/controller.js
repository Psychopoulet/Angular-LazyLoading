/*
	global window
*/

"use strict";

window.app.controller("MainController", [
	"$lazyLoading",
	"$scope",
	($lazyLoading, $scope) => {

		// consts

			const TEST_STYLE = "https://angularjs.org/css/angular.css";
			const TEST_SCRIPT = "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js";
			const TEST_WRONG_URL = "THIS_IS_A_WRONG_URL";

		// public

			// attributes

				$scope.events = [];

			// methods

				$scope.success = (msg) => {

					$scope.events.push({
						"color": "green",
						"message": msg
					});

				};

				$scope.error = (msg) => {

					$scope.events.push({
						"color": "red",
						"message": msg
					});

				};

		// init

			$lazyLoading.logs = true;

			// style

			Promise.resolve().then(() => {

				return $lazyLoading.style(TEST_STYLE).then(() => {

					$scope.success("right \"style\" method test");

					return Promise.resolve();

				}).catch((err) => {

					(0, console).error(err);
					$scope.error("right \"style\" method test");

					return Promise.resolve();

				}).then(() => {

					return $lazyLoading.style(TEST_WRONG_URL).then(() => {

						$scope.error("wrong \"style\" method test");

						return Promise.resolve();

					}).catch(() => {

						$scope.success("wrong \"style\" method test");

						return Promise.resolve();

					});

				});

			// script

			}).then(() => {

				return $lazyLoading.script(TEST_SCRIPT).then(() => {

					$scope.success("right \"script\" method test");

					return Promise.resolve();

				}).catch((err) => {

					(0, console).error(err);
					$scope.error("right \"script\" method test");

					return Promise.resolve();

				}).then(() => {

					return $lazyLoading.script(TEST_WRONG_URL).then(() => {

						$scope.error("wrong \"script\" method test");

						return Promise.resolve();

					}).catch(() => {

						$scope.success("wrong \"script\" method test");

						return Promise.resolve();

					});

				});

			// group

			}).then(() => {

				return $lazyLoading.group({
					"name": "Tests",
					"styles": [ TEST_STYLE ],
					"scripts": [ TEST_SCRIPT ]
				}).then(() => {

					$scope.success("right \"group\" method test");

					return Promise.resolve();

				}).catch((err) => {

					(0, console).error(err);
					$scope.error("right \"group\" method test");

					return Promise.resolve();

				}).then(() => {

					return $lazyLoading.group({
						"name": "Tests",
						"styles": [ TEST_WRONG_URL ],
						"scripts": [ TEST_WRONG_URL ]
					}).then(() => {

						$scope.error("wrong \"group\" method test");

						return Promise.resolve();

					}).catch(() => {

						$scope.success("wrong \"group\" method test");

						return Promise.resolve();

					});

				});

			}).catch((err) => {

				(0, console).log("");
				(0, console).error(err);
				(0, console).log("");

			});

	}

]);
