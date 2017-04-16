angular.module('starter')
    .factory('zoomLevelService', function() {
        var zoomLevel0 = 18; // 0  - 20 km/h
        var zoomLevel1 = 17; // 20 - 40 km/h
        var zoomLevel2 = 16; // 40 - 70 km/h
        var zoomLevel3 = 14; // 70 - 120 km/h
        var zoomLevel4 = 12; // > 120 km/h
        
        function getZoomLevel(currentSpeed, lastSpeed) {
            result = 0;
            if (currentSpeed < 20) {
                if (lastSpeed < 20) {
                    result = zoomLevel0;
                } else {
                    result = zoomLevel1;
                }
            } else if (currentSpeed >= 20 && currentSpeed < 40){
                if (lastSpeed < 20) { //lastSpeed was Lower
                    result = zoomLevel0;
                } else if (lastSpeed > 40) { //lastSpeed was Higher
                    result = zoomLevel2;
                } else {
                    result = zoomLevel1;
                }
            } else if (currentSpeed >= 40 && currentSpeed < 70){
                if (lastSpeed < 40) {
                    result = zoomLevel1;
                } else if (lastSpeed > 70) {
                    result = zoomLevel3;
                } else {
                    result = zoomLevel2;
                }
            } else if (currentSpeed >= 70 && currentSpeed < 120){
                if (lastSpeed < 70) {
                    result = zoomLevel2;
                } else if (lastSpeed > 120) {
                    result = zoomLevel4;
                } else {
                    result = zoomLevel3;
                }
            } else { // speed > 120
                if (lastSpeed < 120) {
                    result = zoomLevel3;
                } else {
                    result = zoomLevel4;
                }
            }
            console.log("getZoomLevel: currentSpeed: " + currentSpeed + " lastSpeed: "+ lastSpeed + " result: " + result);
            return result
        }
        

        return {
            getZoomLevel: getZoomLevel
        };
});