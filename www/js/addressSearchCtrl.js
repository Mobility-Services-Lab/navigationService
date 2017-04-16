angular.module('starter')
.controller('FindAddressController', ["$scope", "$rootScope", "$timeout", 'geocoderService', '$window', function($scope, $rootScope, $timeout, geocoderService, $window) {

    $scope.addressDisplayItems = new Array();
    $scope.addressItems = new Array();
    $scope.showInputField = true;
    $scope.customHeight = "10%";

    
    $scope.find = function () {
        geocoderService.getLatLng($scope.address).then(function (d) {
            $scope.addressDisplayItems = [];
            $scope.addressItems = [];        
            if (angular.isUndefined(d)) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Could not find address, check internet connection!'
                });
                alertPopup.then(function (res) { /* not used */
                });
            } else {
                height = 0;
                for (var i = 0; i < d.length; i++) {
                    $scope.addressDisplayItems.push(d[i].display_name);
                    $scope.addressItems.push(d[i]);
                    height = height + 58; //px
                }
                
                if (d.length > 1) { //more than one address
                    $scope.showTextField = true;
                    $timeout(function () { }, 0);
                    
                    if (height > $window.innerHeight) {
                        $scope.customLabelHeight = "100%";
                        $scope.customHeight = "100%";
                    } else {
                        $scope.customLabelHeight = height + "px";
                        cusHeight = $window.innerHeight * 0.1; //10%
                        $scope.customHeight = height + cusHeight + "px";
                    }
                    $rootScope.$emit('itemsDisplayed');
                } else {
                    $scope.sendAddress(0);
                }

            }

        });
    }
    $scope.selectItem = function(index){
        $scope.sendAddress(index);
    }

    $scope.sendAddress = function(index) {
        var item = $scope.addressItems[index];
        $rootScope.$emit("itemClicked", item);

        $scope.showInputField = false;
        
        $timeout(function () { }, 0);
        
    }

    $rootScope.$on("showFields", function(e) {
        $scope.showInputField = true;
        $scope.customHeight = "10%";
        $scope.customLabelHeight = "0";
        $scope.addressItems = [];
        $scope.addressDisplayItems = [];
        $timeout(function () { }, 0);
        
    });

    $rootScope.$on("disableFields", function(e){
        $scope.showInputField = false;
    });

    $rootScope.$on("closeItems", function(e){
        $scope.customHeight = "10%";
        $scope.customLabelHeight = "0";
        $scope.addressItems = [];
        $scope.addressDisplayItems = [];
        $timeout(function () { }, 0);
    });


    }]);
