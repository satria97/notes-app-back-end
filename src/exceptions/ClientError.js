// buat class ClientError yang mewarisi Error dan buat constructor yang menerima dua parameter message
// dan code. Untuk parameter code, beri nilai default 400.
class ClientError extends Error {
  constructor(message, statusCode = 400) {
    // panggil fungsi super dengan membawa nilai message; inisialisasi nilai code pada this.statusCode;
    // tetapkan this.name dengan nilai “ClientError”; dan ekspor ClientError agar dapat digunakan oleh berkas lain.
    super(message);
    this.statusCode = statusCode;
    this.name = 'ClientError';
  }
}
module.exports = ClientError;
