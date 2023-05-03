import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as readline from 'readline';

const FILE = '.env';
const BYTES = 32;
const JWT_TOKEN_EXPIRATION = '900s';
const REFRESH_JWT_EXPIRATION = '7d';

const generateSecret = () => crypto.randomBytes(BYTES).toString('hex');

const CONTENT = `# URI MONGO
MONGODB_URI=
# SECRETS
JWT_SECRET=${generateSecret()}
REFRESH_JWT_SECRET=${generateSecret()}
# EXPIRATIONS
JWT_TOKEN_EXPIRATION=${JWT_TOKEN_EXPIRATION}
REFRESH_JWT_EXPIRATION=${REFRESH_JWT_EXPIRATION}
`;

const deleteFile = async (file) => {
  console.log(`\nSuppression du fichier ${file}`);
  try {
    await fs.unlink(file);
    console.log(`Le fichier ${file} a été supprimé`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`Le fichier ${file} n'existe pas\n`);
    } else {
      throw error;
    }
  }
};

const createFile = async (filename, content) => {
  console.log(`Création du fichier ${filename}`);
  try {
    await fs.writeFile(filename, content);
    console.log(`Le fichier ${filename} a été créé avec succès\n`);
  } catch (error) {
    throw error;
  }
};

const confirmAction = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '\nÊtes-vous sûr de vouloir reconstruire votre .env et générer de nouveaux secrets ? (y/n) ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y');
      },
    );
  });
};

const init = async () => {
  const confirmation = await confirmAction();
  if (!confirmation) {
    return;
  }
  await deleteFile(FILE);
  await createFile(FILE, CONTENT);
  console.log(
    '\x1b[32m%s\x1b[0m',
    "Le fichier .env est prêt, vous n'avez plus qu'à mettre votre URI Mongo DB !\n",
  );
};

init();
