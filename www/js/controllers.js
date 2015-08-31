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
	$scope.login = function() {
		$scope.loginResult = Bykr.login($scope.credentials, function() {
			// success
		}, function(res) {
			// error
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

.controller("register_controller", function($scope, $http, $state){

    $scope.user = {};
    $scope.register = function(){
		$http({
		    url: "http://mealcarrier.com:8080/register",
		    method: "POST",
		    data:{
		    	"first_name": $scope.user.first_name,
		    	"last_name": $scope.user.last_name,
				"email": $scope.user.email,
				"password": $scope.user.password,
				"confirm_password": $scope.user.confirm_password
		    }
		})
		.then(function($response){
		    //success
		    // console.log($scope.user.token);
		    if (!$response.data.success){
		    	console.log($response.data.message)
		    } else {
		    	console.log($response.data.message);
			    $scope.user.token = $response.data.token;
    		    console.log($scope.user.token);
		    	$state.go('request_pickup');
		    }
		},
		function($response){
		    console.log($response);
		    console.log("Error: Can't connect to server.");
		    //error
		});
	}
})

;
