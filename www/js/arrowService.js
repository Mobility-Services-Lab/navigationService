angular.module('starter')
    .factory('arrowService', function() {
    
        function getImageSource(instructionType) {
            console.log("instructionType " + instructionType)
            var src;
            if (instructionType == "Straight") {
                src = './img/arrows/straight.png';
            } else if (instructionType == "Left"){
                src = './img/arrows/left.png';
            } else if (instructionType == "Right"){
                src = './img/arrows/right.png';
            } else if (instructionType == "SlightRight"){
                src = './img/arrows/slight-right.png';
            } else if (instructionType == "SlightLeft"){
                src = './img/arrows/slight-left.png';
            } else if (instructionType == "SharpRight"){
                src = './img/arrows/sharp-left.png';
            } else if (instructionType == "SharpLeft"){
                src = './img/arrows/shart-left.png';
            } else if (instructionType == "Roundabout"){
                src = './img/arrows/roundabout.png';
            } else {
                src = './img/arrows/empty.png';
                console.log("Did not find: " + instructionType);
            }
            return src;
        }
        

        return {
            getImageSource: getImageSource
        };
});