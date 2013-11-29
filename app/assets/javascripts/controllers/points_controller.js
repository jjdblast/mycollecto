Mycollecto.PointsController = Em.ArrayController.extend({
  userPosition: Ember.Object.create(),
  targetPosition: Ember.Object.create(),

  sortProperties: ['distanceFromUser'],
  sortDescending: true,
  mapMarkers: [],
  mapCreated: null,
  needs: ['point'],
  actions:{
    findNewAddressPosition: function(customAddress){
     controller = this;
     if (customAddress.indexOf("Brussels") === -1 && customAddress.indexOf("Bruxelles")){customAddress += " Bruxelles"};
     if (customAddress.indexOf("Belgie") === -1 && customAddress.indexOf("Belgique")){customAddress += " Belgique"}
     
     if (this.get('oldCustomAddress') !== customAddress) {
       this.set('oldCustomAddress', customAddress);
       $('#map').spin();
       $.ajax({
         url: 'http://nominatim.openstreetmap.org/search',
         type: 'GET',
         dataType: 'json',
         data: {
           format: 'json',
           q: customAddress
         }
       }).then(
       // success
       function(data) {
         if (data.length > 0) {
           var placeLat = data[0].lat;
           var placeLong = data[0].lon;
           var newlatlng = new L.LatLng(placeLat, placeLong);

           // Update user Position
           controller.get("userPosition").setProperties({
             latLng: newlatlng,
             latitude: placeLat,
             longitude: placeLong
           });
           
           controller.userLocated(true);
           
           $('.searchbar .btn').first().toggleClass('hidden');
           $('.searchbar input').first().val('').toggleClass('hidden').blur();
           mixpanel.track("Search: Address found");

         } else {
           mixpanel.track("Search: Couldn find address");
           alert('We could not find the location');
         }
       },
       // fail
       function(argument) {
         alert('Failed to locate the place');
         mixpanel.track("Search: Failed to locate the place");
       });
     }
    }
  },  


  init: function() {
    controller = this;
    mixpanel.track("View point details", {'via' : 'app init'});

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {controller.onLocationFound(position)}, function(position) {controller.onLocationNotFound(position)});
    } else {
      controller.onLocationNotFound();
    }
  },

  onLocationFound: function (position) {
    //$('body').spin({top: '50%'});
    this.get('userPosition').setProperties({
      latLng: new L.LatLng(position.coords.latitude, position.coords.longitude),
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });

    // Set props only then fire event
    this.userLocated();
  },

  onLocationNotFound: function () {
   // $('body').spin({top: '50%'});
    this.get('userPosition').setProperties({
      latLng: new L.LatLng(50.850539, 4.351745),
      latitude: 50.850539,
      longitude: 4.351745
    });

    console.log('Location Not found');
    // Set props only then fire event
    this.set('geoLocationDone', true);
    console.log(this.get('geoLocationDone'));
    this.userLocated();
  },

  
  userLocated: function(){
    controller = this;
    var userPosition = this.get('userPosition');
    Mycollecto.Point.find({latitude: userPosition.get('latitude'), longitude: userPosition.get('longitude'), size: 50}).then(function(points){
      // Feed the content prop with the points
      controller.set('model', points);
      //do not redirect if we are on a point page
      if(controller.get('controllers.point.model') === null){
        controller.transitionToRoute('point', controller.get("content").objectAt(0));
      }
    });
    
  }
});
