'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::event.event', {
  config: {
    'get /events/me': {
      controller: 'event.me',
      policies: ['global::is-authenticated'],
    },
    'put /events/:documentId': {
      controller: 'event.update',
      policies: ['global::is-authenticated'], // instead of auth: true, use policies for auth
    },
    'delete /events/:documentId': {
      controller: 'event.delete',
      policies: ['global::is-authenticated'], // instead of auth: true, use policies for auth
    },
  },
});
