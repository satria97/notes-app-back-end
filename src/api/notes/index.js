const NotesHandler = require("./handler");
const routes = require("./routes");

// buatlah sebuah objek plugin pada module.exports.
module.exports = {
    // Beri properti name dengan notes, properti version dengan nilai ‘1.0.0’, 
    // dan fungsi register dengan fungsi yang memiliki dua parameter. 
    // Dua parameter fungsi ini adalah server dan objek options yang menampung service.
    name: 'notes',
    version: '1.0.0',
    register: async (server, {service}) => {
        // buat instance dari class NotesHandler dengan nama notesHandler. 
        // Kemudian nilai service sebagai pada constructor-nya. 
        const notesHandler = new NotesHandler(service);

        // daftarkan routes yang sudah kita buat pada server Hapi
        // dengan memanggil fungsi routes di dalam method server.route dan berikan notesHandler sebagai nilai handler-nya
        server.route(routes(notesHandler));
    }
}