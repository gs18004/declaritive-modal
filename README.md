[Velog](https://velog.io/@gs18004/보다-선언적으로-모달-관리하기)

프론트엔드 개발에 있어 모달은 빼놓을 수 없는 요소이다. 오늘은 모달을 보다 선언적으로 관리하는 방법에 대해 다루어보고자 한다.

모달을 관리하는 방법은 매우 많은데, 가장 간단한 방식은 모달을 사용하는 곳마다 상태를 선언하는 것이다.

다음과 같이 말이다.

```tsx
import { useState } from 'react';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <div>
      {isModalOpen ? <div>This is a modal</div> : null}
      <button onClick={openModal}>Open modal</button>
    </div>
  );
};
```

직관적이다. 하지만, 모달이 100개 있다면 어떨까? 항상 `isModalOpen` 상태를 만들고, `openModal`과 `closeModal` 함수를 만들어줘야 한다. 이러한 방식은 쓸데없는 중복 코드만 늘릴 뿐이고, 결국 유지보수가 어려워진다. 어떻게 하면 더 효과적으로 관리할 수 있을까?

우리에게는 커스텀 훅이 있다. `useModal`이라는 커스텀 훅을 하나 만들어보자.

```tsx
import { useState } from 'react';

const useModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  return {
    ModalWrapper: ({ children }: { children: React.ReactNode }) =>
      isModalOpen ? (
        <ModalWrapper close={closeModal}>{children}</ModalWrapper>
      ) : null,
    openModal,
    closeModal,
  };
};
export default useModal;
```

여기서 `ModalWrapper`는 Portal을 이용하여 최상단으로 모달 레이어를 올려주고, 모달 배경을 설정해주는 컴포넌트이다. 이 때, `close` 함수를 prop으로 받아 모달 배경을 클릭했을 때 모달을 닫아주는 역할을 하게 한다.

```tsx
// ModalWrapper.tsx

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
```

잠깐 `ModalPortal`을 보고 가자면, 다음과 같다. `createPortal`로 Portal을 만들어주고 있다. 이 Portal을 사용하기 위해서는 `index.html`의 body에 `<div id="modal"></div>`를 추가해야 한다.

```tsx
// ModalPortal.tsx

import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

type ModalPortalProps = {
  children: React.ReactNode;
};

export default function ModalPortal({
  children,
}: ModalPortalProps): React.ReactPortal | null {
  const [el, setEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element = document.getElementById('modal');
    let created = false;

    if (!element) {
      element = document.createElement('div');
      element.id = 'modal';
      document.body.appendChild(element);
      created = true;
    }

    setEl(element);

    return () => {
      if (created && element) {
        document.body.removeChild(element);
      }
    };
  }, []);

  if (!el) return null;
  return ReactDOM.createPortal(children, el);
}
```

다시 `useModal`로 돌아가, 이를 어떻게 사용하면 될까?

아래와 같이 간단하게 사용할 수 있다.

```tsx
import useModal from '@src/hooks/useModal';

const App = () => {
  const { ModalWrapper, openModal, closeModal } = useModal();
  return (
    <div>
      <ModalWrapper>
        <SampleModal close={closeModal} />
      </ModalWrapper>
      <button onClick={openModal}>Open modal</button>
    </div>
  );
};

export default App;
```

중복이 줄었고, 코드가 많이 깔끔해졌다. 하지만, 이렇게 끝낼 거라면 글을 쓰지 않았을 것이다.

우리가 만들 모달은 다음과 같이 생겼다.

모달을 열면 input에 이름을 입력한 뒤 Confirm을 누르면 기존 페이지에 입력된 값이 보이고, Cancel을 누르면 반영이 되지 않는 간단한 플로우로 작동한다.

![](https://velog.velcdn.com/images/gs18004/post/9c5d6f08-b111-402f-bcbd-30fb324bb1fe/image.gif)

어떻게 모달 내 input의 값을 기존 페이지에서 받아올 수 있을까?

일단, 어떤 방법을 사용하든 필수로 있어야 하는 상태를 생각해보자. 화면에서 동적으로 렌더링되어야 하는 First name과 Last name은 `App.tsx`에서 상태로 관리해야 한다.

```tsx
const [firstName, setFirstName] = useState<string | null>(null);
const [lastName, setLastName] = useState<string | null>(null);
```

가장 생각하기 쉬운 방법은, `NameModal`에 `setFirstName`과 `setLastName`을 props로 넘겨주는 것이다.

```tsx
<NameModal
  close={closeModal}
  onChangeFirstName={setFirstName}
  onChangeLastName={setLastName}
/>
```

이 방법은 단점이 명확하다. 모달 내에서 다루는 값이 많아질수록 props로 넘겨야 하는 값이 많아진다. 코드가 읽기 힘들어질 가능성이 높다.

이를 보다 선언적으로 처리해보자.

필자는 `openModal`이 비동기적으로 모달 내의 값을 넘겨주는 방식을 채택했다. 다음과 같이 말이다.

```tsx
const value = await openModal();
```

이렇게 하면 `NameModal`에 props를 많이 넘겨주지 않고도 모달 내의 값을 받아올 수 있다.

이제, `useModal` 훅에서 `openModal`이 비동기적으로 값을 넘겨줄 수 있도록 코드를 작성해보자.

useModal은 제네릭을 사용하는 함수여야 한다. openModal이 반환할 값의 타입이 무엇일지 모르기 때문이다. 이 제네릭을 T라고 하자.

그리고, resolve라는 상태를 만들자.

```tsx
const [resolve, setResolve] = useState<(value: T | null) => void>();
```

openModal과 closeModal 함수는 다음과 같다.

`closeModal`에서 인자로 값을 넘겨주면 `openModal`을 호출한 곳에서 비동기적으로 해당 값을 받아올 수 있다.

`setResolve(res)`가 아니라 `setResolve(() => res))`로 해야 하는 이유는 res를 바로 실행시키지 않게 하기 위해서이다. 함수형 업데이트가 헷갈린다면 `setState(prev => prev + 1)`을 생각하면 이해가 편할 것이다.

```tsx
const openModal = (): Promise<T | null> => {
  setIsModalOpen(true);
  return new Promise((res) => setResolve(() => res));
};

const closeModal = (value: T | null) => {
  setIsModalOpen(false);
  if (resolve) resolve(value);
};
```

useModal.tsx의 전체 코드는 다음과 같다.

```tsx
// useModal.tsx

import ModalWrapper from '@src/components/ModalWrapper/ModalWrapper';
import { useState } from 'react';

const useModal = <T,>() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolve, setResolve] = useState<(value: T | null) => void>();

  const openModal = (): Promise<T | null> => {
    setIsModalOpen(true);
    return new Promise((res) => setResolve(() => res));
  };

  const closeModal = (value: T | null) => {
    setIsModalOpen(false);
    if (resolve) resolve(value);
  };

  return {
    ModalWrapper: ({ children }: { children: React.ReactNode }) =>
      isModalOpen ? (
        <ModalWrapper
          close={() => {
            closeModal(null);
          }}
        >
          {children}
        </ModalWrapper>
      ) : null,
    openModal,
    closeModal,
  };
};

export default useModal;
```

`NameModal`은 `close`를 prop으로 받아서 모달을 닫을 때 이를 사용한다. 값을 저장하고 닫으려면 인자로 값을 넘겨주고, 값을 저장하지 않고 닫으려면 인자로 `null`을 넘겨주면 된다.

```tsx
// NameModal.tsx

import { useCallback, useEffect, useRef } from 'react';

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
  const closeModalWithoutSave = useCallback(() => {
    close(null);
  }, [close]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModalWithoutSave();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [closeModalWithoutSave]);

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
```

이제 `App`에서는 `NameModal`과 `useModal`을 가져다 사용하기만 하면 된다.

`NameModal`에서 정의해놓은 반환 타입 `NameModalReturn`을 import하여 `useModal`의 제네릭으로 넣어주었다.

```tsx
// App.tsx

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
```

지금까지 모달을 선언적으로 관리하는 방법에 대해 알아보았다.

이 패턴은 코드의 간결함을 높이고, 재사용성을 강화하며 모달의 흐름을 이해하기 쉽게 만들어준다. 특히, 비동기 데이터 흐름과 상태 관리의 추상화 덕분에 여러 개의 모달도 손쉽게 추가하고 유지보수할 수 있다.

모달 구현에 어려움을 겪고 있거나 복잡한 코드를 단순화하고자 하는 개발자분들께 이 글이 도움이 되길 바란다.
