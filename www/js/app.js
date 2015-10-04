// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('freebyk', 
  ['ionic', 
  'uiGmapgoogle-maps',
  'freebyk.controller',
  'ngRoute',
   'lbServices',
   "ngCordova",
   "freebyk.services",
   "ngCookies"
  ])

.config(function(LoopBackResourceProvider) {

  // Use a custom auth header instead of the default 'Authorization'
  // LoopBackResourceProvider.setAuthHeader('X-Access-Token');

  // Change the URL where to access the LoopBack REST API server
  LoopBackResourceProvider.setUrlBase('http://freebyk.com:8080/api');
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.run(function($window, $rootScope, $state, $ionicPopup) {
    
    if (typeof($window.localStorage['access_token'])!=='undefined' && $window.localStorage['access_token'] !==''){
      $rootScope.isAuthenticated = true;
      $rootScope.user = $window.localStorage['user'];
    }
    
    $rootScope.get_refreshed = function() {
      $rootScope.ready_to_accept = false;
      $state.go($state.current, {}, {reload: true});
    };

    $rootScope.accept_popup = function() {
                $ionicPopup.alert({
                 title: 'Would you like to accept the route?',
                 template: 'You have to pick up the bike at <strong>{{ selected_origin.stationName }} </strong> and take it to '+
                    '<strong>{{ selected_destination.stationName }}</strong> within an hour.',
                 scope: $rootScope,
                 cssClass: 'accept_route',
                 buttons: [
                  { text: 'Accept',
                    type: 'button-positive',
                    onTap: function(e) {
                      $rootScope.accept_route();
                    }
                  },
                  { text: 'Decline',
                    type: 'button-positive',
                    onTap: function(e) {
                      $rootScope.get_refreshed();
                    }
                  },

                 ]
               });

    }

    $rootScope.accept_route = function() {
      $state.go('route_accepted');
    }
})



.config( function($httpProvider, uiGmapGoogleMapApiProvider) {
	uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyAv3u1uLviJaQ8BeFPXFcjCcaIUsvHpxWM',
            v: '3.20',
            libraries: ''
});


	//$httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
	$httpProvider.defaults.headers.post["Content-Type"] = "application/json; charset=UTF-8";
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];


  $httpProvider.interceptors.push(function($q, $location, LoopBackAuth) {
    return {
      responseError: function(rejection) {
        if (rejection.status == 401) {
          //Now clearing the loopback values from client browser for safe logout...
          LoopBackAuth.clearUser();
          LoopBackAuth.clearStorage();
          $location.nextAfterLogin = $location.path();
          $location.path('/login');
        }
        return $q.reject(rejection);
      }
    };
  });
})


.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
    .state("login", {
      url: "/login",
      controller: "login_controller",
      templateUrl: "templates/login.html"
    })
    .state("register", {
      url: "/register",
      controller: "register_controller",
      templateUrl: "templates/register.html"
    })
    .state("account", {
      url: "/account",
      controller: "account_controller",
      templateUrl: "templates/account.html"
    })
    .state("index", {
      url: "/index",
      controller: "map_controller",
      templateUrl: "templates/map.html"
    })
    .state("braintree_payment", {
      url: "/braintree_payment",
      controller: "braintree_payment_controller",
      templateUrl: "templates/braintree_payment.html"
    })
    .state("route_accepted", {
      url: "/route_accepted",
      controller: "route_accepted_controller",
      templateUrl: "templates/route_accepted.html"
    })

    ;
    $urlRouterProvider.otherwise("/index");
    // $urlRouterProvider.otherwise("/request_pickup");
})
  .service('sharedProperties', function () {
        var property = '';

        return {
            getProperty: function () {
                return property;
            },
            setProperty: function(value) {
                property = value;
            }
        };
    });
