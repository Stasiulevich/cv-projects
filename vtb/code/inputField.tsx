import React from 'react';
import { observer } from 'mobx-react';
import { Input, Row } from '@vtb-ib/ui-kit';
import styles from './styles.scss';


type TProps<T, U> = {
  onBlur: (f: T, v: string) => void;
  onChange: (f: T, v: string) => void;
  store: U;
  fieldName: T;
  label: string;
  required?: boolean;
  validationStore?: undefined | Record<string, any>,
  maxLength?: number,
  mask?: (string | RegExp)[],
  filter?: RegExp,
  isDisabled?: boolean
};

const InputField = observer(
  <T extends string, U extends Record<string, any>>({
    onBlur,
    onChange,
    store,
    fieldName,
    label,
    required = true,
    validationStore,
    maxLength,
    mask,
    filter,
    isDisabled = false,
  }: TProps<T, U>) => {

    const notifications = validationStore
      ? validationStore.validationErrors[ fieldName ] || []
      : store.validationErrors[ fieldName ] || [];

    return (
      <Row className={styles.fieldBlock}>
        <Input
          className={required ? styles.labelRequired : ''}
          label={label}
          value={store.editData[ fieldName ] || ''}
          onChange={(e, value) => onChange(fieldName, value)}
          notificationStatus={notifications.length ? 'error' : undefined}
          notifications={notifications}
          onBlur={() => onBlur(fieldName, store.editData[ fieldName ])}
          maxLength={maxLength}
          mask={mask}
          isDisabled={isDisabled}
          filter={filter}
        />
      </Row>
    );
  },
);

export default InputField;
