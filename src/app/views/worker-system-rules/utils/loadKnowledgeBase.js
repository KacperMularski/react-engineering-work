import { getDatabase, ref, get } from 'firebase/database';

const loadKnowledgeBase = async () => {
  const db = getDatabase();
  const knowledgeBaseRef = ref(db, 'knowledgeBaseEngine');
  try {
    const snapshot = await get(knowledgeBaseRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('Brak danych w bazie wiedzy');
      return null;
    }
  } catch (error) {
    console.error('Błąd wczytywania bazy wiedzy: ', error);
    return null;
  }
};

export default loadKnowledgeBase;
