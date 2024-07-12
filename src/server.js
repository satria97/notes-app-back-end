// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const notes = require('./api/notes');
// const NotesService = require('./services/inMemory/NotesService');
const NotesValidator = require('./validator/notes');
const ClientError = require('./exceptions/ClientError');
const NotesService = require('./services/postgres/NotesService');

const init = async () => {
  // buat instance dari NotesService dengan nama notesService.
  const notesService = new NotesService();


  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
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
      // Sama seperti NotesService, untuk mengirimkan data pada plugin, kita akan manfaatkan objek options.
      validator: NotesValidator
    },
  });

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const {response} = request;

    // penanganan client error secara internal
    // Jika error berasal dari instance ClientError, response akan mengembalikan status fail, 
    // status code, dan message sesuai dengan errornya. Jika error bukan ClientError,
    // kembalikan response apa adanya, biarlah Hapi yang menangani response secara default.
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
