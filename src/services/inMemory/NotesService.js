const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class NotesService {
	constructor() {
		this._notes = [];
	}

	addNote({ title, body, tags }) {
		const id = nanoid(16);
		const createdAt = new Date().toISOString();
		const updatedAt = createdAt;

		const newNote = {
			title, body, tags, id, createdAt, updatedAt
		};

		// masukan nilai-nilai tersebut ke dalam array notes menggunakan method push()
		this._notes.push(newNote);

		// memastikan newNote masuk ke dalam this._notes, cek by id
		const isSuccess = this._notes.filter((note) => note.id === id).length > 0;

		// cek variabel isSuccess
		if (!isSuccess) {
			// throw new Error('Catatan gagal ditambahkan');
			// Lalu ubah menjadi seperti ini:
			throw new InvariantError('Catatan gagal ditambahkan');
		}

		return id;
	}

	getNotes() {
		return this._notes;
	}

	getNoteById(id) {
		// gunakan fungsi filter utk mendapatkan note by id
		const note = this._notes.filter((n) => n.id === id)[0];

		// cek variabel note
		if (!note) {
			// throw new Error('Catatan tidak ditemukan');
			// Ubahlah menjadi seperti ini:
			throw new NotFoundError('Catatan tidak ditemukan');
		}

		return note;
	}

	// Fungsi ini menerima dua parameter yakni id dan data note terbaru dalam bentuk objek
	// (payload yang akan diambil sebagian field yaitu title, body, tags).
	editNoteById(id, { title, body, tags }) {
		const index = this._notes.findIndex((note) => note.id === id);

		if (index === -1) {
			// throw new Error('Gagal memperbarui catatan. Id tidak ditemukan');
			// ubah menjadi seperti ini: 
			throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
		}

		const updatedAt = new Date().toISOString();

		this._notes[index] = {
			...this._notes[index], title, tags, body, updatedAt
		};
	}

	deleteNoteById(id) {
		const index = this._notes.findIndex((note) => note.id === id);

		if (index === -1) {
			// throw new Error('Catatan gagal dihapus. Id tidak ditemukan');
			// Ubahlah menjadi seperti ini:
			throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
		}

		this._notes.splice(index, 1);
	}
}

module.exports = NotesService;
