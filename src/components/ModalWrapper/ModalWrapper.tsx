import ModalPortal from '@src/portals/ModalPortal';

import styles from './ModalWrapper.module.css';

type ModalWrapperProps = {
  children?: React.ReactNode;
  close: () => void;
};

const ModalWrapper = ({ children, close }: ModalWrapperProps) => {
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
