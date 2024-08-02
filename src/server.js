// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('./exceptions/ClientError');

// notes
const notes = require('./api/notes');
// const NotesService = require('./services/inMemory/NotesService');
const NotesValidator = require('./validator/notes');
const NotesService = require('./services/postgres/NotesService');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

const init = async () => {
  // buat instance dari CollaborationsService dengan nama collaborationsService
  // pastikan pembuatan instance CollaborationsService, tepat sebelum pembuatan instance NotesService
  const collaborationsService = new CollaborationsService();

  // buat instance dari NotesService dengan nama notesService.
  const notesService = new NotesService(collaborationsService);

  // buat usersService yang merupakan instance dari UsersService
  const usersService = new UsersService();

  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasikan Jwt sebagai plugin
  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // Setelah plugin notes di daftarkan, kita bisa menghapus penggunaan routes lama
  // server.route(routes);

  // daftarkan plugin notes dengan options.service bernilai notesService menggunakan perintah await server.register
  // await server.register({
  //   plugin: notes,
  //   options: {
  //     service: notesService,
  //     // Sama seperti NotesService, untuk mengirimkan data pada plugin, kita akan manfaatkan objek options.
  //     validator: NotesValidator
  //   },
  // });

  // ubah cara registrasi plugin notes dari objek literals menjadi arrays.
  // agar dapat mendaftarkan lebih dari satu plugin sekaligus.
  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },

    // daftarkan plugin collaborations dengan nilai options notesService, collaborationsService, dan CollaborationValidator
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        notesService,
        validator: CollaborationsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

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
    if (!response.isServer) {
      return h.continue;
    }
    console.log(response);
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
