const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  // Buat properti fungsi generateAccessToken yang menerima satu parameter yakni payload
  // kembalikan fungsi ini dengan JWT token yang dibuat menggunakan fungsi JWT.token.generate() dari package @hapi/jwt
  // generateAccessToken(payload) {
  //   return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY);
  // },

  // Karena kode pada fungsi generateAccessToken hanya satu baris, kita bisa manfaatkan arrow function agar kodenya lebih singkat
  generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};
module.exports = TokenManager;
