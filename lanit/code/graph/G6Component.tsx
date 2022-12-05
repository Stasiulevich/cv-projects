import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import G6, { IGraph, LayoutConfig } from '@antv/g6';
import styles from 'components/graph/g6.module.scss';
import { getQueryParams, useOrganizationsStore, useUIStore } from 'utils';
import { useLocation } from 'react-router';
import './g6.scss';
import {
  collapseClickHandler,
  collapseTouchendHandler,
  dragNodeEndHandler,
  edgeMouseEnterHandler,
  edgeMouseLeaveHandler,
  nodeClickHandler,
  nodeMouseEnterHandler,
  nodeMouseLeaveHandler,
  nodeTouchendHandler,
  touchendHandler,
  touchmoveHandler,
  touchstartHandler,
} from 'components/graph/g6helpers';
import 'components/graph/graphConfig/customNodeConfig';
import 'components/graph/graphConfig/customEdgeConfig';
import { defaultNode, nodeStateStyles } from 'components/graph/graphConfig/nodeConfig';
import { defaultEdge, edgeStateStyles } from 'components/graph/graphConfig/edgeConfig';
import { modes } from 'components/graph/graphConfig/modesConfig';
import getLayoutOptions from 'components/graph/layouts';
import ZoomButtons from 'components/zoomButtons';
import { EDGE_TYPES } from 'constants/edgeTypes';
import { RADIUS_STEP } from 'components/graph/graphConfig/graphConfig';

