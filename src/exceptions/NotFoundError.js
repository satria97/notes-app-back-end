const ClientError = require("./ClientError");

class NotFoundError extends ClientError {
    constructor(message) {
        // panggil fungsi super dengan membawa nilai message dan 404 sebagai statusCode; tetapkan this.name dengan nilai “NotFoundError”
        super(message, 404);
        this.name = 'NotFoundError';
    }
}
module.exports = NotFoundError;