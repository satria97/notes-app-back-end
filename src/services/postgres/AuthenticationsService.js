const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class AuthenticationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addRefreshToken(token) {
    // lakukan kueri untuk memasukkan token (parameter) ke dalam tabel authentications
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };

    await this._pool.query(query);
  }

  async verifyRefreshToken(token) {
    // lakukan kueri mendapatkan refresh token berdasarkan token yang dibawa oleh parameter.
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this._pool.query(query);

    // Cek nilai result.rows.length, jika nilainya kurang dari 1 berarti token yang diverifikasi tidak valid,
    // karena ia tidak ditemukan di database
    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };

    await this._pool.query(query);
  }
}
module.exports = AuthenticationsService;
