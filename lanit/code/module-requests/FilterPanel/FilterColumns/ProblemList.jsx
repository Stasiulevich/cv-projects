import styles from 'lanit/code/module-requests/FilterPanel/FilterPanel.module.scss';
import { Form, Select, Spin } from 'antd';
import { theme } from 'assets/styles/theme';
import NotFoundData from 'components/UI/NotFoundData';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { useAppStore } from 'stores';
import RemoveButton from 'components/UI/RemoveButton';

const ProblemList = ({ loading }) => {
  const { problemList, filters, setFilters } = useAppStore();
  const name = 'listTypeProblemId';
  const [value, setValue] = useState(filters[name]);

  const selectData = problemList.map((code) => (
    <Select.Option value={code.id} key={code.id} className={theme.menu.menuItem}>
      {code.typeProblem}
    </Select.Option>
  ));

  useEffect(() => {
    const item = filters[name];
    setValue(item || undefined);
  }, [filters]);

  const handleChange = (val) => {
    setValue(val);
    setFilters(val, name);
  };

  const tagRender = (fields, data) => {
    return (
      <span className="type-problem">
        {fields.label}
        <span className="separator-comma" />
      </span>
    );
  };

  return (
    <Form.Item label={'Код проблемы'} className={theme.form.formItem}>
      <Select
        prefixCls="askd ant-select"
        showSearch
        mode="multiple"
        showArrow
        value={value}
        bordered={false}
        className={styles.problemSelect}
        onChange={handleChange}
        notFoundContent={!loading ? <NotFoundData /> : null}
        loading={loading}
        placeholder="Выберите код проблемы"
        dropdownClassName={theme.menu.menu}
        tokenSeparators={[',', ' ']}
        optionFilterProp="children"
        allowClear
        clearIcon={<RemoveButton className={'select-clear-icon'} />}
        suffixIcon={
          loading ? <Spin size="small" /> : <i className={`ri-arrow-down-s-fill ${styles.icon}`} />
        }
        tagRender={tagRender}
      >
        {selectData}
      </Select>
    </Form.Item>
  );
};

export default observer(ProblemList);
