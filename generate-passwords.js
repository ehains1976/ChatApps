// Script simple pour générer les hash
import bcrypt from 'bcryptjs';

const hash1 = await bcrypt.hash('Jai.1.Mcd0', 10);
const hash2 = await bcrypt.hash('Jai.du.Beau.Gaz0n', 10);

console.log('bzinc hash:', hash1);
console.log('vertdure hash:', hash2);

