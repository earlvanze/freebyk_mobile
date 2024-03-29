angular.module("freebyk.controller", ["uiGmapgoogle-maps", 'ngCookies'])
    
    .controller("bike_picked_controller", function($scope, Agreement, sharedProperties, $state, uiGmapGoogleMapApi, $interval,  uiGmapIsReady, Station, $ionicPlatform, $cordovaBadge, $ionicPopup, $timeout, $rootScope){
			

			$rootScope.ready_to_accept = false;
			$rootScope.route_has_been_accepted = false;
			$rootScope.thank_you = true;
			$rootScope.delivered = function() {
				$rootScope.agreement.delivered = true;
				$rootScope.agreement.$save();
				$rootScope.ready_to_accept = false;
				$rootScope.route_has_been_accepted = false;
				$rootScope.thank_you = false;
				$rootScope.selected_origin = [];
				$rootScope.selected_destination = [];
				$state.go('index');
			}

			$rootScope.not_delivered = function() {
				$rootScope.ready_to_accept = false;
				$rootScope.route_has_been_accepted = false;
				$rootScope.thank_you = false;
				$rootScope.selected_origin = [];
				$rootScope.selected_destination = [];

				$state.go('index');
			}

    	navigator.geolocation.getCurrentPosition(function($position){
		    // success!
		    $scope.me = [{'id':'me',
		      'coords': 
		      {'latitude': parseFloat($position.coords.latitude),
		       'longitude': parseFloat($position.coords.longitude)
		      },
		      'icon': "img/mylocation.png",
		      'options': {
			  'icon': {
			      //'scaledSize': new google.maps.Size(34, 44)
			  }
		      },
			}]; 
		}, function($error){

					    // error!
		});
		$scope.stations = [$rootScope.selected_origin];
		$scope.destinations = [$rootScope.selected_destination];
		
		$interval(function() {
				navigator.geolocation.getCurrentPosition(function($position){
				    // success!
				    $scope.$apply(function(){
				    $scope.me = [{'id':'me',
				      'coords': 
				      {'latitude': parseFloat($position.coords.latitude),
				       'longitude': parseFloat($position.coords.longitude)
				      },
				      'icon': "img/mylocation.png",
				      'options': {
					  'icon': {
					      //'scaledSize': new google.maps.Size(34, 44)
					  }
				      },
					}]; 
					});
				}, function($error){

							    // error!
				});
		}, 10000);
		
	})
    .controller("route_accepted_controller", function($scope, Agreement, sharedProperties, $state, uiGmapGoogleMapApi, $interval,  uiGmapIsReady, Station, $ionicPlatform, $cordovaBadge, $ionicPopup, $timeout, $rootScope){
			$rootScope.ready_to_accept = false;
			$rootScope.route_has_been_accepted = true;
			
			var makeid = function()
				{
				    var text = "";
				    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

				    for( var i=0; i < 15; i++ )
				        text += possible.charAt(Math.floor(Math.random() * possible.length));

				    return text;
				};

			if ((typeof(sharedProperties.getProperty()) === 'undefined') || (sharedProperties.getProperty() === '')) {
				Agreement.create({
					"pickup_station_id": $rootScope.selected_origin.id,
					"dropoff_station_id": $rootScope.selected_destination.id,
					"userId": $rootScope.user.id,
					"delivered": false,
				}).$promise
	    			.then(function($response){
	    				$rootScope.agreement = $response;
	    			});
				$rootScope.codes = makeid();
				sharedProperties.setProperty($rootScope.codes)
			} 
			

    	navigator.geolocation.getCurrentPosition(function($position){
		    // success!
		    $scope.me = [{'id':'me',
		      'coords': 
		      {'latitude': parseFloat($position.coords.latitude),
		       'longitude': parseFloat($position.coords.longitude)
		      },
		      'icon': "img/mylocation.png",
		      'options': {
			  'icon': {
			      //'scaledSize': new google.maps.Size(34, 44)
			  }
		      },
			}]; 
		}, function($error){

					    // error!
		});
		$scope.stations = [$rootScope.selected_origin];
		$scope.destinations = [$rootScope.selected_destination];
		
		$interval(function() {
				navigator.geolocation.getCurrentPosition(function($position){
				    // success!
				    $scope.$apply(function(){
				    $scope.me = [{'id':'me',
				      'coords': 
				      {'latitude': parseFloat($position.coords.latitude),
				       'longitude': parseFloat($position.coords.longitude)
				      },
				      'icon': "img/mylocation.png",
				      'options': {
					  'icon': {
					      //'scaledSize': new google.maps.Size(34, 44)
					  }
				      },
					}]; 
					});
				}, function($error){

							    // error!
				});
		}, 10000);

	})

    .controller("map_controller", function($scope, $state, uiGmapGoogleMapApi, uiGmapIsReady, Station, $ionicPlatform, $cordovaBadge, $ionicPopup, $timeout, $rootScope){
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
    $scope.destination_markers = {ready: false};
    $scope.route_points_ready = false;

    navigator.geolocation.getCurrentPosition(function($position){
	    // success!
	    setup_map(parseFloat($position.coords.latitude), parseFloat($position.coords.longitude));
	}, function($error){
	    setup_map({latitude: 0, longitude: 0});
	    // error!
	});
    var setup_map = function($latitude, $longitude){
	uiGmapGoogleMapApi.then(function(maps){
	    $rootScope.map = {};
	    $rootScope.map.center = {latitude: parseFloat($latitude),
				 longitude: parseFloat($longitude)};
	    $rootScope.map.zoom = 14;
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

	$scope.stroke = {
	    color: "#57068C",
	    weight: 2
	};
	Station.nearby({location: $location, distance: $distance})
	    .$promise
	    .then(function($response){
	    if ($response.stations.length >0) $rootScope.bikes_available = true;
	    else $rootScope.bikes_available = false;
		// recompile latitude, longitude from lat, lng
		angular.forEach($response.stations, function(station){
		    station.long_geolocation = {
			latitude: station.geolocation.lat,
			longitude: station.geolocation.lng
		    };
		    station.icon = "img/source.png";
		    station.find_available_destinations = function(){
		    	if (typeof($rootScope.isAuthenticated)==='undefined' || $rootScope.isAuthenticated == false ){
		    		$ionicPopup.alert({
				     title: 'Please Login',
				     buttons: [ {text: 'Cancel'},
				     	{
				     		text: 'Login',
				     		type: 'button-positive',
				     		onTap: function(e) {
				     			$state.go('login');
				     		}
				     	}


				     ]

				   });
		    		return;
		    	}

				
		    	$rootScope.selected_origin = station;
		    	Station.available_destinations({location: station.geolocation, distance: 1})
			    .$promise
			    .then(function($response){
				angular.forEach($response.stations, function(station){
				    station.long_geolocation = {
					latitude: station.geolocation.lat,
					longitude: station.geolocation.lng
				    };
				    station.icon = "img/destination.png";
				    station.get_route_info = function() {
				    	$rootScope.selected_destination = station;
				    	$scope.destinations = [station];
					var directionsService = new google.maps.DirectionsService;
					directionsService.route({
					    origin: new google.maps.LatLng($rootScope.selected_origin.geolocation.lat, $rootScope.selected_origin.geolocation.lng),
					    destination: new google.maps.LatLng($rootScope.selected_destination.geolocation.lat, $rootScope.selected_destination.geolocation.lng),
					    travelMode: google.maps.TravelMode.BICYCLING
					}, function(response, status) {
					    if (status === google.maps.DirectionsStatus.OK) {
						$rootScope.route_points = response.routes[0].overview_path;
						$scope.stations = [$rootScope.selected_origin];
						$scope.destinations = [$rootScope.selected_destination];
						$scope.$apply(function(){
						    $scope.route_points_ready = true;
						});
						$scope.$apply(function() {
							$rootScope.ready_to_accept = true;
						});
						
					    } else {
						window.alert('Directions request failed due to ' + status);
					    }
					});
				    }
				});
				$scope.stations = [station];
				$scope.destinations = $response.stations;
				$scope.destination_markers.ready = true;
			    });
		    };
		});
		$scope.stations = $response.stations;
		$scope.station_markers.ready = true;
		
		});
    }
})

.controller("menu_controller", function($scope, $ionicSideMenuDelegate, $state){
	
})

.controller("login_controller", function($scope, $ionicPopup, $rootScope, $window, $http, $state, User, $location, AppAuth, $cookies){
	$scope.credentials = {};
	$scope.login = function() {
	    User.login($scope.credentials, function(response) {
			$window.localStorage['access_token']=response.id;
			$window.localStorage['user']=response.user;
			$rootScope.isAuthenticated = true;
			$rootScope.user = response.user;
			$state.go('index');
		}, function(response) {
			$ionicPopup.alert({
			     title: 'Login Failed',
			     template: '<div style="text-align: center">Please try again.</div>'
			   });
		})
	}

	if (AppAuth.currentUser === null) {
		if ($cookies.access_token) {
			$scope.currentUser =
			AppAuth.currentUser = { id: 'social' };
		}
	}
	AppAuth.ensureHasCurrentUser(User);
	$scope.currentUser = AppAuth.currentUser;

	$scope.login_fb = function() {
		$window.location = '/auth/facebook';
	}

	$scope.login_google = function() {
		$window.location = '/auth/google';
	}

	$scope.login_twitter = function() {
		$window.location = '/auth/twitter';
	}

	$scope.register = function() {
		$state.go('register');
	}
})

.controller("register_controller", function($scope, $rootScope, $ionicPopup, $http, $state, User, $location, $window){

    $scope.user = {};
    $scope.register = function(){
		var newUser = {};
		newUser.email = $scope.user.email;
		newUser["name"] = $scope.user.first_name + " " + $scope.user.last_name;  
		newUser.username = $scope.user.email;
		newUser.password = $scope.user.password;

		User.create(newUser).$promise.then(function (user) {
			// success 
			// now automatically log them in 
		    User.login(newUser, function(response) {
				$window.localStorage['access_token']=response.id;
				$window.localStorage['user']=response.user;
				$rootScope.isAuthenticated = true;
				$rootScope.user = response.user;
				$ionicPopup.alert({
					     title: 'Welcome',
					     template: '<div style="text-align: center">Click on available '+
					     'stations (in Blue) to see destination stations (in Red). '+
					     'Then, click on one of the destinations</div>'
					   });
				$state.go('index');
			}, function(response) {
				$ionicPopup.alert({
				     title: 'Login Failed',
				     template: '<div style="text-align: center">Please try again.</div>'
				   });
			})
		});
    }
})

.controller("account_controller", function($scope, $http, $state, User, $location){
	// delete account
	// change password
	// payment methods
	// log out
})

.controller("braintree_payment_controller", function($scope, $http, $state, $stateParams, User, $ionicPopup) {

	// This clientToken has been generated by the Meal Carrier server.
	var client_token = User.client_token();
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
		user.payment_methods($scope.credentials, function(accessToken) {
			console.log(accessToken);
			console.log(accessToken.id);
		})
	}
})

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

.controller("logout_controller", function($scope, $window, $ionicPopup, $rootScope, $http, $state, User, $location){
	$scope.logout = function() {
	   	$window.localStorage['access_token']='';
		$rootScope.isAuthenticated = false;
		$rootScope.user = {};
		$ionicPopup.alert({
		     title: 'Logged Out',
		     template: '<div style="text-align: center">You have logged out successfully.</div>'
		   });
		$state.go('index');
	}
})
;
