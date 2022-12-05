import React, { useEffect, useState } from 'react';
import { ROUTES } from 'routes/routes';
import { Table } from 'antd';
import { observer } from 'mobx-react-lite';
import ReactDragListView from 'react-drag-listview';
import { useVT } from 'virtualizedtableforantd4';

import NotFoundData from 'components/UI/NotFoundData';
import { useAppStore, useUserStore } from 'stores';
import { PAGE_SIZE } from 'constants/common';

import styles from './RecordTable.module.scss';
import './Record.scss';

const RecordTable = () => {
  const {
    getDataTable,
    renderColumns,
    updateSortTable,
    setColumnsOrder,
    setSelectedRows,
    data,
    dataLoading,
    filterState,
    filtersConfig,
    allCountPages,
    tags,
  } = useAppStore();
  const { permissionHandler, isEditor } = useUserStore();
  const [page, setPage] = useState(1);
  const tableAndScrollHeight = 700;

  const onFetch = (nextPage, update = false) => {
    if (nextPage <= allCountPages - 1) {
      getDataTable(
        false,
        {
          size: PAGE_SIZE,
          page: nextPage,
        },
        update
      );
      setPage(nextPage + 1);
    }
  };

  const visibleColumns = renderColumns.filter((col) => col.visible);

  const [vt, _, ref] = useVT(
    () => ({
      onScroll: ({ isEnd }) => {
        if (isEnd) {
          onFetch(page);
        }
      },
      scroll: { y: tableAndScrollHeight },
    }),
    [page, allCountPages]
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTo(0);
    }
    setPage(1);
  }, [filterState, filtersConfig, tags]);

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record) => ({
      name: record.name,
    }),
    renderCell: (checked, record, index, originNode) => {
      return React.cloneElement(originNode, {
        className: styles.checkboxInMenu,
      });
    },
  };

  const dragProps = {
    onDragEnd(fromIndex, toIndex) {
      const excludeIndex = [0, 1, 2]; // index for fixed cols - selection, type and number
      if (excludeIndex.includes(fromIndex) || excludeIndex.includes(toIndex)) return null;
      const columns = [...renderColumns.filter((col) => !col.noDrag).filter((col) => col.visible)];
      const item = columns.splice(fromIndex - 1, 1)[0];
      columns.splice(toIndex - 1, 0, item);
      setColumnsOrder(columns);
    },
    nodeSelector: 'th',
    lineClassName: styles.dropLine,
  };

  const handleTableChange = (pagination, filters, sorter) => {
    updateSortTable(sorter.field, sorter.order);
    onFetch(0, true);
    setPage(0);
    if (ref.current) {
      ref.current.scrollTo(0);
    }
  };

  const doubleClickHandler = (row) => {
    if (row && row.cardType === 'RESPONSE') {
      window.open(`${window.origin}/rfm-request${ROUTES.RESPONSE_MODULE}/${row.id}`, '_blank');
    } else {
      window.open(`${window.origin}/rfm-request${ROUTES.REQUEST_MODULE}/${row.id}`, '_blank');
    }
  };

  return (
    <div className={styles.recordTable}>
      <ReactDragListView.DragColumn {...dragProps}>
        <Table
          components={vt}
          pagination={false}
          loading={dataLoading && { size: 'default' }}
          bordered={false}
          rowClassName={styles.row}
          className={styles.table}
          rowSelection={{
            type: 'checkbox',
            ...rowSelection,
          }}
          columns={visibleColumns}
          dataSource={data}
          scroll={{
            scrollToFirstRowOnChange: false,
            y: tableAndScrollHeight,
            x: '100%',
          }}
          locale={{ emptyText: <NotFoundData /> }}
          onChange={handleTableChange}
          onRow={(record, rowIndex) => {
            return {
              // onClick: (event) => {
              //   // row click for select
              //   if (event?.target?.parentNode?.children[0]?.querySelector('input')) {
              //     event.target.parentNode.children[0].querySelector('input').click();
              //   }
              // },
              onDoubleClick: () => doubleClickHandler(record),
            };
          }}
        />
      </ReactDragListView.DragColumn>
    </div>
  );
};

export default observer(RecordTable);
