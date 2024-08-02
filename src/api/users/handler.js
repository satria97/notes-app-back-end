const autoBind = require('auto-bind');

class UsersHandler {
  constructor(service, validator) {
    // buat constructor yang menerima parameter service dan validator.
    // Kemudian inisialisasikan nilai service dan validator pada properti this._service dan this._validator
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postUserHandler(request, h) {
    // lakukan validasi request.payload atau objek user yang dikirim
    this._validator.validateUserPayload(request.payload);

    // dapatkan nilai properti user yakni username, password, dan fullname dari request.payload.
    const { username, password, fullname } = request.payload;

    // panggil fungsi addUser dari this._service untuk memasukkan user baru
    // Karena fungsi addUser mengembalikan id dari user yang dimasukan, jadi kita bisa mendapatkan userId dari sana
    const userId = await this._service.addUser({ username, password, fullname });

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }

  async getUserByIdHandler(request) {
    // dapatkan nilai id (user) dari request.params
    const { id } = request.params;

    // dapatkan user berdasarkan id tersebut dari database melalui fungsi this._service.getUserById
    const user = await this._service.getUserById(id);

    return {
      status: 'success',
      data: {
        user,
      },
    };
  }

  async getUsersByUsernameHandler(request) {
    const { username = '' } = request.query;
    const users = await this._service.getUsersByUsername(username);
    return {
      status: 'success',
      data: {
        users,
      },
    };
  }
}
module.exports = UsersHandler;
