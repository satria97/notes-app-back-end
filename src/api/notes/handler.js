const ClientError = require("../../exceptions/ClientError");

class NotesHandler {
	// menerima parameter service
	constructor(service, validator) {
        // buat properti _service dan inisialisasikan nilainya dengan service dari parameter constructor.
        // nama variabel diawali underscore (_) dipertimbangkan sebagai lingkup privat secara konvensi.
        // Parameter service nantinya akan diberikan nilai instance dari NotesService. 
        // Dengan begitu, NotesHandler memiliki akses untuk mengelola resource notes melalui properti this._service.
        this._service = service;

        // tambahkan validator di parameter constructor serta inisialisasi nilainya sebagai properti this._validator.
        // Dengan demikian, sekarang kita bisa mengakses fungsi validateNotePayload melalui this._validator.
        this._validator = validator;

        this.postNoteHandler = this.postNoteHandler.bind(this);
        this.getNotesHandler = this.getNotesHandler.bind(this);
        this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
        this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
        this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
	}

    postNoteHandler(request, h) {
        // gunakan validateNotePayload di dalam postNoteHandler karena pada fungsi tersebut 
        // kita mendapatkan data dari pengguna dalam bentuk payload.
        this._validator.validateNotePayload(request.payload);
        const {title = 'untitled', body, tags} = request.payload;

        // untuk proses memasukan catatan baru, cukup panggil fungsi this._service.addNote
        // this._service.addNote({title, body, tags});

        // Karena fungsi this._service.addNote akan mengembalikan id catatan yang disimpan, 
        // maka buatlah variabel noteId untuk menampung nilainya
        const noteId = this._service.addNote({title, body, tags})

        const response = h.response({
            status: 'success',
            message: 'Catatan berhasil ditambahkan',
            data: {
              noteId,
            },
        });
        response.code(201);
        return response;
    }

    getNotesHandler() {
        const notes = this._service.getNotes();
        return {
            status: 'success',
            data: {
                notes,
            },
        }
    }

    getNoteByIdHandler(request, h) {
        // dapatkan nilai id note yang dikirim client melalui path parameter
        const {id} = request.params;
    
        // panggil fungsi this._service.getNoteById untuk mendapatkan objek note sesuai id yang diberikan client.
        const note = this._service.getNoteById(id);
        return {
            status: 'success',
            data: {
                note,
            },
        }
    }

    putNoteByIdHandler(request, h) {
        // gunakan validateNotePayload di dalam putNoteHandler karena pada fungsi tersebut 
        // kita mendapatkan data dari pengguna dalam bentuk payload.
        // Pastikan Anda memanggilnya sebelum mengonsumsi nilai dari request.payload itu sendiri. 
        // Bila salah peletakan, bisa-bisa data yang buruk tetap diproses. 
        // Apalagi bila Anda memanggil setelah aksi menyimpan atau mengubah note.
        this._validator.validateNotePayload(request.payload);

        // dapatkan nilai id dari request.params yang digunakan pada path parameter sebagai id dari note.
        const {id} = request.params;
    
        // kita panggil fungsi this._service.editNoteById, kemudian masukkan id sebagai parameter pertama, 
        // dan request.payload yang akan menyediakan title, body, dan tags untuk objek note baru.
        this._service.editNoteById(id, request.payload);
        return {
            status: 'success',
            message: 'Catatan berhasil diperbarui',
        }
    }

    deleteNoteByIdHandler(request, h) {
        const {id} = request.params;
        this._service.deleteNoteById(id);
        return {
            status: 'success',
            message: 'Catatan berhasil dihapus',
        }
    }
}
module.exports = NotesHandler;
