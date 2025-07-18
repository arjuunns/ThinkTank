import jwt from 'jsonwebtoken'
const secret = "sadljsaf"
export default async function generateToken(email: string) {
    const token = await jwt.sign({ email }, secret, {
      algorithm: "HS256",
      expiresIn: "7d",
    });
    return token;
  }