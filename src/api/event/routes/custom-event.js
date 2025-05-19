module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/events/me',
      handler: 'event.me',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'PUT',
      path: '/events/:documentId',
      handler: 'event.update',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'DELETE',
      path: '/events/:documentId',
      handler: 'event.delete',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
  ],
};
