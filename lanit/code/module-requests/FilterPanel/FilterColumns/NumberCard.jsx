import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Input } from 'antd';
import { theme } from 'assets/styles/theme';
import { useAppStore } from 'stores';
import { useFormInput } from 'utils';
import RemoveButton from 'components/UI/RemoveButton';

const NumberCard = () => {
  const { setFilters, filters } = useAppStore();
  const fieldProps = useFormInput('cardNumber', setFilters, filters);

  return (
    <Form.Item label={'Номер запроса/ответа'} className={theme.form.formItem}>
      <Input
        bordered={false}
        className={theme.form.input}
        placeholder="Введите номер"
        allowClear
        // suffix={<RemoveButton />}
        {...fieldProps}
      />
    </Form.Item>
  );
};

export default observer(NumberCard);
