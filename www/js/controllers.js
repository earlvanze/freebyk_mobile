angular.module("freebyk.controller", ["uiGmapgoogle-maps"])
    .controller("map_controller", function($scope, uiGmapGoogleMapApi, uiGmapIsReady, Station, $ionicPlatform, $cordovaBadge, $ionicPopup, $timeout){
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
	find_nearby_stations($latitude, $longitude, 5);
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
		// recompile latitude, longitude from lat, lng
		angular.forEach($response.stations, function(station){
		    station.long_geolocation = {
			latitude: station.geolocation.lat,
			longitude: station.geolocation.lng
		    };
		    station.icon = "img/source.png";
		    station.find_available_destinations = function(){
		    	$scope.selected_origin = station;
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
				    	$scope.selected_destination = station;
				    	console.log($scope.selected_origin);
				    	console.log($scope.selected_destination);
				    	$scope.destinations = [station];
					var directionsService = new google.maps.DirectionsService;
					directionsService.route({
					    origin: new google.maps.LatLng($scope.selected_origin.geolocation.lat, $scope.selected_origin.geolocation.lng),
					    destination: new google.maps.LatLng($scope.selected_destination.geolocation.lat, $scope.selected_destination.geolocation.lng),
					    travelMode: google.maps.TravelMode.BICYCLING
					}, function(response, status) {
					    if (status === google.maps.DirectionsStatus.OK) {
						$scope.route_points = response.routes[0].overview_path;
						console.log($scope.selected_origin);
						$scope.stations = [$scope.selected_origin];
						$scope.destinations = [$scope.selected_destination];
						$scope.$apply(function(){
						    $scope.route_points_ready = true;
						});
						$timeout(function() {
							$ionicPopup.alert({
						     title: 'Would you like to accept the route?',
						     template: 'You have to pick up the bike at <strong>{{ selected_origin.stationName }} </strong> and take it to '+
										'<strong>{{ selected_destination.stationName }}</strong> within an hour.',
						     scope: $scope,
						     cssClass: 'accept_route',
						     buttons: [
						     	{ text: 'Accept',
						     	  type: 'button-positive',
						     	  onTap: function(e) {
						     	  	$scope.accept_route();
						     	  }
						     	},
						     	{ text: 'Decline',
						     	  type: 'button-positive',
						     	  onTap: function(e) {
						     	  	$scope.get_refreshed();
						     	  }
						     	},

						     ]
						   });
						}, 1000);
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
		/*
		$ionicPopup.alert({
				     title: 'Welcome',
				     template: '<div style="text-align: center">Click on available '+
				     'stations (in Blue) to see destination stations (in Red). '+
				     'Then, click on one of the destinations</div>'
				   });
		*/
	    });
    }
})

    .controller("menu_controller", function($scope, $ionicSideMenuDelegate, $state){
	
    })

    .controller("login_controller", function($scope, $ionicPopup, $rootScope, $window, $http, $state, Bykr, $location){
	$scope.credentials = {};
	$scope.login = function() {
	    Bykr.login($scope.credentials, function(response) {
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
	}

	$scope.register = function() {
		$state.go('register');
	}
})

.controller("register_controller", function($scope, $rootScope, $ionicPopup, $http, $state, Bykr, $location){

    $scope.user = {};
    $scope.register = function(){
	    $scope.user.username = $scope.user.email;
    	$scope.bykr = Bykr.create($scope.user, function(response) {
	    	Bykr.login({'email':$scope.user.email, 'password':$scope.user.password},
	    	function(response) {
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
    	}, function(response) {
    		$ionicPopup.alert({
			     title: 'Registration Failed',
			     template: '<div style="text-align: center">Please try again.</div>'
			   });
    	});
    }
})

.controller("account_controller", function($scope, $http, $state, Bykr, $location){
	// delete account
	// change password
	// charge methods
	// log out
})

.controller("logout_controller", function($scope, $window, $ionicPopup, $rootScope, $http, $state, Bykr, $location){
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
