import React from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Input } from 'antd';
import { useAppStore } from 'stores';
import { useFormInput } from 'utils';
import { theme } from 'assets/styles/theme';

const ObjectCard = () => {
  const { setFilters, filters } = useAppStore();
  const fieldProps = useFormInput('objectFilter', setFilters, filters);

  return (
    <Form.Item label={'Объект запроса/ответа'} className={theme.form.formItem}>
      <Input
        bordered={false}
        className={theme.form.input}
        placeholder="Введите название, ИНН, СНИЛС"
        allowClear
        {...fieldProps}
      />
    </Form.Item>
  );
};

export default observer(ObjectCard);
