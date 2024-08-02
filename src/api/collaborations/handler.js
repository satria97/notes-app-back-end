const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, notesService, validator) {
    // masukkan masing-masing nilai parameter sebagai private property class
    this._collaborationsService = collaborationsService;
    this._notesService = notesService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    // validasi request.payload
    this._validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { noteId, userId } = request.payload;

    // pengguna yang mengajukan permintaan haruslah owner dari catatan tersebut
    // verifikasi request.auth.credentials.id dan noteId yang berada di request.payload
    await this._notesService.verifyNoteOwner(noteId, credentialId);

    // panggil fungsi this._collaborationsService.addCollaboration dengan membawa nilai noteId dan userId
    // Karena fungsi addCollaboration mengembalikan collaboration id yang dimasukkan, maka tampung nilainya pada variabel collaborationId
    const collaborationId = await this._collaborationsService.addCollaboration(noteId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { noteId, userId } = request.payload;

    await this._notesService.verifyNoteOwner(noteId, credentialId);
    await this._collaborationsService.deleteCollaboration(noteId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
