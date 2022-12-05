import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Form } from 'antd';
import { theme } from 'assets/styles/theme';
import DatePickerWrapper from 'components/common/DatePickerWrapper';
import { useAppStore } from 'stores';
import moment from 'moment';
import { getPeriodByType, INIT_PERIOD_TYPE } from 'utils';

const initPeriod = {
  startDate: getPeriodByType(INIT_PERIOD_TYPE).startDate
    ? moment(getPeriodByType(INIT_PERIOD_TYPE).startDate)
    : undefined,
  endDate: getPeriodByType(INIT_PERIOD_TYPE).endDate
    ? moment(getPeriodByType(INIT_PERIOD_TYPE).endDate)
    : undefined,
  type: INIT_PERIOD_TYPE,
};

const Picker = () => {
  const { setFilters, resetOneFieldFilters, filters } = useAppStore();
  const formatDate = 'DD.MM.YYYY';
  const name = 'createDateCardFilter';
  const [period, setPeriod] = useState(initPeriod);

  useEffect(() => {
    if (
      filters.createDateCardFilter &&
      (filters.createDateCardFilter.createDateCardAfter ||
        filters.createDateCardFilter.createDateCardBefore)
    ) {
      setPeriod({
        startDate:
          moment(filters.createDateCardFilter.createDateCardAfter, formatDate) || undefined,
        endDate: moment(filters.createDateCardFilter.createDateCardBefore, formatDate) || undefined,
        type: 'custom',
      });
    } else {
      setPeriod({
        startDate: undefined,
        endDate: undefined,
        type: 'custom',
      });
    }
  }, [filters]);

  const submitPicker = (p) => {
    const { startDate, endDate } = p;
    const dates = {
      createDateCardAfter: startDate
        ? startDate.format(formatDate)
        : moment('1900-01-01').format(formatDate),
      createDateCardBefore: endDate ? endDate.format(formatDate) : moment().format(formatDate),
    };
    if (!startDate && !endDate) {
      resetOneFieldFilters(name);
    } else {
      setFilters(dates, name);
    }
  };

  return (
    <Form.Item label={'Дата запроса/ответа'} className={theme.form.formItem}>
      <DatePickerWrapper submitPicker={submitPicker} period={period} setPeriod={setPeriod} />
    </Form.Item>
  );
};

export default observer(Picker);
