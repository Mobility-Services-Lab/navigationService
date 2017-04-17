# navigationService
This is an open source navigation app based on OpenStreetMap developed with the Ionic Framework.
The application has been developed for iOS and Android but should also work with Windows Phone.
The applikation has the following features:
- OpenStreetMap
- Address search
- Turn by turn navigation (calculated by GraphHopper)
- Distance and length of route
- Routing
- Recalculating of routes
## Init
To init the project check out the git project:

`git checkout https://github.com/Mobility-Services-Lab/navigationService.git`

Now go to navigationService/www/js/app.js and insert your GraphHopper key into: $scope.graphhopperkey = 'YOUR_KEY'
The project is now ready to be built
## Build project android
To build the android platform you need to run the following command:

`ionic platform add android`

Then build the android package:

`ionic build android`

Now you can run the project:

`ionic run android`
## Build project iOS
To build the ios platform run the following command with the Ionic Framework:

`ionic platform add ios`
Then build the iOS package:

`ionic build ios`
There is one thing you need to change in the iOS project, because there is set default distance filter of 5 meter. The problem with that is, that we don't get new locations unless the user moves be more than 5 meters. However if the user is waiting at a red traffic signal we get a timeout and to avoid that you need to do the following:

Go into the XCode-Project in /platforms/ios/. 
With the project opened search for the "CDVLocation.m" file. 
This file has a method called "(void) startLocation:(BOOL)highAccuracy". Look for the if-case "if(enabledHighAccuracy)" and set the "self.location.distanceFilter = 5;" to "self.location.distanceFilter = kCLDistanceFilterNone;"
