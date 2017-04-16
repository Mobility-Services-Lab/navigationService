

angular.module('starter')
    .factory('routeFactory', ['Calculations', '$rootScope', function (Calculations, $rootScope) {
        instructions = new Array();
        coordinates = new Array();
        currentInstruction = "Routing not started";
        currentInstructionSign = "";
        routeInformation = "";
        currentInstructionID = 0;
        var lastTime = 0;
        var lastLat;
        var lastLng;
        currentSpeed = 0;
        distanceLimit = 9999; //?
        offRouteCounter = 0;
        offRouteLimit = 3; //?
        nextInstructionPoint = 0;
        distanceToNextInstruction = 0;
        //For testing:
        lastKnownDistanceToNext = 0;
        currentNearestPoint = 0;
        isOffRoute = false;

        function setRoute(routingElement) {

            for (var i = 0; i < routingElement.routes[0].instructions.length; i++) {
                instructions.push(routingElement.routes[0].instructions[i]);
            }
            console.log(instructions);
            for (var i = 0; i < routingElement.routes[0].coordinates.length; i++) {
                coordinates.push(routingElement.routes[0].coordinates[i]);
            }

            distance = routingElement.routes[0].summary.totalDistance;
            time = routingElement.routes[0].summary.totalTime;
            formatRouteInformation(distance, time);
            setInstruction(0);
        }

        function formatRouteInformation(distance, time){
            distance = distance / 1000;
            strTime = "";
            time = time / 60;

            if ( time > 60){
                timeMin = time%60;
                tmpTime = time;
                tmpH = 0;
                while (tmpTime > 60) {
                    tmpTime = tmpTime - 60;
                    tmpH = tmpH + 1;
                }
                strTime = tmpH + " h " + Math.round(timeMin) + " min";
            } else {
                strTime = Math.round(time) + " min";
            }
            routeInformation = "Distance: " + Math.round(distance*10)/10 + " km Time: " + strTime;
            
        }


        function getInstruction() {
            return currentInstruction;
        }

        function updateCurrentPosition(lat, lng) {
            var currentDate = new Date();
            if (lastTime != 0) { //only if there is lastTime given
                var milisecondsDiff = currentDate - lastTime;
                var secondsDiff = milisecondsDiff / 1000;
                deltaT = secondsDiff;
                currentSpeed = Calculations.calculateSpeed(deltaT, lastLat, lastLng, lat, lng);
            }
            lastTime = currentDate;
            lastLat = lat;
            lastLng = lng;


            var nearestPoint = getNearest(lat, lng);
            

            if (nearestPoint == coordinates.length - 1){
                console.log("endRouting");
                endRouting();
                return;
            }
            
            lat1 = L.latLng(coordinates[nearestPoint + 1]).lat;
            lng1 = L.latLng(coordinates[nearestPoint + 1]).lng;
            currentDistanceNext = Calculations.calculateDistance(lat1, lng1, lat, lng);
            if (nearestPoint == currentNearestPoint) {
                if (currentDistanceNext > lastKnownDistanceToNext) {
                    offRouteCounter++;
                    lastKnownDistanceToNext = currentDistanceNext;
                    console.log("offRoute - " + offRouteCounter);
                } else {
                    lastKnownDistanceToNext = currentDistanceNext;
                    offRouteCounter = 0;
                }
            } else {
                lastKnownDistanceToNext = currentDistanceNext;
            }
            currentNearestPoint = nearestPoint;

            if (offRouteCounter >= offRouteLimit) {
                console.log("offRoute, counter: " + offRouteCounter + " limit: " + offRouteLimit);
                sendEvent('offRoute');
            }

            var instrID = getInstructionForPoint(nearestPoint) + 1;
            nextInstructionPoint = getPointForInstruction(instrID);
            distanceToNextInstruction = getDistanceToNextInstruction(lat, lng, nextInstructionPoint - 1);
            if (instrID != currentInstructionID) {
                setInstruction(instrID);
            }
        }

        function getNearest(lat, lng) {
            distance = 9999;
            nearestPoint = 0;
            for (var i = 0; i < coordinates.length; i++) {
                lat1 = L.latLng(coordinates[i]).lat;
                lng1 = L.latLng(coordinates[i]).lng;
                new_distance = Calculations.calculateDistance(lat1, lng1, lat, lng);
                if (new_distance < distance) {
                    distance = new_distance;
                    nearestPoint = i;
                }
            }
            return getNNearest(lat, lng, 1);
        }

        function getNNearest(lat, lng, n){

            distance = 9999;
            nSmallestDistance = 0;
            nearestPoint = 0;
            for (var k = 0; k < n; k++) {
                distance = 9999;
                
                for (var i = 0; i < coordinates.length; i++) {
                    lat1 = L.latLng(coordinates[i]).lat;
                    lng1 = L.latLng(coordinates[i]).lng;
                    new_distance = Calculations.calculateDistance(lat1, lng1, lat, lng);
                    if (new_distance < distance && new_distance > nSmallestDistance) {
                        distance = new_distance;
                        nearestPoint = i;
                    }
                }
                nSmallestDistance = distance;
            }
            return nearestPoint;
        }

        function getInstructionForPoint(coordinatePoint) {
            if (coordinatePoint == 0) {
                return 0;
            }
            var i = 1;
            for (instr = 0; instr < instructions.length; instr++) {
                distance = instructions[instr].distance;
                calculatedDistance = 0;
                while ((distance - calculatedDistance) > 1) // calculate coordinates for instruction
                {
                    if (i > coordinates.length) { //end of instructions is reached
                        break;
                    }
                    if (i == coordinatePoint) { // found instruction for point
                        return instr;
                    }

                    lat1 = L.latLng(coordinates[i - 1]).lat;
                    lng1 = L.latLng(coordinates[i - 1]).lng;
                    lat2 = L.latLng(coordinates[i]).lat;
                    lng2 = L.latLng(coordinates[i]).lng;
                    addedDistance = Calculations.calculateDistance(lat1, lng1, lat2, lng2)
                    calculatedDistance = calculatedDistance + addedDistance;
                    i++;
                }
            }
            return 0;
        }

        function getPointForInstruction(instruction) {
            if (instruction == 0) {
                return 0;
            }
            var i = 1;
            for (instr = 0; instr < instructions.length; instr++) {
                distance = instructions[instr].distance;
                calculatedDistance = 0;
                while ((distance - calculatedDistance) > 1) // calculate coordinates for instruction
                {
                    if (i >= coordinates.length) { //end of instructions is reached
                        break;
                    }
                    if (instr == instruction) { // found instruction for point
                        return i;
                    }

                    lat1 = L.latLng(coordinates[i - 1]).lat;
                    lng1 = L.latLng(coordinates[i - 1]).lng;
                    lat2 = L.latLng(coordinates[i]).lat;
                    lng2 = L.latLng(coordinates[i]).lng;
                    addedDistance = Calculations.calculateDistance(lat1, lng1, lat2, lng2)
                    calculatedDistance = calculatedDistance + addedDistance;
                    i++;
                }
            }
            return i;
        }

        function getDistanceToNextInstruction(lat, lng, instructionPoint) {
            
            var firstNearest = getNearest(lat, lng);
            var secondNearest = getNNearest(lat, lng, 2);

            var nextPoint;
            if (firstNearest > secondNearest){
                nextPoint = firstNearest;
            } else {
                nextPoint = secondNearest;
            }
            //calculate distance to next point
            lat1 = L.latLng(coordinates[nextPoint]).lat;
            lng1 = L.latLng(coordinates[nextPoint]).lng;
            distanceToNext = Calculations.calculateDistance(lat, lng, lat1, lng1);
            distance = 0;
            for(i=0; (nextPoint + i) < instructionPoint; i++) {
                lat1 = L.latLng(coordinates[nextPoint + i]).lat;
                lng1 = L.latLng(coordinates[nextPoint + i]).lng;
                lat2 = L.latLng(coordinates[nextPoint + i + 1]).lat;
                lng2 = L.latLng(coordinates[nextPoint + i + 1]).lng;
                distance = distance + Calculations.calculateDistance(lat1, lng1, lat2, lng2);
            }
            return Math.round(distance + distanceToNext);
        }

        function setInstruction(id) {
            if (id > instructions.length) {
                currentInstruction = "Finished!";
                return;
            }

            
            currentInstructionSign = instructions[id].type;
            currentInstruction = instructions[id].text;
            sendEvent('newInstruction');
        }

        function sendEvent(message) {
            $rootScope.$emit(message);
        }

        function getInstructionSign() {
            return currentInstructionSign;
        }


        function getCurrentSpeed() {
            return currentSpeed;
            
        }
        function getInfos() {
            return distanceToNextInstruction + "m";
        }

        function abortRouting() {
            instructions = [];
            coordinates = [];
            currentInstruction = "Routing not started";
            currentInstructionID = 0;
            offRouteCounter = 0;
            var lastTime = 0;
            var lastLat;
            var lastLng;
            currentSpeed = 0;
            routeInformation = "";
            sendEvent('newInstruction');
        }

        function endRouting() {
            instructions = [];
            coordinates = [];
            currentInstruction = "Routing finished";
            currentInstructionID = 0;
            offRouteCounter = 0;
            var lastTime = 0;
            var lastLat;
            var lastLng;
            currentSpeed = 0;
            routeInformation = "";
            sendEvent('routingFinished');
        }

        function getRouteInformation() {
            return routeInformation;
        }

        return {
            setRoute: setRoute,
            getInstruction: getInstruction,
            updateCurrentPosition: updateCurrentPosition,
            getCurrentSpeed: getCurrentSpeed,
            abortRouting: abortRouting,
            getInfos: getInfos,
            getInstructionSign : getInstructionSign,
            getRouteInformation: getRouteInformation
        };
    }]);
