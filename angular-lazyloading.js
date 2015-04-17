(function (angular)
{
	'use strict';
	
	angular.module('ngLazyLoading', [])
		.service('$lazyloading',
			['$document', '$q', '$timeout', '$log',
		function ($document, $q, $timeout, $log) {
			
			/* attributes */
				
				var b_FBScriptInitialized = false; // is FB connect script loaded and initialized ?
				
			/* methodes */
				
				this.loadScript = function (p_sUrl) {
					
					var clScript = null, bDone = false;
					var clDefer = $q.defer();
						
						try {
							
							clScript = $document[0].createElement('script');
							
							clScript.src = p_sUrl;
							clScript.type = 'text/javascript';
							clScript.async = true;
							
							clScript.onload = clScript.onreadystatechange = function (e) {
								
								var that = this;
								
								$timeout(function () {
									
									if (!bDone && (!that.readyState || 'loaded' === that.readyState || 'complete' === that.readyState)) {
										bDone = true;
										clScript.onload = clScript.onreadystatechange = null;
										clDefer.resolve();
									}
									else {
										$log.error(e);
										clDefer.reject('Unable to load ' + p_sUrl);
									}
									
								});
							};
							
							clScript.onerror = function (e) {
								$log.error(e);
								clDefer.reject('Unable to load ' + p_sUrl);
							};
							
							$document[0].body.appendChild(clScript);
						}
						catch (e) {
							$log.error(e); clDefer.reject(e);
						}
						
					return clDefer.promise;
				};
				
				this.loadFBScript = function (p_sFBID, p_sLanguageISO, p_sVersion) {
					
					var clDefer = $q.defer();
						
						try {
							
							p_sLanguageISO = (!angular.isDefined(p_sLanguageISO) || '' === p_sLanguageISO) ? 'en_US' : p_sLanguageISO;
							p_sVersion = (!angular.isDefined(p_sVersion) || '' === p_sVersion) ? 'v2.2' : p_sVersion;
							
							if (!angular.isDefined(p_sFBID) || '' === p_sFBID) {
								clDefer.reject('Missing p_sFBID.');
							}
							else if (b_FBScriptInitialized) {
								clDefer.resolve(FB);
							}
							else {
								
								this.loadScript('//connect.facebook.net/' + p_sLanguageISO + '/sdk.js')
									.catch(function(p_sMessage) {
										clDefer.reject(p_sMessage);
									})
									.then(function() {
										
										try {
											
											if (!FB || 'function' !== typeof FB.init || 'function' !== typeof FB.getLoginStatus) {
												clDefer.reject('Unable to load Facebook tools.');
											}
											else {
												
												if (!b_FBScriptInitialized) {
													
													FB.init({
														appId : p_sFBID,
														cookie : true,
														oauth: true,
														status : true,
														version : p_sVersion,
														xfbml : true
													});
													
													b_FBScriptInitialized = true;
												}
												
												clDefer.resolve(FB);
												
											}
										}
										catch (e) {
											clDefer.reject(e);
										}
										
									});
							}
						}
						catch (e) {
							clDefer.reject(e);
						}
						
					return clDefer.promise;
				};
				
				this.loadGAScript = function (p_sGAID) {
					
					var clDefer = $q.defer();
						
						try {
							
							if (!angular.isDefined(p_sGAID) || '' === p_sGAID) { clDefer.reject('Missing p_sGAID.'); }
							else {
								
								this.loadScript('//www.google-analytics.com/analytics.js')
									.catch(function(p_sMessage) {
										clDefer.reject(p_sMessage);
									})
									.then(function() {
										
										try {
											
											if ('function' !== typeof ga) {
												clDefer.reject('Unable to load Google Analytics.');
											}
											else {
												ga('create', p_sGAID, 'auto');
												ga('require', 'displayfeatures');
												clDefer.resolve();
											}
										}
										catch (e) {
											clDefer.reject(e);
										}
										
									});
									
							}
							
						}
						catch (e) {
							clDefer.reject(e);
						}
						
					return clDefer.promise;
				};
				
				this.loadCaptchaScript = function () {
					
					var sUrl = '//www.google.com/recaptcha/api.js?onload=onLoadCaptchaScriptCallback&render=explicit';
					var clDefer = $q.defer();
						
						try {
							
							window.onLoadCaptchaScriptCallback = function () {
								clDefer.resolve(grecaptcha);
							};
							
							this.loadScript(sUrl)
								.catch(function(p_sMessage) {
									clDefer.reject(p_sMessage);
								});
								
						}
						catch (e) {
							clDefer.reject(e);
						}
						
					return clDefer.promise;
				};
				
		}]);
})(angular);
