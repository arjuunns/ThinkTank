import bcrypt from 'bcrypt'
const saltRounds = 4;

export default async function hashPassword(password: string) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }
  