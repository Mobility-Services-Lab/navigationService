angular.module('starter')
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.timeout = 5000;
    }])
    .factory('geocoderService', function($http) {
        var geocoderService = {
            getLatLng: function(address) {
            // $http returns a promise, which has a then function, which also returns a promise
            var promise = $http.get("http://nominatim.openstreetmap.org/search?q=" + address + "&format=json&addressdetails=1", {timeout: 1000}).then(function (response) {
                // The then function here is an opportunity to modify the response
                //console.log(response);
                // The return value gets picked up by the then in the controller.
                return response.data;
            }).catch(function(data) {
                return;
            });
            // Return the promise to the controller
            return promise;
            },
            getAddress: function(lat, lng) {
                 var promise = $http.get("http://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lng + "&zoom=18&addressdetails=1",  {timeout: 1000}).then(function (response) {
                // The then function here is an opportunity to modify the response
                //console.log(response);

                // The return value gets picked up by the then in the controller.
                return response.data;
            })
            .catch(function(data){
                console.log(data);
                //alert("connection error");
                return;
            });
            // Return the promise to the controller
            return promise;
                
            },
            getSuggestions: function (query) {
                var promise = $http.get("http://nominatim.openstreetmap.org/search?q=" + address + "&format=json&addressdetails=1", { timeout: 1000 }).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    //console.log(response);
                    // The return value gets picked up by the then in the controller.
                    return response.data;
                }).catch(function (data) {
                    return;
                });
                // Return the promise to the controller
                return promise;
            },

            getSurrounds: function (query) {
                //address = "13+Alexander-Fleming-Straße+82152";
                //var promise = $http.get("http://nominatim.openstreetmap.org/search?q=pubs+near+" + address + "&format=json&addressdetails=1", { timeout: 1000 }).then(function (response) {
                    var promise = $http.get("http://nominatim.openstreetmap.org/search?q=pubs+near+" + query + "&format=json&addressdetails=1", { timeout: 1000 }).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    //console.log(response);
                    // The return value gets picked up by the then in the controller.
                    return response.data;
                }).catch(function (data) {
                    return;
                });
                // Return the promise to the controller
                return promise;
            }

        };
        return geocoderService;
        });


        /*var details;
        function getAddress(address) {
            //

            $http.get().then(function (response) {
                //TODO Fehlermeldung
                details  = response.data;
                //point = new L.LatLng(response.data[0].lat, response.data[0].lon);
                //$scope.lat = response.data[0].lat;
                //$scope.lng = response.data[0].lon;
                //console.log("first " + lat + " " + lng);
            });
            console.log(details);
            return details;
            
            
            
        }
        

        return {
            getAddress: getAddress
        };
});*/