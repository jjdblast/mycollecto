//= require jquery
//= require jquery_ujs
//= require handlebars
//= require ember
//= require ember-data

//= require twitter/bootstrap

//= require_self
//= require mycollecto

//= require_tree .


Mycollecto = Ember.Application.create({
  LOG_ACTIVE_GENERATION: true,
  LOG_VIEW_LOOKUPS: true
});

Mycollecto.deferReadiness(); // Released when We got userCurrentPostion from Mycollecto.MapPoints.setCurrentUserPosition();

jQuery(document).ready(function($) {
  window.map_callback = function() {
    console.log('GM V3 script Loaded');

    Mycollecto.MapPoints.setCurrentUserPosition();
  }
  $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyBOmERV2C7zNuCtm4pSSoMfkGE8Rf-3wNM&libraries=geometry&sensor=true&callback=map_callback');
});