const G6Component = observer(() => {
  const ref = React.useRef<HTMLDivElement>(null);
  const {
    g6Elements,
    expandOrganization,
    graphData,
    expandedRootIds,
    collapseOrganization,
    getOrganizationDetails,
    layout,
    setGraphRef,
  } = useOrganizationsStore();
  const location = useLocation();
  const { dataSourceType } = getQueryParams(location.search);
  const graph = useRef<IGraph | null>(null);
  const getDefaultLayout = () => {
    const layoutOptions = getLayoutOptions(layout) as LayoutConfig;
    if (layout === 'circle') {
      layoutOptions.radius = RADIUS_STEP * g6Elements.nodes.length;
    }
    return layoutOptions;
  };
  const { showMinimap } = useUIStore();
  const deltaXRef = useRef(0);
  const deltaYRef = useRef(0);
  const globalTouchMoveRef = useRef(false);

  useEffect(() => {
    // for multiple edges between 2 nodes
    const arrowEdges = g6Elements.edges.filter((edge) => edge.type.endsWith('arrow'));
    const simpleEdges = g6Elements.edges.filter((edge) => !edge.type.endsWith('arrow'));

    G6.Util.processParallelEdges(
      arrowEdges,
      30,
      EDGE_TYPES.CUSTOM_QUADRATIC_ARROW,
      EDGE_TYPES.CUSTOM_CUBIC_HORIZONTAL_ARROW,
      EDGE_TYPES.CUSTOM_LOOP_ARROW
    );

    G6.Util.processParallelEdges(
      simpleEdges,
      30,
      EDGE_TYPES.CUSTOM_QUADRATIC,
      EDGE_TYPES.CUSTOM_CUBIC_HORIZONTAL,
      EDGE_TYPES.CUSTOM_LOOP
    );
  }, [g6Elements]);

  useEffect(() => {
    if (!graph.current && ref.current) {
      const container: HTMLElement | null = ref.current;
      if (container) {
        const height = container.scrollHeight || container.clientHeight;
        const width = container.scrollWidth;
        graph.current = new G6.Graph({
          container,
          width,
          height,
          modes,
          layout: getDefaultLayout(),
          defaultNode,
          defaultEdge,
          nodeStateStyles,
          // edgeStateStyles,
          minZoom: 0.0001,
          maxZoom: 20,
        });

        graph.current.on('node:click', ({ item }) => {
          nodeClickHandler(item, getOrganizationDetails);
        });

        graph.current.on('collapse-icon:click', (evt) => {
          collapseClickHandler({
            evt,
            graphData,
            expandedRootIds,
            collapseOrganization,
            expandOrganization,
            dataSourceType,
          });
        });

        graph.current.on('collapse-count:click', (evt) => {
          collapseClickHandler({
            evt,
            graphData,
            expandedRootIds,
            collapseOrganization,
            expandOrganization,
            dataSourceType,
          });
        });

        // edges hover effect
        graph.current.on('edge:mouseenter', (e) => edgeMouseEnterHandler(e, graph));
        graph.current.on('edge:mouseleave', (e) => edgeMouseLeaveHandler(e, graph));

        graph.current.on('node:mouseenter', (e) => nodeMouseEnterHandler(e, graph));
        graph.current.on('node:mouseleave', (e) => nodeMouseLeaveHandler(e, graph));

        graph.current.on('dragnodeend', dragNodeEndHandler);

        // touchscreen's handlers
        graph.current.on('touchstart', (e) => touchstartHandler(e, deltaXRef, deltaYRef));

        // TODO: уточнить нужно ли отображение тултипа на сенсорных экранах по клику на связь
        // graph.current.on('edge:touchstart', (e) => {
        //   e.preventDefault();
        // });

        // graph.current.on('edge:touchend', (e) => {
        //   e.preventDefault();
        // });

        graph.current.on('main-box:touchend', (e) =>
          nodeTouchendHandler(e, globalTouchMoveRef, nodeClickHandler, {
            getOrganizationDetails,
          })
        );

        graph.current.on('title:touchend', (e) =>
          nodeTouchendHandler(e, globalTouchMoveRef, nodeClickHandler, {
            getOrganizationDetails,
          })
        );

        graph.current.on('collapse-icon:touchend', (e) => {
          const callbackOpt = {
            evt: e,
            graphData,
            expandedRootIds,
            collapseOrganization,
            expandOrganization,
            dataSourceType,
          };

          return collapseTouchendHandler(e, globalTouchMoveRef, collapseClickHandler, callbackOpt);
        });

        graph.current.on('collapse-count:touchend', (e) => {
          const callbackOpt = {
            evt: e,
            graphData,
            expandedRootIds,
            collapseOrganization,
            expandOrganization,
            dataSourceType,
          };

          return collapseTouchendHandler(e, globalTouchMoveRef, collapseClickHandler, callbackOpt);
        });

        graph.current.on('touchmove', (e) =>
          touchmoveHandler(e, globalTouchMoveRef, deltaXRef, deltaYRef)
        );

        graph.current.on('touchend', touchendHandler);

        setGraphRef(graph.current);

        graph.current.setAutoPaint(true);
        graph.current.data(g6Elements);
        graph.current.render();
        graph.current.fitView();

        if (typeof window !== 'undefined')
          window.onresize = () => {
            if (!graph.current || graph.current.get('destroyed')) return;
            if (!container || !container.scrollWidth || !container.scrollHeight) return;
            graph.current.changeSize(container.scrollWidth, container.scrollHeight);
          };
      }
    }
  }, []);

  useEffect(() => {
    if (graph.current) {
      graph.current.data(g6Elements);
      graph.current.render();
      graph.current.refresh();
      graph.current.fitView();
    }
  }, [g6Elements]);

  useEffect(() => {
    const layoutOptions = getLayoutOptions(layout) as LayoutConfig;
    if (graph.current) {
      if (layout === 'circle') {
        layoutOptions.radius = 40 * g6Elements.nodes.length;
      }
      graph.current.updateLayout(layoutOptions);
      graph.current.fitView();
    }
  }, [layout, g6Elements]);

  const minimap = useRef(
    new G6.Minimap({
      size: [200, 150],
      type: 'keyShape',
    })
  );

  useEffect(() => {
    if (graph.current) {
      if (!showMinimap) {
        graph.current.removePlugin(minimap.current);
      } else {
        minimap.current = new G6.Minimap({
          size: [200, 150],
          type: 'keyShape',
        });
        graph.current.addPlugin(minimap.current);
      }
    }
  }, [showMinimap]);

  return (
    <div className={styles.container}>
      <ZoomButtons />
      <div className={styles.content} ref={ref} />;
    </div>
  );
});

export default G6Component;
