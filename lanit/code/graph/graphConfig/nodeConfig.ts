import { HEIGHT, WIDTH } from 'lanit/code/graph/graphConfig/graphConfig';

export const defaultNode = {
  size: [WIDTH, HEIGHT],
  type: 'card-node',
  style: {
    cursor: 'pointer',
  },
};

export const nodeStateStyles = {
  active: {
    opacity: 1,
  },
  inactive: {
    opacity: 0.2,
  },
  selected: {
    stroke: '#5B8FF9',
    shadowOffsetY: 0,
    shadowOffsetX: 0,
    shadowColor: '#5B8FF9',
    shadowBlur: 15,
    lineWidth: 2,
  },
};
