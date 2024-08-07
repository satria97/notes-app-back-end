const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDBToModel } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class NotesService {
  // buat constructor dan di dalamnya inisialisasi properti this._pool dengan instance dari package pg.Pool.
  constructor(collaborationService) {
    this._pool = new Pool();

    // tambahkan dependency terhadap CollaborationsService di dalam NotesService.
    this._collaborationService = collaborationService;
  }

  // tambahkan async karena query berjalan secara asynchronous
  // tambahkan properti owner pada parameter objek note.
  async addNote({
    title, body, tags, owner
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    // buat objek query untuk memasukan notes baru ke database
    const query = {
      text: 'INSERT INTO notes values($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt, owner],
    };

    // gunakan fungsi this._pool.query untuk mengeksekusi query
    // fungsi query() berjalan secara asynchronous,
    // dengan begitu kita perlu menambahkan async pada addNote dan await pada pemanggilan query()
    const result = await this._pool.query(query);

    // Untuk memastikan notes berhasil dimasukan ke database, evaluasi nilai dari results.rows[0].id (karena kita melakukan returning id pada query).
    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal di tambahkan');
    }
    return result.rows[0].id;
  }

  //  tambahkan owner sebagai parameter fungsi
  async getNotes(owner) {
    // const result = await this._pool.query('SELECT * FROM notes');

    // mendapatkan catatan yang hanya dimiliki oleh owner saja
    // const query = {
    //   text: 'SELECT * FROM notes WHERE owner = $1',
    //   values: [owner],
    // };

    // gunakan LEFT JOIN karena tabel notes berada di posisi paling kiri (dipanggil pertama kali).
    // Data notes yang dihasilkan berpotensi duplikasi, sehingga GROUP nilainya agar menghilangkan duplikasi yang dilihat berdasarkan notes.id
    const query = {
      text: `SELECT notes.* FROM notes
      LEFT JOIN collaborations ON collaborations.note_id = notes.id
      WHERE notes.owner = $1 OR collaborations.user_id = $1
      GROUP BY notes.id`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModel);
  }

  async getNoteById(id) {
    // lakukan query untuk mendapatkan note di dalam database berdasarkan id yang diberikan.
    // const query = {
    //   text: 'SELECT * FROM notes WHERE id = $1',
    //   values: [id],
    // };

    // mendapatkan username dari pemilik catatan
    const query = {
      text: `SELECT notes.*, users.username
      FROM notes
      LEFT JOIN users ON users.id = notes.owner
      WHERE notes.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    // periksa nilai result.rows, bila nilainya 0 (false) maka bangkitkan NotFoundError. Bila tidak,
    // maka kembalikan dengan result.rows[0] yang sudah di-mapping dengan fungsi mapDBToModel.
    if (!result.rows[0]) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
    return result.rows.map(mapDBToModel)[0];
  }

  async editNoteById(id, { title, body, tags }) {
    const updatedAt = new Date().toISOString();
    // lakukan query untuk mengubah note di dalam database berdasarkan id yang diberikan.
    const query = {
      text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [title, body, tags, updatedAt, id],
    };
    const result = await this._pool.query(query);

    // periksa nilai result.rows bila nilainya 0 (false) maka bangkitkan NotFoundError.
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }
  }

  async deleteNoteById(id) {
    const query = {
      text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
  }

  // memeriksa apakah catatan dengan id yang diminta adalah hak pengguna
  async verifyNoteOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    // bila objek note tidak ditemukan, maka throw NotFoundError
    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
    const note = result.rows[0];

    // lakukan pengecekan kesesuaian owner-nya
    // bila owner tidak sesuai, maka throw AuthorizationError
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  // fungsi verifyNoteAccess mengandalkan fungsi verifyCollaborator yang dimiliki oleh CollaborationsService
  // jadi perlu menambahkan dependency terhadap CollaborationsService di dalam NotesService
  // Fungsi verifyNoteAccess bertujuan untuk memverifikasi hak akses pengguna (userId) terhadap catatan (id), baik sebagai owner maupun collaboration
  async verifyNoteAccess(noteId, userId) {
    try {
      // memanfaatkan fungsi verifyNoteOwner untuk memeriksa hak akses userId terhadap noteId
      // Bila userId tersebut merupakan owner dari noteId maka ia akan lolos verifikasi
      await this.verifyNoteOwner(noteId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        // pemeriksaan hak akses kolaborator, menggunakan fungsi verifyCollaborator
        // Bila pengguna seorang kolaborator, proses verifikasi akan lolos.
        await this._collaborationService.verifyCollaborator(noteId, userId);
      } catch {
        throw error;
      }
    }
  }
}
module.exports = NotesService;
