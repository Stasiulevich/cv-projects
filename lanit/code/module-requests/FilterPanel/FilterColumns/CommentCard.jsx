import React from 'react';
import { observer } from 'mobx-react-lite';
import { Form } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { theme } from 'assets/styles/theme';
import { useAppStore } from 'stores';
import { useFormInput } from 'utils';

const CommentCard = () => {
  const { setFilters, filters } = useAppStore();
  const fieldProps = useFormInput('userCommentCard', setFilters, filters);

  return (
    <Form.Item label={'Комментарий'} className={theme.form.formItem}>
      <TextArea
        placeholder="Введите комментарий"
        bordered={false}
        className={`${theme.form.input} ${theme.form.textarea}`}
        rows={1}
        autoSize={{ minRows: 1, maxRows: 5 }}
        allowClear
        {...fieldProps}
      />
    </Form.Item>
  );
};

export default observer(CommentCard);
