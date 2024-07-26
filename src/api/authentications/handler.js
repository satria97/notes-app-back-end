class AuthenticationsHandler {
  // buat constructor class yg menerima authenticationsService, usersService, tokenManager, dan validator.
  constructor(authenticationsService, usersService, tokenManager, validator) {
    // masukkan masing-masing nilai parameter sebagai private property clas
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
  }

  // fungsi untuk login
  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);

    const { username, password } = request.payload;

    // Gunakan this._usersService.verifyUserCredential untuk memeriksa kredensial yang ada pada request.payload
    // Karena fungsi verifyUserCredential mengembalikan nilai id dari user, maka tampung nilai tersebut pada variabel id
    const id = await this._usersService.verifyUserCredential(username, password);

    // buat access token dan refresh token menggunakan fungsi this._tokenManager.generateAccessToken dan
    // this._tokenManager.generateRefreshToken, dan membawa objek payload yang memiliki properti id user.
    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    // gunakan fungsi this._authenticationsService.addRefreshToken untuk menyimpan refreshToken ke database
    // agar server mengenali refreshToken bila pengguna ingin memperbarui accessToken
    await this._authenticationsService.addRefreshToken(refreshToken);

    // kembalikan request dengan respons yang membawa accessToken dan refreshToken di data body
    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  // fungsi untuk memperbarui access token dengan melampirkan refresh token pada payload request
  async putAuthenticationHandler(request) {
    // pastikan payload request mengandung properti refreshToken yang bernilai string
    this._validator.validatePutAuthenticationPayload(request.payload);

    // dapatkan nilai refreshToken pada request.payload dan verifikasi refreshToken baik dari sisi database maupun signature token
    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    // buat accessToken baru dan melampirkannya sebagai data di body respons
    const accessToken = this._tokenManager.generateAccessToken({ id });
    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  // fungsi untuk menghapus refresh token yang dimiliki pengguna pada database
  async deleteAuthenticationHandler(request) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    // pastikan refreshToken ada di database
    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);

    // hapus dari database
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}
module.exports = AuthenticationsHandler;
