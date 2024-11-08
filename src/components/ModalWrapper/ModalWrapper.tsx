import ModalPortal from '@src/portals/ModalPortal';
import { useEffect } from 'react';

import styles from './ModalWrapper.module.css';

type ModalWrapperProps = {
  children?: React.ReactNode;
  close: () => void;
};

const ModalWrapper = ({ children, close }: ModalWrapperProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [close]);

  return (
    <ModalPortal>
      <div
        className={styles.Backdrop}
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {children}
        </div>
      </div>
    </ModalPortal>
  );
};

export default ModalWrapper;
