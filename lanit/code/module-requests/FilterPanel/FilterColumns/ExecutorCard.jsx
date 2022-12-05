import React from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Input } from 'antd';
import { theme } from 'assets/styles/theme';
import { useAppStore } from 'stores';
import { useFormInput } from 'utils';

const ExecutorCard = () => {
  const { setFilters, filters } = useAppStore();
  const fieldProps = useFormInput('performerFullName', setFilters, filters);

  return (
    <Form.Item label={'Исполнитель'} className={theme.form.formItem}>
      <Input
        bordered={false}
        className={theme.form.input}
        placeholder="Введите фамилию"
        allowClear
        {...fieldProps}
      />
    </Form.Item>
  );
};

export default observer(ExecutorCard);
