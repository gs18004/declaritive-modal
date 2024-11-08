import NameModal, {
  NameModalReturn,
} from '@src/components/NameModal/NameModal';
import useModal from '@src/hooks/useModal';
import { useState } from 'react';

import styles from './App.module.css';
function App() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const { ModalWrapper, openModal, closeModal } = useModal<NameModalReturn>();
  const handleOpenModal = async () => {
    const value = await openModal();
    if (value) {
      setFirstName(value.firstName);
      setLastName(value.lastName);
    }
  };
  return (
    <div className={styles.Container}>
      <ModalWrapper>
        <NameModal close={closeModal} />
      </ModalWrapper>
      <button className={styles.OpenButton} onClick={handleOpenModal}>
        Open
      </button>
      <h3>
        First name: {firstName}
        <br />
        Last name: {lastName}
      </h3>
    </div>
  );
}

export default App;
