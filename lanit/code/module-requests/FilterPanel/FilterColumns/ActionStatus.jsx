import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Checkbox, Form } from 'antd';
import styles from 'components/blocks/FilterPanel/FilterPanel.module.scss';
import { theme } from 'assets/styles/theme';
import { useAppStore } from 'stores';

const ActionStatus = () => {
  const { setFilters, filters } = useAppStore();
  const name = 'actionStatus';
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(!!filters[name]);
  }, [filters]);

  const onChange = (e) => {
    const { target } = e;
    if (target) {
      setChecked(target.checked);
      setFilters(target.checked ? target.value : 'DELETED', target.name);
    }
  };

  return (
    <Form.Item style={{ paddingTop: '22px' }} className={theme.form.formItem}>
      <Checkbox
        checked={checked}
        value="CREATED"
        onChange={onChange}
        className={styles.checkbox}
        name={name}
      >
        Объект на контроле
      </Checkbox>
    </Form.Item>
  );
};

export default observer(ActionStatus);
