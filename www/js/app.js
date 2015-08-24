// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('freebyk', 
  ['ionic', 
  'uiGmapgoogle-maps',
  'freebyk.controller',
  'ngRoute',
  'lbServices'
  ])

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

.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyAv3u1uLviJaQ8BeFPXFcjCcaIUsvHpxWM',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
})

.config( function($httpProvider) {
  // $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
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
    ;
    $urlRouterProvider.otherwise("/index");
    // $urlRouterProvider.otherwise("/request_pickup");
})