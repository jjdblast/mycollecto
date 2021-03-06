import Ember from 'ember';

export default Ember.Component.extend({
  location: Ember.inject.service(),
  mapPosition: Ember.computed.alias('location.mapPosition'),
  userPosition: Ember.computed.alias('location.userPosition'),
  hasUserLocation: Ember.computed.notEmpty('location.userPosition.lat'),
  userCustomIconHtml: '<md-icon class="paper-icon md-font material-icons md-primary md-default-theme person-pin md-4x" aria-label="person-pin"></md-icon>',
  markerCustomIconHtml: '<md-icon class="paper-icon md-font material-icons md-default-theme location-on md-4x" aria-label="location-on"></md-icon>',
  customIcon: {
    iconSize: [48, 48],
    iconAnchor: [0, 48],
    popupAnchor: [24, -48]
  },
  actions: {
    updateMapPosition (e) {
      console.log('updateMapPosition');
      const {lat, lng} = e.target.getCenter(),
            zoom = e.target.getZoom();

      this.get('location.mapPosition').setProperties({
        lat: lat,
        lng: lng,
        zoom: zoom
      });
    },

    updatePositions (e) {
      this.get('mixpanel').trackEvent('Cliked geolocation');
      var {lat, lng} = e.latlng;
      this.get('location.userPosition').setProperties({ lat: lat, lng: lng });
    },

    centerMap (e) {
      var {lat, lng} = e.target.getLatLng();
      this.get('location.mapPosition').setProperties({ lat: lat, lng: lng });
    }
  }
});
