import Ember from 'ember';

export default Ember.Controller.extend({
  location: Ember.inject.service(),
  loading: Ember.computed.bool('location.loading')
});
