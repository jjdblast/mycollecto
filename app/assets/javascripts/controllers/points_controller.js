
Mycollecto.PointsController = Em.ArrayController.extend({
  sortProperties: ['distanceFromUser'],
  sortDescending: true,
  currentUserPosition: Ember.Object.create(),
  map: null,
  mapMarkers: [],
  panelVisible: true,
  handleOpen: false,
  mapLoaded: false,

  initMap: function(){

    var controller          = this;
    var currentUserPosition = controller.get('currentUserPosition');
    var map                 = L.mapbox.map('map');
    var mapTiles            = 'borisrorsvort.map-yz4prbd9';
    var mapRetinaTiles      = 'borisrorsvort.map-frkowyyy';
    var layer               = L.mapbox.tileLayer(mapTiles, {maxZoom: 16, detectRetina: true, retinaVersion: mapRetinaTiles, reuseTiles: true, updateWhenIdle: true }).addTo(map);

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    controller.set("map", map);

    function onLocationFound(e) {

      var myIcon = L.divIcon({
        html: '<i class="icon-user"/>',
        className: 'marker-custom marker-custom-user'
      });

      var user = L.marker(e.latlng, {
        icon: myIcon
      }).addTo(map);

      currentUserPosition.set('latLng', e.latlng);
      currentUserPosition.set('latitude', e.latlng.lat);
      currentUserPosition.set('longitude', e.latlng.lng);

      map.setView( e.latlng, 17, {animate: true} );
      Mycollecto.Point.find({latitude: e.latlng.lat, longitude: e.latlng.lng, size: 20}).then(function(points){
        controller.set('content', points);
        controller.transitionToRoute('point', points.objectAt(0));
      });
      
    }

    function onLocationError(e) {
      console.log("Location error");
      controller.set('content', Mycollecto.Point.find());
    }

    map.locate({maximumAge: 2000});
  },


  invalidateMapSize: function() {
    var controller = this;
    setTimeout(function() {
      controller.map.invalidateSize(true);
    }, 150);
  }.observes('mapLoaded'),


  createMarkers: function() {

    var controller = this;
    var map = controller.get('map');

    controller.get("model").forEach(function(point){
      var pointId = point.get('id');

      var myIcon = L.divIcon({
        html: pointId,
        className: 'marker-custom'
      });

      var marker = L.marker(new L.LatLng(point.get("latitude"), point.get("longitude")), {
        id: pointId,
        icon: myIcon
      });

      var name = point.get("nameFr")
      popupHtml = "<a href='/#/"+pointId+"'>"+name+"</a><a href='/#/"+pointId+"'><i class='icon-circled-right' style:'margin-left: 10px'/></a>"

      marker.bindPopup(popupHtml, {closeButton: false}).addTo(map);

      // Adding click action to marker
      marker.on('click', function() {
        window.location = '/#/' + pointId;
        mixpanel.track("View point details", {'via' : 'map'});
        mixpanel.people.increment("point lookup", 1);
      });

      controller.mapMarkers.push(marker);
    });

  }.observes('content.isLoaded'),

  showDetails: function(point) {
    mixpanel.track("View point details", {'via' : 'list'});
    mixpanel.people.increment("point lookup", 1);
    this.transitionToRoute('point', point);
  },

  centerMap: function(model) {
    var controller = this;

    var x          = model.get('latitude');
    var y          = model.get('longitude');
    var pos        = new L.LatLng(x,y);
    controller.map.panTo(pos);
    controller.animateMarker(model.get('id'));
  },

  animateMarker: function(id) {
    var controller = this;

    markers = $.grep(controller.mapMarkers, function(n, i){
      return n.options.id == id;
    });

    // Reset all icons
    // TODO add promises
    $.each(controller.mapMarkers, function(index, val) {
      this.closePopup();
    });
    // Set Current current point new icon
    $.each(markers, function(index, val) {
      this.openPopup();
    });
  }

});
