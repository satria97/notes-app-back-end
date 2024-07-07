class NotesHandler {
	// menerima parameter service
	constructor(service) {
        // buat properti _service dan inisialisasikan nilainya dengan service dari parameter constructor.
        // nama variabel diawali underscore (_) dipertimbangkan sebagai lingkup privat secara konvensi.
        // Parameter service nantinya akan diberikan nilai instance dari NotesService. 
        // Dengan begitu, NotesHandler memiliki akses untuk mengelola resource notes melalui properti this._service.
        this._service = service;
	}

    postNoteHandler(request) {
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
}
