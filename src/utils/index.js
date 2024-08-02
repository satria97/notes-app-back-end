/* eslint-disable camelcase */
// buat fungsi bernama mapDBToModel dan menerima parameter note objek dari database
const mapDBToModel = ({
  id, title, body, tags, created_at, updated_at, username
}) => ({
  // kembalikan fungsi mapDBToModel dengan objek note baru yang nama propertinya sudah disesuaikan/perbaiki
  id, title, body, tags, createdAt: created_at, updatedAt: updated_at, username
});
module.exports = { mapDBToModel };
