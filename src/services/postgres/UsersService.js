const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  // buat fungsi asynchronous baru bernama addUser yang menerima parameter objek user (username, password, fullname).
  async addUser({ username, password, fullname }) {
    // TODO: Verifikasi username, pastikan belum terdaftar.
    await this.verifyNewUsername(username);

    // TODO: Bila verifikasi lolos, maka masukkan user baru ke database.
    const id = `user-${nanoid(16)}`;
    // bcrypt.hash menerima dua parameter, yakni data dan saltRounds.
    // Parameter data merupakan nilai yang ingin di-hash yaitu password yang diberikan oleh client
    // Sedangkan parameter saltRounds merupakan sebuah angka yang menciptakan nilai string yang tidak dapat diprediksi. Nilai 10 merupakan standar dari saltRounds.
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('User gagal ditambahkan');
    }
    // id dibutuhkan pada proses pengujian untuk mengisi nilai variabel currentUserId
    return result.rows[0].id;
  }

  // untuk memeriksa apakah username sudah digunakan atau belum
  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };
    const result = await this._pool.query(query);
    // Jika result.rows.length menghasilkan nilai lebih dari 0, itu berarti username sudah ada di database
    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }
  }

  async getUserById(userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0];
  }
}
module.exports = UsersService;
