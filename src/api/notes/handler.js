const autoBind = require('auto-bind');

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

    autoBind(this);
    // this.postNoteHandler = this.postNoteHandler.bind(this);
    // this.getNotesHandler = this.getNotesHandler.bind(this);
    // this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
    // this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
    // this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
  }

  // Karena operasi CRUD dari NotesService kini berjalan secara asynchronous,
  // maka kita perlu perlu menerapkan asynchronous pada fungsi handler
  async postNoteHandler(request, h) {
    // gunakan validateNotePayload di dalam postNoteHandler karena pada fungsi tersebut
    // kita mendapatkan data dari pengguna dalam bentuk payload.
    this._validator.validateNotePayload(request.payload);
    const { title = 'untitled', body, tags } = request.payload;

    // dapatkan nilai user id alias credentialId dari request.auth.credentials
    const { id: credentialId } = request.auth.credentials;

    // untuk proses memasukan catatan baru, cukup panggil fungsi this._service.addNote
    // this._service.addNote({title, body, tags});

    // Karena fungsi this._service.addNote akan mengembalikan id catatan yang disimpan,
    // maka buatlah variabel noteId untuk menampung nilainya
    // const noteId = this._service.addNote({title, body, tags})
    // const noteId = await this._service.addNote({ title, body, tags });

    // gunakan credentialId sebagai properti owner pada objek note ketika memanggil fungsi addNote
    const noteId = await this._service.addNote({
      title, body, tags, owner: credentialId,
    });

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

  async getNotesHandler(request) {
    // dapatkan nilai user id alias credentialId dari request.auth.credentials
    const { id: credentialId } = request.auth.credentials;
    const notes = await this._service.getNotes(credentialId);

    // const notes = await this._service.getNotes();
    return {
      status: 'success',
      data: {
        notes,
      },
    };
  }

  async getNoteByIdHandler(request) {
    // dapatkan nilai id note yang dikirim client melalui path parameter
    const { id } = request.params;

    // dapatkan nilai credentialId dan panggil fungsi verifyNoteOwner dengan memberikan nilai id dan credentialId
    // Panggil fungsi verifyNoteOwner sebelum pemanggilan fungsi getNoteById
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyNoteOwner(id, credentialId);

    // panggil fungsi this._service.getNoteById untuk mendapatkan objek note sesuai id yang diberikan client.
    const note = await this._service.getNoteById(id);
    return {
      status: 'success',
      data: {
        note,
      },
    };
  }

  async putNoteByIdHandler(request) {
    // gunakan validateNotePayload di dalam putNoteHandler karena pada fungsi tersebut
    // kita mendapatkan data dari pengguna dalam bentuk payload.
    // Pastikan Anda memanggilnya sebelum mengonsumsi nilai dari request.payload itu sendiri.
    // Bila salah peletakan, bisa-bisa data yang buruk tetap diproses.
    // Apalagi bila Anda memanggil setelah aksi menyimpan atau mengubah note.
    this._validator.validateNotePayload(request.payload);

    // dapatkan nilai id dari request.params yang digunakan pada path parameter sebagai id dari note.
    const { id } = request.params;

    // dapatkan nilai credentialId dan panggil fungsi verifyNoteOwner dengan memberikan nilai id dan credentialId
    // Panggil fungsi verifyNoteOwner sebelum pemanggilan fungsi getNoteById
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyNoteOwner(id, credentialId);

    // kita panggil fungsi this._service.editNoteById, kemudian masukkan id sebagai parameter pertama,
    // dan request.payload yang akan menyediakan title, body, dan tags untuk objek note baru.
    await this._service.editNoteById(id, request.payload);
    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    };
  }

  async deleteNoteByIdHandler(request) {
    const { id } = request.params;

    // dapatkan nilai credentialId dan panggil fungsi verifyNoteOwner dengan memberikan nilai id dan credentialId
    // Panggil fungsi verifyNoteOwner sebelum pemanggilan fungsi getNoteById
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyNoteOwner(id, credentialId);

    await this._service.deleteNoteById(id);
    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }
}
module.exports = NotesHandler;
