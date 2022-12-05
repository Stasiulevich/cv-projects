import G6, { IEdge, INode } from '@antv/g6';

export const collapseClickHandler = ({
  evt,
  dataSourceType,
  graphData,
  expandedRootIds,
  collapseOrganization,
  expandOrganization,
}) => {
  const { item } = evt;
  evt.propagationStopped = true;
  if (item) {
    const id = item.getID();
    if (id && !expandedRootIds.has(id)) {
      expandOrganization(id, dataSourceType);
    } else {
      collapseOrganization(id);
    }
  }
};

export const nodeClickHandler = (item, getOrganizationDetails) => {
  if (item) {
    const id = item.getID();
    if (id) getOrganizationDetails(id);
  }
};

export const fittingString = (str, maxWidth, fontSize) => {
  let currentWidth = 0;
  const rows = 3;
  let counter = 1;
  const t = str.split(' ');
  const result: string[] = [];
  t.forEach((st, index) => {
    const textWidth = G6.Util.getTextSize(st, fontSize)[0];
    currentWidth += textWidth;
    if (counter < rows) {
      if (currentWidth >= maxWidth && index !== 0) {
        result.push('\n');
        result.push(st);
        counter += 1;
        currentWidth = textWidth;
      } else {
        result.push(st);
      }
    } else if (counter === rows) {
      const lastIndex = result.length - 1;
      const word = result[lastIndex];
      const ellipsisWidth = G6.Util.getTextSize('...', fontSize)[0];
      const wordWidth = G6.Util.getTextSize(word, fontSize)[0];
      if (wordWidth + ellipsisWidth > maxWidth) {
        result[lastIndex] = word.replace(word.slice(-3), '...');
      } else {
        result[lastIndex] = `${word}...`;
      }
      counter += 1;
    }
  });
  return result.join(' ');
};

export const edgeMouseEnterHandler = (e, graph) => {
  if (e.item && graph.current) {
    e.item.toFront();
    graph.current.setItemState(e.item, 'active', true);
  }
};

export const edgeMouseLeaveHandler = (e, graph) => {
  if (e.item && graph.current) {
    e.item.toBack();
    graph.current.setItemState(e.item, 'active', false);
  }
};

export const getFillColor = () => {
  const step = 0.1;
  const stepOdd = 0.05;
  const colorOdd = '#565656';
  const colorEven = 'rgba(0,0,0,0)';
  let result = 'l(60) ';
  let i = 0;
  let counter = 0;
  while (i <= 1) {
    if (i === 0 || i === 1) {
      result += `${i}:${colorOdd} `;
      i += step;
    } else if (counter % 2 === 0) {
      result += `${i}:${colorEven} ${i}:${colorOdd} `;
      i += step;
    } else {
      result += `${i}:${colorOdd} ${i}:${colorEven} `;
      i += stepOdd;
    }
    counter += 1;
  }
  return result;
};

export const nodeMouseEnterHandler = (e, graph) => {
  const { item } = e;
  if (item && graph.current) {
    graph.current.setAutoPaint(false);
    graph.current.getNodes().forEach((node) => {
      graph.current?.setItemState(node, 'inactive', true);
    });
    graph.current.getEdges().forEach((node) => {
      graph.current?.setItemState(node, 'inactive', true);
    });
    graph.current.setItemState(item, 'inactive', false);
    graph.current.setItemState(item, 'active', true);
    graph.current.getEdges().forEach((edge) => {
      if (edge.getSource() === item) {
        graph.current?.setItemState(edge.getTarget(), 'inactive', false);
        graph.current?.setItemState(edge.getTarget(), 'active', true);
        graph.current?.setItemState(edge, 'active', true);
        edge.toFront();
      } else if (edge.getTarget() === item) {
        graph.current?.setItemState(edge.getSource(), 'inactive', false);
        graph.current?.setItemState(edge.getSource(), 'active', true);
        graph.current?.setItemState(edge, 'active', true);
        edge.toFront();
      } else {
        graph.current?.setItemState(edge, 'active', false);
      }
    });
    graph.current.paint();
    graph.current.setAutoPaint(true);
  }
};

export const nodeMouseLeaveHandler = (e, graph) => {
  const { item } = e;
  if (item && graph.current) {
    graph.current.setAutoPaint(false);
    graph.current.getNodes().forEach((node) => {
      graph.current?.setItemState(node, 'inactive', false);
    });
    graph.current.getEdges().forEach((node) => {
      graph.current?.setItemState(node, 'inactive', false);
    });
    graph.current.setItemState(item, 'inactive', false);
    graph.current.setItemState(item, 'active', false);
    graph.current.getEdges().forEach((edge) => {
      if (edge.getSource() === item) {
        graph.current?.setItemState(edge.getTarget(), 'inactive', false);
        graph.current?.setItemState(edge.getTarget(), 'active', false);
        graph.current?.setItemState(edge, 'active', false);
        edge.toFront();
      } else if (edge.getTarget() === item) {
        graph.current?.setItemState(edge.getSource(), 'inactive', false);
        graph.current?.setItemState(edge.getSource(), 'active', false);
        graph.current?.setItemState(edge, 'active', false);
        edge.toFront();
      } else {
        graph.current?.setItemState(edge, 'active', false);
      }
    });
    graph.current.paint();
    graph.current.setAutoPaint(true);
  }
};

export const dragNodeEndHandler = (e) => {
  const nodes = e.items as INode[];
  if (nodes) {
    nodes.forEach((node) => {
      const edges = node.getEdges() as IEdge[];
      edges.forEach((ed) => {
        ed.refresh();
      });
    });
  }
};

const isNode = (type) => {
  return type === 'node';
};

const isEdge = (type) => {
  return type === 'edge';
};

export const touchstartHandler = (e, deltaXRef, deltaYRef) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.item) {
    if (isNode(e.item.getType())) {
      const node = e.item as INode;
      const edges = node.getEdges() as IEdge[];
      edges.forEach((ed) => {
        ed.changeVisibility(false);
      });
      const box = node.getBBox();
      deltaXRef.current = box.x - e.x + box.width / 2;
      deltaYRef.current = box.y - e.y + box.height / 2;
    }
  }
};

export const nodeTouchendHandler = (e, globalTouchMoveRef, callback, callbackOpt) => {
  e.preventDefault();
  e.stopPropagation();
  const { item } = e;
  if (item && !globalTouchMoveRef.current) {
    const { getOrganizationDetails } = callbackOpt;
    callback(item, getOrganizationDetails);
  }
  globalTouchMoveRef.current = false;
};

export const collapseTouchendHandler = (e, globalTouchMoveRef, callback, callbackOpt) => {
  e.preventDefault();
  e.stopPropagation();
  const { item } = e;
  if (item && !globalTouchMoveRef.current) {
    callback(callbackOpt);
  }
  globalTouchMoveRef.current = false;
};

export const touchmoveHandler = (e, globalTouchMoveRef, deltaXRef, deltaYRef) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.item) {
    if (isNode(e.item.getType())) {
      const node = e.item as INode;
      const { x, y } = e;
      node.updatePosition({ x: x + deltaXRef.current, y: y + deltaYRef.current });
      globalTouchMoveRef.current = true;
    }
  }
};

export const touchendHandler = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.item) {
    if (isNode(e.item.getType())) {
      const node = e.item as INode;
      const edges = node.getEdges() as IEdge[];
      edges.forEach((ed) => {
        ed.refresh();
        ed.changeVisibility(true);
      });
    }
  }
};
