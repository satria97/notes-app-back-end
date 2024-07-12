const { nanoid } = require("nanoid");
const { Pool } = require("pg");

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
}