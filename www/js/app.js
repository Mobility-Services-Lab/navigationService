// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'


var app = angular.module('starter', ['ionic', 'ui-leaflet', 'ngCordova']);

app.run(function ($ionicPlatform, $ionicPopup, $rootScope) {
    $ionicPlatform.registerBackButtonAction(function (event) {
        $rootScope.$emit('backButtonPressed');

    }, 100);
    $ionicPlatform.ready(function() {
        document.addEventListener("deviceready", function() {
            if (window.cordova && window.cordova.plugins) {
                console.log('window.cordova.plugins is available');
            } else {
                console.log('window.cordova.plugins NOT available');
            }
        }, false);


        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);

            //Get permission from user
            cordova.plugins.diagnostic.isLocationAuthorized(function (authorized) {
                console.log("Location is " + (authorized ? "authorized" : "unauthorized"));
                if (authorized) {
                    $rootScope.$emit("locationGranted");
                } else {
                    cordova.plugins.diagnostic.requestLocationAuthorization(function (status) {
                        if (status == cordova.plugins.diagnostic.permissionStatus.GRANTED) {
                            $rootScope.$emit("locationGranted");
                        } else if (cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE) {
                            console.log("Permission granted only when in use");
                            $rootScope.$emit("locationGranted");
                        } else {
                            console.warn("Permission denied to use location");
                        }
                    }, function (error) {
                        console.error(error);
                    });
                }
            }, function (error) {
                console.error("The following error occurred: " + error);
            });
           
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

app.controller('BasicLFCenterController', ["$scope", "$timeout", "$rootScope", "$cordovaGeolocation", "$cordovaDeviceOrientation" ,'leafletMapEvents', 'routeFactory', 'zoomLevelService', 'geocoderService', '$timeout', '$ionicPopup', 'arrowService', function ($scope, $timeout, $rootScope, $cordovaGeolocation, leafletMapEvents, $cordovaDeviceOrientation, routeFactory, zoomLevelService, geocoderService, $ionicLoading, $ionicPopup, arrowService) {
    angular.extend($scope, {
        center: {
            lat: 51.505,
            lng: -0.09,
            zoom: 12
        },
        defaults: {
            zoomControl: false
        },
        events: {
            map: {
                enable: ['click']
            }
        }
    });
                                           
    //init map
    var map = new L.map('map', { rotate: true, touchRotate: true })
        .setView([55, 10], 4);

    var currentPosition;
    var positionEndPoint;

    $scope.routing;
    $scope.watch;

    $scope.state = 0; 
    /*  0 = start
        1 = Destination found
        2 = Route calculated
        3 = Routing
    */
    $scope.graphhopperKey = "INSERT_YOUR_KEY";
    $scope.routingControl = routeFactory;
    $scope.currentInstruction = $scope.routingControl.getInstruction();
    $scope.lastSpeed = 0;
    $scope.speed = 0;
    $scope.isOffRoute = false;
    $scope.isFocused = false;
    $scope.isRouting = false;
    $scope.routeCalculated = false;
    $scope.itemDisplayed = false;
    $scope.showRouteButton = true;
    $scope.showStartRouteButton;
    $scope.showDeleteRouteButton;
    $scope.showInstructionText;
    $scope.focusOnPositionWasPressed = false;
    $scope.fade = false;

    //Only important for android
    $rootScope.$on("backButtonPressed", function(event) {
        console.log("backButtonPressed");
        if ($scope.state == 0) { // your check here
            $ionicPopup.confirm({
                title: 'System warning',
                template: 'are you sure you want to exit?'
            }).then(function (res) {
                if (res) {
                    ionic.Platform.exitApp();
                }
            })
        } else if ($scope.state == 1) {
            $scope.changeState(0);
        } else if ($scope.state == 2) {
            $ionicPopup.confirm({
                title: 'System warning',
                template: 'Do you really want to delete the route?'
            }).then(function(res){
                if (res){
                    $scope.deleteRoute();                    
                }
            })
        } else if ($scope.state == 3){
            $scope.changeState(2);
            $scope.infos = $scope.routingControl.getRouteInformation();
              
        }
    });

    //Items from addressSearchCtrl
    $rootScope.$on("itemsDisplayed", function(event){
        $scope.itemDisplayed = true;
    })


    $scope.changeState = function(state) {
        $scope.state = state;
        if (state == 0) { //start
            $scope.arrowSrc = arrowService.getImageSource("");
            $scope.speedText = "";
            $scope.showEditDestinationButton = false;
            $scope.showRouteButton = false;
            $scope.showStartRouteButton = false;
            $scope.showDeleteRouteButton = false;
            $scope.showInstructionText = false;
            $scope.showAbortRoutingButton = false;
            $scope.showIonSpinner = false;
            $scope.addressLabelWasPressed = false;
            $scope.showArrow = false;
            $scope.infos = "";
            $scope.routingInfos = "";
            $scope.showEditDestinationButton = false;
            $scope.showRouteButton = false;
            $rootScope.$emit('showFields');
            $scope.currentInstruction = "";
        } else if (state == 1) { //Destination found
            $scope.showEditDestinationButton = true;
            $scope.showRouteButton = true;
            $scope.showDeleteRouteButton = false;
            $scope.showStartRouteButton = false;
            $scope.routeCalculated = false;
            $rootScope.$emit('disableFields');
        } else if (state == 2) { // route calculated
            $scope.showRouteButton = false;
            $scope.showInputField = false;
            $scope.showEditDestinationButton = false;
            $scope.showStartRouteButton = true;
            $scope.showDeleteRouteButton = true;
            $scope.routeCalculated = true;
            $scope.isRouting = false;
            $scope.showArrow = false;
            $scope.showAbortRoutingButton = false;
            $scope.showInstructionText = false;
            $scope.routingInfos = "";
            $scope.speedText = "";
        } else if (state == 3){ // routing
            $scope.infos = "";
            $scope.isRouting = true;
            $scope.showStartRouteButton = false;
            $scope.showDeleteRouteButton = false;
            $scope.showAbortRoutingButton = false;
            $scope.showInstructionText = true;
            $scope.showArrow = true;
            $scope.routeCalculated = false;
        }
        $timeout(function () { }, 0);
    }

    var customControl = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

            
            container.style.backgroundImage = "url(./img/position_symbol.png)";
            container.style.backgroundSize = "40px 40px";
            container.style.width = '40px';
            container.style.height = '40px';
            container.style.border = 'none';

            container.onclick = function (e) {
                $scope.focusOnPositionWasPressed = true;
                $scope.focusOnCurrentPosition();
            }

            var button = L.DomUtil.create('div', 'leaflet-buttons-control-button', container);
            return container;
        }
    });

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | Uses <a href="https://graphhopper.com/">GraphHopper</a>',
        type: 'xyz'
    }).addTo(map);
    map.addControl(new customControl());
    map.invalidateSize();


   

    map.on('click', function (e) {
        
        console.log("map on click");
        if ($scope.isRouting || $scope.routeCalculated) {
            if ($scope.isRouting){
                if ($scope.showAbortRoutingButton) {
                    $scope.showAbortRoutingButton = false;
                } else {
                    $scope.showAbortRoutingButton = true;
                }  
            }
            return;
        }
        if ($scope.focusOnPositionWasPressed) {
            $scope.focusOnPositionWasPressed = false;
            return;
        }
        if ($scope.addressLabelWasPressed) {
            $scope.addressLabelWasPressed = false;
            return;
        }
        if ($scope.itemDisplayed){
            $rootScope.$emit("closeItems");
            return;
        }
        $scope.setpositionEndPoint(e.latlng, "Ziel");
    });


    $scope.route = function () {
        if (angular.isUndefined(currentPosition) || angular.isUndefined(positionEndPoint)) {
            console.log("marker are undefined");
            return;
        }
        $scope.showSpinner();
        $scope.routing = L.Routing.control({
            router: new L.Routing.GraphHopper($scope.graphhopperKey),
            waypoints: [
                currentPosition.getLatLng(),
                positionEndPoint.
                    getLatLng()
            ],
            routeWhileDragging: true,
            show: false
        }).addTo(map);
        $scope.routing.on('routesfound', function (e) {
            console.log(e);
            $scope.routingControl.setRoute(e);
            if ($scope.isRouting == false) { //do not change state; only route will be calculated new
                $scope.changeState(2);
                $scope.infos = $scope.routingControl.getRouteInformation();    
            } 
            

        });
        $scope.routing.on('routingerror', function (e) {
            var alertPopup = $ionicPopup.alert({
                title: 'Error!',
                template: 'Could not find route, check internet connection!'
            });
            alertPopup.then(function (res) { /* not used */
            });
        });
        $scope.hideSpinner();
        $timeout(function () { }, 0);


    }, function (err) {
        console.log(err);
    };


    $scope.startRoute = function () {
        $scope.changeState(3);
        
    }

    function compassOnSuccess(heading) {
        map.setBearing(heading.magneticHeading + 180);
    };

    function compassOnError(error) {
        console.log('CompassError: ' + error.code);
    };

    $rootScope.$on('newInstruction', function () {
        $scope.currentInstruction = $scope.routingControl.getInstruction();
        var img = $scope.routingControl.getInstructionSign();
        $scope.arrowSrc = arrowService.getImageSource(img);
    });

    $rootScope.$on('offRoute', function () {
        $scope.isOffRoute = true;

    });

    $rootScope.$on('routingFinished', function () {
        $scope.currentInstruction = $scope.routingControl.getInstruction();
        var img = $scope.routingControl.getInstructionSign();
        $scope.arrowSrc = arrowService.getImageSource(img);
        
    });

    $scope.abortRouting = function () {
        //TODO ask if user really want to end route
        $ionicPopup.confirm({
            title: 'Warning',
            template: 'Do you really want to quit routing?'
        }).then(function(res){
            if (res){
                $scope.changeState(0);
                $scope.isRouting = false;
                $scope.routing.spliceWaypoints(0, 2);
                map.removeLayer(positionEndPoint);
            }
        })
        
        
    }


    $scope.setcurrentPosition = function (lat, lng) {
        var positionIcon = L.icon({
            iconUrl: './css/images/position-marker-new.png',
            //shadowUrl: 'position-marker.png',

            iconSize: [10, 10], // size of the icon
            shadowSize: [1, 1], // size of the shadow
            iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
            shadowAnchor: [1, 1],  // the same for the shadow
            popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
        });
        //currentPosition = new L.marker([lat, lng], {icon: positionIcon});

        if (angular.isUndefined(currentPosition) == false) {
            map.removeLayer(currentPosition);
        }
        currentPosition = new L.marker([lat, lng], { icon: positionIcon });
        map.addLayer(currentPosition);
        //.bindPopup(message).addTo(map);
    }

    $scope.setpositionEndPoint = function (latlng, message) {

        if (angular.isUndefined(positionEndPoint) == false) {
            //delete old marker
            map.removeLayer(positionEndPoint);
        }
        console.log("setpositionEndPoint: " + latlng.lat + " " + latlng.lng + " " + message);
        geocoderService.getAddress(latlng.lat, latlng.lng).then(function (d) {
            console.log(d);
            if (angular.isUndefined(d) == false) {
                if (!angular.isUndefined(d.address.road)) {
                    $scope.infos = d.address.road + " ";
                }
                if (!angular.isUndefined(d.address.house_number)) {
                    $scope.infos += d.address.house_number + " ";
                }
                $scope.infos += "\n";
                if (!angular.isUndefined(d.address.postcode)) {
                    $scope.infos += d.address.postcode + " ";
                }
                if (!angular.isUndefined(d.address.town)) {
                    $scope.infos += d.address.town + " ";
                }
                $scope.infos += "\n";
                if (!angular.isUndefined(d.address.country)) {
                    $scope.infos += d.address.country + " ";
                }

            }
        });

        positionEndPoint = new L.marker(latlng).bindPopup(message).addTo(map);
        map.setView(latlng, 15);
       $scope.changeState(1);
        

    }

    $scope.initcurrentPosition = function () {
        

        var posOptions = { timeout: 10000, enableHighAccuracy: true };
        
        
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {

                /*geocoderService.getAddress(position.coords.latitude, position.coords.longitude).then(function (d) {
                    address = d.address.road + "+" + d.address.house_number + "+" + d.address.postcode;
                });*/

                
                map.setView(new L.LatLng(position.coords.latitude, position.coords.longitude), 12);
                                

            }, function (err) {
                console.log(err);
                
            });
        
        $scope.startWatchPosition();
    }

    $scope.focusOnCurrentPosition = function () {
        map.setView(currentPosition.getLatLng(), 15);
    }

    $scope.startWatchPosition = function () {
        console.log("startWatchPosition started");
        var watchOptions = {
            timeout: 10000,
            enableHighAccuracy: true // may cause errors if true
        };
        $scope.watch = $cordovaGeolocation.watchPosition(watchOptions);
        $scope.watch.then(function () { /* Not  used */ },
            function (err) {
                // An error occurred.
                console.log("Error: startWatchPosition");
                console.log(err);
                $scope.watch.clearWatch();
                $scope.startWatchPosition();
                
                
            },
            function (position) {

                // Active updates of the position here
                // position.coords.[ latitude / longitude]
                // this is where you will add your code to track changes in co-ordinates
                console.log("retrieving position Success");

                $scope.setcurrentPosition(position.coords.latitude, position.coords.longitude);
                if ($scope.isRouting) {
                    if ($scope.isOffRoute) {
                        console.log("deleting route and calculating new route");
                        $scope.routing.spliceWaypoints(0, 2);
                        $scope.routingControl.abortRouting();
                        $scope.route();
                        $scope.changeState(3);
                        $scope.isOffRoute = false;
                    } else {
                        $scope.routingControl.updateCurrentPosition(position.coords.latitude, position.coords.longitude);
                        $scope.lastSpeed = $scope.speed;
                        $scope.speed = $scope.routingControl.getCurrentSpeed();
                        $scope.speedText = "Speed: " + $scope.speed + "km/h" ;
                        $scope.routingInfos = $scope.routingControl.getInfos();
                        console.log("routingInfos: " + $scope.routingInfos);
                    }
                    //TODO activate/deactivate focus
                    map.setView(new L.LatLng(position.coords.latitude, position.coords.longitude), zoomLevelService.getZoomLevel($scope.speed, $scope.lastSpeed));

                    navigator.compass.getCurrentHeading(compassOnSuccess, compassOnError);
                }

            });
    }

    $scope.deleteRoute  = function () {
        $scope.routing.spliceWaypoints(0, 2);
        $scope.routingControl.abortRouting();
        $scope.changeState(1);
        

        $scope.setpositionEndPoint(positionEndPoint.getLatLng());
        
        //$scope.$apply();
    }

    $scope.editDestination = function () {
        $scope.changeState(0)
    }

    $scope.showSpinner = function () {
        
        $scope.showIonSpinner = true;
        $timeout(function () { }, 0);
    }
    $scope.hideSpinner = function () {
        $scope.showIonSpinner = false;
        $timeout(function () { }, 0);
    }

    $rootScope.$on('itemClicked', function (event, data) {
        $scope.addressLabelWasPressed = true;
        $scope.setpositionEndPoint(new L.LatLng(data.lat, data.lon), "onItemClicked");
    });

    $rootScope.$on('locationGranted', function(event, data) {
        console.log("locationGranted");
        $scope.initcurrentPosition();
    });

   
    $scope.changeState(0);
   


}]);

