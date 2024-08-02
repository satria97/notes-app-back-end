const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.postCollaborationHandler,
    // berikan options.auth dengan nilai notesapp_jwt karna dibutuhkan informasi pengguna autentik
    // untuk menentukan resource dapat diakses atau tidak
    options: {
      auth: 'notesapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollaborationHandler,
    options: {
      auth: 'notesapp_jwt',
    },
  },
];

module.exports = routes;
