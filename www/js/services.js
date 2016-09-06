angular.module("freebyk.services", ['lbServices'])
    .factory('PaymentMethods', ['$http', "$q", function($http, $q) {
        // var payment_methods = store.get('payment_methods') || [];
        // var payment_methods = [];
        var factory = {};

		update = function($deferred){
		    $http.get("http://freebyk.arova.xyz:8080/users/payment_methods")
		    .success(function($payment_methods, $status, $headers, $config){
		    	// console.log($payment_methods);
		    	// store.set('payment_methods', $payment_methods);
			    $deferred.resolve($payment_methods);
		    });
	    };

        // factory.add = function(payment_method) {
        //     $payment_methods.push(payment_method);

        //     // store.set('payment_methods', payment_methods);
        //     return $payment_methods;
        // };
        factory.get = function() {
		    var $deferred = $q.defer();
		    update($deferred);
		    return $deferred;
        };
        return factory;
    }])

    .factory('BraintreeClientToken', ["$http", "$q", function($http, $q) {
        var factory = {};

		update = function($deferred){
		    $http.get("http://freebyk.arova.xyz:8080/users/client_token")
		    .success(function($client_token, $status, $headers, $config){
		    	store.set('client_token', $client_token);
			    $deferred.resolve($client_token);
		    });
	    };

        factory.get = function() {
		    var $deferred = $q.defer();
		    update($deferred);
		    return $deferred;
        };
        return factory;
    }])

	.factory('AppAuth', function() {
		return {
			currentUser: null,

			ensureHasCurrentUser: function(User) {
				if (this.currentUser) {
					if (this.currentUser.id === 'social') {
						this.currentUser = User.getAccount(function() {
						  // success
						}, function () {
						  console.log('User.getAccount() err', arguments);
						});
					} else {
					console.log('Using cached current user.');
					}
				} else {
					console.log('Fetching current user from the server.');
					this.currentUser = User.getCurrent(function() {
					// success
					}, function(response) {
						console.log('User.getCurrent() err', arguments);
					});
				}
			}
		};
	})

;
