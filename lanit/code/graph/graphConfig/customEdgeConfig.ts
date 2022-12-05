import G6, { ILabelConfig } from '@antv/g6';
import { EDGE_TYPES } from 'constants/edgeTypes';

const labelCfg: ILabelConfig = {
  style: {
    textAlign: 'center' as 'center',
    textBaseline: 'middle' as 'middle',
    fill: '#1F1F1F',
    fontSize: 14,
    background: {
      fill: '#ffffff',
      padding: [8, 8, 8, 8],
      radius: 14,
      // @ts-ignore
      shadowBlur: 15,
      shadowColor: 'rgba(0,0,0, 0.1)',
      shadowOffsetX: 10,
      shadowOffsetY: 5,
    },
  },
};

const getEndArrowConfig = (fill = '') => {
  return {
    path: G6.Arrow.triangle(8, 8, 3),
    d: 3,
    fill,
    lineDash: [0, 0],
  };
};

G6.registerEdge(
  EDGE_TYPES.CUSTOM_CUBIC_HORIZONTAL_ARROW,
  {
    labelPosition: 'center',
    labelAutoRotate: false,
    options: {
      labelCfg,
      style: {
        endArrow: getEndArrowConfig(''),
      },
      stateStyles: {
        active: {
          stroke: '#000',
          endArrow: getEndArrowConfig('#000'),
        },
        inactive: {
          stroke: '#E7E7E7',
          endArrow: getEndArrowConfig('#E7E7E7'),
        },
      },
    },
  },
  EDGE_TYPES.CUBIC_HORIZONTAL
);

G6.registerEdge(
  EDGE_TYPES.CUSTOM_CUBIC_HORIZONTAL,
  {
    labelPosition: 'center',
    labelAutoRotate: false,
    options: {
      labelCfg,
      style: {
        endArrow: false,
      },
      stateStyles: {
        active: {
          stroke: '#000',
          endArrow: false,
        },
        inactive: {
          stroke: '#E7E7E7',
          endArrow: false,
        },
      },
    },
  },
  EDGE_TYPES.CUBIC_HORIZONTAL
);

G6.registerEdge(
  EDGE_TYPES.CUSTOM_QUADRATIC_ARROW,
  {
    labelPosition: 'center',
    labelAutoRotate: false,
    options: {
      labelCfg,
      style: {
        endArrow: getEndArrowConfig(''),
      },
      stateStyles: {
        active: {
          stroke: '#000',
          endArrow: getEndArrowConfig('#000'),
        },
        inactive: {
          stroke: '#E7E7E7',
          endArrow: getEndArrowConfig('#E7E7E7'),
        },
      },
    },
  },
  EDGE_TYPES.QUADRATIC
);

G6.registerEdge(
  EDGE_TYPES.CUSTOM_QUADRATIC,
  {
    labelPosition: 'center',
    labelAutoRotate: false,
    options: {
      labelCfg,
      style: {
        endArrow: false,
      },
      stateStyles: {
        active: {
          stroke: '#000',
          endArrow: false,
        },
        inactive: {
          stroke: '#E7E7E7',
          endArrow: false,
        },
      },
    },
  },
  EDGE_TYPES.QUADRATIC
);

G6.registerEdge(
  EDGE_TYPES.CUSTOM_LOOP_ARROW,
  {
    labelPosition: 'center',
    labelAutoRotate: false,
    options: {
      labelCfg,
      style: {
        endArrow: getEndArrowConfig(''),
      },
      stateStyles: {
        active: {
          stroke: '#000',
          endArrow: getEndArrowConfig('#000'),
        },
        inactive: {
          stroke: '#E7E7E7',
          endArrow: getEndArrowConfig('#E7E7E7'),
        },
      },
    },
  },
  EDGE_TYPES.LOOP
);

G6.registerEdge(
  EDGE_TYPES.CUSTOM_LOOP,
  {
    labelPosition: 'center',
    labelAutoRotate: false,
    options: {
      labelCfg,
      style: {
        endArrow: false,
      },
      stateStyles: {
        active: {
          stroke: '#000',
          endArrow: false,
        },
        inactive: {
          stroke: '#E7E7E7',
          endArrow: false,
        },
      },
    },
  },
  EDGE_TYPES.LOOP
);
