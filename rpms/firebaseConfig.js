import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC-KzhsOiwgLMoWFFWvWxi-J1BIFvBbMgs",
  authDomain: "rpms-hr.firebaseapp.com",
  databaseURL: "https://rpms-hr-default-rtdb.firebaseio.com",
  projectId: "rpms-hr",
  storageBucket: "rpms-hr.firebasestorage.app",
  messagingSenderId: "575342774385",
  appId: "1:575342774385:web:b0b081b42ddb54b47ff3d0",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default database;
