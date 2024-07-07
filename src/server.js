const Hapi = require('@hapi/hapi');
// const routes = require('./routes');
const notes = require('./api/notes');
const NotesService = require('./services/inMemory/NotesService');

const init = async () => {
  // buat instance dari NotesService dengan nama notesService.
  const notesService = new NotesService();


  const server = Hapi.server({
    port: 5000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Setelah plugin notes di daftarkan, kita bisa menghapus penggunaan routes lama
  // server.route(routes);

  // daftarkan plugin notes dengan options.service bernilai notesService menggunakan perintah await server.register
  await server.register({
    plugin: notes,
    options: {
      service: notesService,
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
