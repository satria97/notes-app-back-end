class NotesHandler {
	// menerima parameter service
	constructor(service) {
        // buat properti _service dan inisialisasikan nilainya dengan service dari parameter constructor.
        // nama variabel diawali underscore (_) dipertimbangkan sebagai lingkup privat secara konvensi.
        // Parameter service nantinya akan diberikan nilai instance dari NotesService. 
        // Dengan begitu, NotesHandler memiliki akses untuk mengelola resource notes melalui properti this._service.
        this._service = service;

        this.postNoteHandler = this.postNoteHandler.bind(this);
        this.getNotesHandler = this.getNotesHandler.bind(this);
        this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
        this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
        this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
	}

    postNoteHandler(request, h) {
        try {
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
        } catch (error) {
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(400);
            return response;
        }
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
        try {
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
        } catch (error) {
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(404);
            return response;
        }
    }

    putNoteByIdHandler(request, h) {
        try {
            // dapatkan nilai id dari request.params yang digunakan pada path parameter sebagai id dari note.
            const {id} = request.params;
    
            // kita panggil fungsi this._service.editNoteById, kemudian masukkan id sebagai parameter pertama, 
            // dan request.payload yang akan menyediakan title, body, dan tags untuk objek note baru.
            this._service.editNoteById(id, request.payload);
            return {
                status: 'success',
                message: 'Catatan berhasil diperbarui',
            }
        } catch (error) {
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(404);
            return response;
        }
    }

    deleteNoteByIdHandler(request, h) {
        try {
            // dapatkan nilai note id yang dikirim client melalui path parameter
            const {id} = request.params;
            this._service.deleteNoteById(id);
            return {
                status: 'success',
                message: 'Catatan berhasil dihapus',
            }
        } catch (error) {
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(404);
            return response;
        }
    }
}
module.exports = NotesHandler;
