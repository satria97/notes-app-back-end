const InvariantError = require("../../exceptions/InvariantError");
const { NotePayloadSchema } = require("./schema")

const NotesValidator = {
    // untuk melakukan validasi dan mengevaluasi apakah validasi itu berhasil atau tidak.
    validateNotePayload: (payload) => {
        const validationResult = NotePayloadSchema.validate(payload);
        // evaluasi validationResult. Jika properti error tidak undefined, maka kita bangkitkan error 
        // dengan membawa pesan dari properti validationResult.error.message.
        if (validationResult.error) {
            // throw new Error(validationResult.error.message);
            // Lalu ubahlah menjadi seperti ini:
            throw new InvariantError(validationResult.error.message);
        }
    }
}
module.exports = NotesValidator;