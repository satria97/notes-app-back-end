const ClientError = require('./ClientError');

// Buat class dengan nama InvariantError yang mewarisi class ClientError dan buat constructor yang menerima satu parameter bernama message.
class InvariantError extends ClientError {
  // Karena InvariantError memiliki status code 400, maka kita tidak perlu menetapkan status code di sini.
  // Sebab secara default, turunan ClientError akan memiliki nilai status code 400.
  constructor(message) {
    // panggil fungsi super dengan membawa nilai message dan tetapkan this.name dengan nilai “InvariantError”.
    super(message);
    this.name = 'InvariantError';
  }
}
module.exports = InvariantError;
