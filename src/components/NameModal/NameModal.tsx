import { useRef } from 'react';

import styles from './NameModal.module.css';

export type NameModalReturn = {
  firstName: string;
  lastName: string;
};
type NameModalProps = {
  close: (value: NameModalReturn | null) => void;
};
const NameModal = ({ close }: NameModalProps) => {
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    close({
      firstName: firstNameInputRef.current?.value ?? '',
      lastName: lastNameInputRef.current?.value ?? '',
    });
  };
  const closeModalWithoutSave = () => {
    close(null);
  };

  return (
    <form className={styles.Container} onSubmit={handleSubmit}>
      <div className={styles.Content}>
        <h2>Modal</h2>
        <p>Please enter your name.</p>
        <input
          ref={firstNameInputRef}
          className={styles.Input}
          placeholder="First name"
        />
        <input
          ref={lastNameInputRef}
          className={styles.Input}
          placeholder="Last name"
        />
      </div>
      <div className={styles.Footer}>
        <button className={`${styles.Button} ${styles.Confirm}`} type="submit">
          Confirm
        </button>
        <button
          className={`${styles.Button} ${styles.Cancel}`}
          type="button"
          onClick={closeModalWithoutSave}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default NameModal;
