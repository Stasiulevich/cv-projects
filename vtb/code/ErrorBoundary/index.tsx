import React, { FC, ReactNode } from 'react';
import { useStore } from '@hooks/useStore';
import { observer } from 'mobx-react';
import { Error500, Error404 } from '@components/Errors';

type TProps = {
  children: ReactNode;
};

export const ErrorBoundary: FC<TProps> = observer(({ children }) => {
  const { config } = useStore();

  if (config.requestErrorCode === 500 || config.requestErrorCode === 503) {
    return <Error500 />;
  }

  if (config.requestErrorCode === 404) {
    return <Error404 />;
  }

  return <>{children}</>;
});
