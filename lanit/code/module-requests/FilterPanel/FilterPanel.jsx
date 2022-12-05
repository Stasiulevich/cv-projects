import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import styles from 'lanit/code/module-requests/FilterPanel/FilterPanel.module.scss';
import Container from 'components/layout/Container';
import { Checkbox, Col, Form, Input, Row } from 'antd';
import { SlideDown } from 'react-slidedown';
import Button from 'components/UI/Button';
import { useUIStore } from 'stores';
import CollapseButton from 'components/UI/CollapseButton';
import { FILTER_BTN_RESPONSIVE, FILTER_COL_RESPONSIVE } from 'constants/columnResponsive';
import NumberCard from 'components/blocks/FilterPanel/FilterColumns/NumberCard';
import Picker from 'components/blocks/FilterPanel/FilterColumns/Picker';
import ExecutorCard from 'components/blocks/FilterPanel/FilterColumns/ExecutorCard';
import CommentCard from 'components/blocks/FilterPanel/FilterColumns/CommentCard';
import ObjectCard from 'components/blocks/FilterPanel/FilterColumns/ObjectCard';
import { useAppStore } from 'stores';
import ActionStatus from 'components/blocks/FilterPanel/FilterColumns/ActionStatus';
import ProblemList from 'components/blocks/FilterPanel/FilterColumns/ProblemList';

import { useHistory, useLocation } from 'react-router-dom';
import { PAGE_SIZE } from 'constants/common';
import { cloneDeep } from 'lodash';

const prepareParams = (params) => {
  const preparedParams = cloneDeep(params);
  Object.keys(preparedParams).forEach((key) => {
    if (!preparedParams[key]) {
      preparedParams[key] = undefined;
    }
  });
  return preparedParams;
};

const FilterPanel = () => {
  const { showFilterPanel, toggleFilterPanel } = useUIStore();
  const {
    getDataTable,
    resetFilters,
    loadProblemsList,
    setHasFilterFlag,
    filters,
    setFiltersConfig,
    filtersConfig,
  } = useAppStore();
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    setLoading(true);
    loadProblemsList().finally(() => setLoading(false));
  }, []);

  const submitHandler = () => {
    setHasFilterFlag(true);
    setFiltersConfig(true);
    getDataTable(false, { size: PAGE_SIZE, page: 0 }, true);
  };

  const resetHandler = async () => {
    setHasFilterFlag(false);
    resetFilters();
    setFiltersConfig(false);
    getDataTable(false, { size: PAGE_SIZE, page: 0 }, true);
  };

  return (
    <Container className={styles.filterPanel}>
      <div className={styles.header}>
        <h4>Фильтры</h4>
        <CollapseButton onClick={toggleFilterPanel} show={showFilterPanel} />
      </div>
      {/* todo: разобраться */}
      {/* todo: поставлено Boolean.toString() потому как библиотека выдает ошибку в консоли */}
      <SlideDown style={{ overflowX: 'hidden' }} show={showFilterPanel.toString()}>
        {showFilterPanel && (
          <Form layout={'vertical'}>
            <Row gutter={[32, 12]}>
              <Col {...FILTER_COL_RESPONSIVE}>
                <NumberCard />
              </Col>
              <Col {...FILTER_COL_RESPONSIVE}>
                <Picker />
              </Col>
              <Col {...FILTER_COL_RESPONSIVE}>
                <ExecutorCard />
              </Col>
              <Col {...FILTER_COL_RESPONSIVE}>
                <CommentCard />
              </Col>
              <Col {...FILTER_COL_RESPONSIVE}>
                <ObjectCard />
              </Col>
              <Col {...FILTER_COL_RESPONSIVE}>
                <ProblemList loading={loading} />
              </Col>
              <Col className={styles.col} {...FILTER_COL_RESPONSIVE}>
                <ActionStatus />
              </Col>
            </Row>
            <Row gutter={[32, 12]}>
              <Col className={`${styles.col} ${styles.colAlignEnd}`} {...FILTER_BTN_RESPONSIVE}>
                <Button secondary className={styles.gap8} onClick={resetHandler}>
                  Очистить фильтр
                </Button>
                <Button primary htmlType="button" onClick={submitHandler}>
                  Применить
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </SlideDown>
    </Container>
  );
};

export default observer(FilterPanel);
