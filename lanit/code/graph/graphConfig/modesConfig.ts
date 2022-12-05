import { IEdge, INode } from '@antv/g6';

export const modes = {
  default: [
    {
      type: 'drag-canvas',
      enableOptimize: true,
    },
    {
      type: 'zoom-canvas',
      enableOptimize: true,
    },
    {
      type: 'drag-node',
      enableOptimize: true,
      updateEdge: false,
      shouldBegin: (e) => {
        const node = e.item as INode;
        const edges = node.getEdges() as IEdge[];
        edges.forEach((ed) => {
          ed.changeVisibility(false);
        });
        return true;
      },
      shouldEnd: (e) => {
        const node = e.item as INode;
        const edges = node.getEdges() as IEdge[];
        edges.forEach((ed) => {
          ed.refresh();
          ed.changeVisibility(true);
        });
        return true;
      },
    },
    {
      type: 'edge-tooltip',
      formatText(model) {
        return model.text;
      },
      offset: 10,
    },
    // 'activate-relations',
    'brush-select',
  ],
};
