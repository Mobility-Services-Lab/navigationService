

angular.module('starter')
.factory('Calculations', function() {
    
        function calculateDistance(lat1, lon1, lat2, lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2 - lat1);  // deg2rad below
            var dLon = deg2rad(lon2 - lon1);
            var a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
                ;
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            d = d * 1000; // distance in m
            return Math.round(d * 100) / 100; //round up to 2 decimals
        }
        function deg2rad(deg) {
            return deg * (Math.PI / 180);
        }

        function calculateSpeed(t, lat1, lng1, lat2, lng2) { // t in seconds
            var distance = calculateDistance(lat1, lng1, lat2, lng2); // in meter
            var speed = distance / t;
            return Math.round(speed * 3.6); // km/h
        }

        return {
            calculateDistance: calculateDistance,
            calculateSpeed: calculateSpeed
        };
});