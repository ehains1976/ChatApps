// Script pour hasher les mots de passe
import bcrypt from 'bcryptjs';

const passwords = {
  'Jai.1.Mcd0': 'BZInc',
  'Jai.du.Beau.Gaz0n': 'VertDure'
};

console.log('Mots de passe hashés:');
console.log('====================');

for (const [password, user] of Object.entries(passwords)) {
  const hash = await bcrypt.hash(password, 10);
  console.log(`\n${user}:\n${hash}`);
}

process.exit(0);

