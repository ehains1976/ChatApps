// Script pour générer les hash bcrypt des mots de passe admin
import bcrypt from 'bcryptjs';

async function generateHashes() {
  const passwords = [
    { email: 'bzinc@bzinc.ca', password: 'Jai.1.Mcd0' },
    { email: 'vertdure@vertdure.com', password: 'Jai.du.Beau.Gaz0n' }
  ];

  for (const pwd of passwords) {
    const hash = await bcrypt.hash(pwd.password, 10);
    console.log(`${pwd.email}: ${hash}`);
  }
}

generateHashes();

