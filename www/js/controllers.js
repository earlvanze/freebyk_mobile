angular.module("freebyk.controller", ["uiGmapgoogle-maps"])
.controller("map_controller", function($scope, uiGmapGoogleMapApi, Station, $ionicPlatform, $cordovaBadge){
	/*
	$ionicPlatform.ready(function() {
	    $cordovaBadge.promptForPermission();
	    
	    $scope.setBadge = function(value) {
		$cordovaBadge.hasPermission().then(function(result) {
		    $cordovaBadge.set(value);
		}, function(error) {
		    alert(error);
		});
	    }
	    $scope.setBadge(4);
	});
	*/
	$scope.station_markers = {ready: false};
	navigator.geolocation.getCurrentPosition(function($position){
	    // success!
	    setup_map(parseFloat($position.coords.latitude), parseFloat($position.coords.longitude));
	}, function($error){
	    setup_map({latitude: 0, longitude: 0});
	    // error!
	});
	var setup_map = function($latitude, $longitude){
	    uiGmapGoogleMapApi.then(function(maps){
		$scope.map = {};
		$scope.map.center = {latitude: parseFloat($latitude),
				     longitude: parseFloat($longitude)};
		$scope.map.zoom = 14;
	    });
	    $scope.me = [{'id':'me',
					'coords': 
						{'latitude': parseFloat($latitude),
						'longitude': parseFloat($longitude)
						},
					'icon': "img/mylocation.png",
					'options': {
						'icon': {
							//'scaledSize': new google.maps.Size(34, 44)
							}
						},
					}]; 
	    find_nearby_stations($latitude, $longitude, 1);
	};
	var find_nearby_stations = function($latitude, $longitude, $distance){
	    var $location = {lat: $latitude, lng: $longitude};

	    Station.nearby({location: $location, distance: 1})
		.$promise
		.then(function($response){
		    // recompile latitude, longitude from lat, lng
		    angular.forEach($response.stations, function(station){
				station.long_geolocation = {
				    latitude: station.geolocation.lat,
				    longitude: station.geolocation.lng
				};
				station.icon = "img/stationlocation.png";
				station.find_available_destinations = function(marker, event, object){
		    		alert(1);
				};
		    });
		    $scope.stations = $response.stations;
		    $scope.station_markers.ready = true;
		});
	}
})

.controller("menu_controller", function($scope, $ionicSideMenuDelegate, $state){

})

.controller("login_controller", function($scope, $http, $state, Bykr, $location){
	$scope.credentials = {};
	$scope.login = function() {
		Bykr.login($scope.credentials, function(accessToken) {
			console.log(accessToken);
			console.log(accessToken.id);
		})
	}

	// $scope.credentials = {};
	// $scope.authenticate = function(){
	// 	$http({
	// 	    url: "http://mealcarrier.com:8080/authenticate",
	// 	    method: "POST",
	// 	    data:{
	// 			"email": $scope.credentials.email,
	// 			"password": $scope.credentials.password
	// 	    }
	// 	})
	// 	.then(function($response){
	// 	    //success
	// 	    console.log($response);
	// 	    if (!$response.data.success){
	// 	    	if (!$response.data.success){
	// 	    		console.log($response.data.message)
	// 	    	}
	// 	    } else {
	// 	        // Login was successful
	// 		    // We need to save the information from the login
	// 		    $scope.credentials.token = $response.data.token;
	// 		    store.set('credentials', $scope.credentials);
	// 		    store.set('user_id', jwtHelper.decodeToken($response.data.token)._id);
	// 		    store.set('token', $response.data.token);
	// 		    console.log(store.get('user'));
	// 	    	console.log($response.data.message);
	//    		    console.log($scope.credentials.token);
	//    		    // console.log(jwtHelper.decodeToken(store.get('token')));
	// 	    	$state.go('request_pickup');
	// 	    }
	// 	}, function($response){
	// 	    console.log($response);
	// 	    console.log("Error: Can't connect to server.");
	// 	    //error
	// 	});
	// }
})

.controller("register_controller", function($scope, $http, $state, Bykr, $location){

    $scope.user = {};
    $scope.register = function(){
	    $scope.user.username = $scope.user.email;
    	console.log($scope.user);
    	$scope.bykr = Bykr.create($scope.user), function(err, res) {
    		console.log(err);
    		console.log(res);
    	};
    }
		// $http({
		//     url: "http://mealcarrier.com:8080/register",
		//     method: "POST",
		//     data:{
		//     	"first_name": $scope.user.first_name,
		//     	"last_name": $scope.user.last_name,
		// 		"email": $scope.user.email,
		// 		"password": $scope.user.password,
		// 		"confirm_password": $scope.user.confirm_password
		//     }
		// })
		// .then(function($response){
		//     //success
		//     // console.log($scope.user.token);
		//     if (!$response.data.success){
		//     	console.log($response.data.message)
		//     } else {
		//     	console.log($response.data.message);
		// 	    $scope.user.token = $response.data.token;
		//	    console.log($scope.user.token);
		//     	$state.go('request_pickup');
		//     }
		// },
		// function($response){
		//     console.log($response);
		//     console.log("Error: Can't connect to server.");
		//     //error
		// });
})

.controller("account_controller", function($scope, $http, $state, Bykr, $location){
	// delete account
	// change password
	// charge methods
	// log out
})

.controller("braintree_payment_controller", function($scope, $http, $state, $stateParams, store, Request, PaymentMethods, $ionicPopup) {

	// This clientToken has been generated by the Meal Carrier server.
	var client_token = Bykr.client_token();
	$scope.show_button = false;
	braintree.setup(client_token, "dropin", {
		container: "payment-form",
		singleUse: false,
		onReady: function() {
			console.log('Braintree is ready');
			$scope.$apply(function(){
				$scope.show_button = true;
	        });
		},
    	onPaymentMethodReceived: function(obj) {
		    // Do some logic in here.
		    // When you're ready to submit the form:
		    checkout.confirm();
		}
	});

	$scope.confirm = function() {
		Bykr.payment_methods($scope.credentials, function(accessToken) {
			console.log(accessToken);
			console.log(accessToken.id);
		})
	}

		// $http({
		//     url: "http://freebyk.com:8080/users/" + store.get('user_id') + "/payment_methods",
		//     method: "POST",
		//     data: {
		//     	payment_method_nonce: "fake-valid-nonce"
		//     	// payment_method_nonce: $stateParams.payment_method_nonce
		//     }
		// })
		// .then(function($response){
		//     //success
		//     // save payment_method_token
		//     console.log($response.data.payment_method_token);
		//     PaymentMethods.add($response.data.payment_method_token);
		//     console.log($response.data.message);
		// 	var promise = request.submit();
		// 	promise.then(
		// 	    function(data){
		// 	    	// success
		// 			// console.log(data);
		// 			if (!data.success) {
		// 			    console.log(data.message);
		// 			} else {
		// 			    var alertPopup = $ionicPopup.alert({
		// 					title: 'Request created!',
		// 					template: 'We will notify you when someone has accepted to fulfill your request.'
	 //                    });
	 //                    alertPopup.then(function (res) {
	                    	
	 //                    });
		// 			}
		// 	    },
		// 	    function(error){
		// 	    	// error
		// 			console.log("Error: " + error);
		// 	    }
		// 	);
		//     // $state.go('deliveries');
		// }, function($response){
		//     console.log("Error: Could not submit request.");
		//     //error
		// });
})
;
