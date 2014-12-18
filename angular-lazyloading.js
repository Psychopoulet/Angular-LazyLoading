(function (angular)
{
	'use strict';
	
	angular.module('ngLazyLoading', [])
		.service('$lazyloading', ['$document', '$q', '$timeout', function ($document, $q, $timeout)
		{
			/* attributes */
				
				var m_tabCachedScriptsLoaded = new Array(); // list of loaded scripts
				var b_FBScriptInitialized = false; // is FB connect script loaded and initialized ?
				
			/* methodes */
				
				this.loadScript = function (p_sUrl)
				{
					var clScript = null;
					var clDefer = $q.defer();
						
						try
						{
							clScript = $document[0].createElement('script');
							
							clScript.onload = clScript.onreadystatechange = function () { $timeout(function () { clDefer.resolve(); }); };
							clScript.onerror = function (p_sMessage) { $timeout(function () { clDefer.reject(p_sMessage); }); };
							
							clScript.src = p_sUrl;
							
							$document[0].body.appendChild(clScript);
						}
						catch (e) { clDefer.reject(e); }
						
					return clDefer.promise;
				};
				
				this.loadScriptCached = function (p_sUrl)
				{
					var clDefer = $q.defer();
						
						try
						{
							if (this.isLoaded(p_sUrl)) { clDefer.resolve(); }
							else
							{
								this.loadScript(p_sUrl)
									.then(function() { m_tabCachedScriptsLoaded.push(p_sUrl); clDefer.resolve(); })
									.catch(function(p_sMessage) { clDefer.reject(p_sMessage); });
							}
						}
						catch (e) { clDefer.reject(e); }
						
					return clDefer.promise;
				};
				
				this.loadFBScript = function (p_sFBID, p_sLanguageISO, p_sVersion)
				{
					var clDefer = $q.defer();
						
						try
						{
							p_sLanguageISO = (!angular.isDefined(p_sLanguageISO) || '' == p_sLanguageISO) ? 'en_US' : p_sLanguageISO;
							p_sVersion = (!angular.isDefined(p_sVersion) || '' == p_sVersion) ? 'v2.2' : p_sVersion;
							
							if (!angular.isDefined(p_sFBID) || '' == p_sFBID) { clDefer.reject('Missing p_sFBID.'); }
							else if (b_FBScriptInitialized) { clDefer.resolve(FB); }
							else
							{
								this.loadScriptCached('//connect.facebook.net/' + p_sLanguageISO + '/sdk.js')
									.then(function()
									{
										try
										{
											if (!b_FBScriptInitialized)
											{
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
										catch (e) { clDefer.reject(e); }
									})
									.catch(function(p_sMessage) { clDefer.reject(p_sMessage); });
							}
						}
						catch (e) { clDefer.reject(e); }
						
					return clDefer.promise;
				};
				
				this.loadGAScript = function (p_sGAID)
				{
					var clDefer = $q.defer();
						
						if (!angular.isDefined(p_sGAID) || '' == p_sGAID) { clDefer.reject('Missing p_sGAID.'); }
						else
						{
							try
							{
								this.loadScriptCached('//www.google-analytics.com/analytics.js')
									.then(function()
									{
										try
										{
											ga('create', p_sGAID, 'auto'); ga('require', 'displayfeatures');
											clDefer.resolve();
										}
										catch (e) { clDefer.reject(e); }
									})
									.catch(function(p_sMessage) { clDefer.reject(p_sMessage); });
							}
							catch (e) { clDefer.reject(e); }
						}
						
					return clDefer.promise;
				};
				
				this.loadCaptchaScript = function ()
				{
					var sUrl = '//www.google.com/recaptcha/api.js?onload=onLoadCaptchaScriptCallback&render=explicit';
					var clDefer = $q.defer();
						
						try
						{
							if (this.isLoaded(sUrl)) { clDefer.resolve(grecaptcha); }
							else
							{
								window.onLoadCaptchaScriptCallback = function () { clDefer.resolve(grecaptcha); };
								
								this.loadScriptCached(sUrl)
									.catch(function(p_sMessage) { clDefer.reject(p_sMessage); });
							}
						}
						catch (e) { clDefer.reject(e); }
						
					return clDefer.promise;
				};
				
			/* accessors */
				
				this.isLoaded = function (p_sUrl)
				{
					for (var i = 0, l = m_tabCachedScriptsLoaded.length; i < l; i++) { if (m_tabCachedScriptsLoaded[i] == p_sUrl) { return true; } }
					return false;
				};
				
		}]);
})(angular);
