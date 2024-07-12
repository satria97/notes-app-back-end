const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const { mapDBToModel } = require("../../utils");
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError');

class NotesService {
    // buat constructor dan di dalamnya inisialisasi properti this._pool dengan instance dari package pg.Pool.
    constructor() {
        this._pool = new Pool();
    }

    // tambahkan async karena query berjalan secara asynchronous
    async addNote({title, body, tags}) {
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        // buat objek query untuk memasukan notes baru ke database
        const query = {
            text: 'INSERT INTO notes values($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, title, body, tags, createdAt, updatedAt],
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

    async getNotes() {
        const result = await this._pool.query('SELECT * FROM notes');
        return result.rows.map(mapDBToModel);
    }

    async getNoteById(id) {
        // lakukan query untuk mendapatkan note di dalam database berdasarkan id yang diberikan.
        const query = {
            text: 'SELECT FROM notes WHERE id = $1',
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
}