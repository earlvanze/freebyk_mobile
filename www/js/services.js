angular.module("freebyk.services", [])
    .factory('PaymentMethods', ['$http', "$q", function($http, $q) {
        // var payment_methods = store.get('payment_methods') || [];
        // var payment_methods = [];
        var factory = {};

		update = function($deferred){
		    $http.get("http://freebyk.com:8080/users/payment_methods")
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
		    $http.get("http://freebyk.com:8080/users/client_token")
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

;
