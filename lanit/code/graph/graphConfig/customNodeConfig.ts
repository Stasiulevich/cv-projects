import G6 from '@antv/g6';
import { fittingString, getFillColor } from 'components/graph/g6helpers';
import { StatusesEnum } from 'enums/orgs';
import { GRAPH_FONT_SIZE, RADIUS } from 'lanit/code/graph/graphConfig/graphConfig';

G6.registerNode(
  'card-node',
  {
    update(cfg, node) {
      const group = node.getContainer();
      const children = group.get('children');
      const root = children[0];
      root.attr(cfg.style);
      children
        .filter((c) => c.get('name') === 'path-border')
        .forEach((shape) => {
          if (!cfg.isExpanded) {
            shape.attr({ opacity: 1 });
          } else {
            shape.attr({ opacity: 0 });
          }
        });

      children
        .filter((c) => c.get('name') === 'collapse-icon')
        .forEach((shape) => {
          if (cfg.linksCount) {
            if (cfg.isExpanded) {
              shape.attr({ opacity: 1, fill: (cfg.borderColor as string) || '#999' });
            } else {
              shape.attr({ opacity: 1, fill: '#fff' });
            }
          } else {
            shape.attr({ opacity: 0 });
          }
        });

      children
        .filter((c) => c.get('name') === 'collapse-count')
        .forEach((shape) => {
          if (cfg.linksCount) {
            if (cfg.isExpanded) {
              shape.attr({ opacity: 1, fill: '#fff', text: cfg.linksCount });
            } else {
              shape.attr({ opacity: 1, fill: '#1D1D1D', text: cfg.linksCount });
            }
          } else {
            shape.attr({ opacity: 0 });
          }
        });
    },
    draw(cfg, group) {
      let shape;
      if (cfg && group) {
        // console.log('CFG', cfg);
        const width = cfg.size ? cfg.size[0] : 180;
        const height = cfg.size ? cfg.size[1] : 100;
        const dx = width / 2;
        const dy = height / 2;
        const r = RADIUS;

        // root rectangle shape
        shape = group.addShape('rect', {
          attrs: {
            x: -dx,
            y: -dy,
            width,
            height,
            fill: cfg.fillColor as string,
            radius: r,
            cursor: 'pointer',
            shadowColor: cfg.shadowColor as string,
            shadowBlur: 15,
            shadowOffsetX: -2,
            shadowOffsetY: 5,
          },
          name: 'main-box',
          draggable: true,
        });

        // node status line (rect)
        if (!cfg.isRoot && cfg.status && cfg.status !== StatusesEnum.ACTIVE) {
          const { status } = cfg;
          let fillColor = '#525252';
          if (status === StatusesEnum.LIQUIDATING) fillColor = cfg.borderColor as string;
          if (status === StatusesEnum.IN_JOINING_PROCESS) fillColor = '#fff';
          if (status === StatusesEnum.BANKRUPTCY) {
            fillColor = getFillColor();
          }
          group.addShape('rect', {
            attrs: {
              x: 2 - dx,
              y: 2 - dy,
              width: 8,
              height: height - 4,
              fill: fillColor,
              radius: [r - 2, 0, 0, r - 2],
              pointerEvents: 'none',
              cursor: 'pointer',
            },
            name: 'status-box',
            draggable: true,
          });
        }

        const str = cfg.name || '';
        const text = fittingString(str, 150, GRAPH_FONT_SIZE);

        // main label text
        group.addShape('text', {
          attrs: {
            textBaseline: 'middle',
            y: 0,
            x: 0,
            textAlign: 'center',
            fontSize: GRAPH_FONT_SIZE,
            fontFamily: 'Roboto',
            text,
            fill: '#1D1D1D',
            pointerEvents: 'none',
            cursor: 'pointer',
          },
          name: 'title',
          draggable: true,
        });

        // linksCount shape with label count
        if (cfg.linksCount) {
          const count = cfg.linksCount as number;
          let countWidth = G6.Util.getTextSize(count.toString(), GRAPH_FONT_SIZE)[0] + 10;
          const fillColor = (cfg.borderColor as string) || '#666';
          const minWidth = 24;
          if (countWidth < 24) countWidth = minWidth;
          group.addShape('rect', {
            attrs: {
              x: dx - countWidth,
              y: height - 24 - dy,
              width: countWidth,
              height: 24,
              radius: [r, 0, r, 0],
              cursor: 'pointer',
              textAlign: 'center',
              fill: fillColor,
            },
            name: 'collapse-icon',
            draggable: true,
          });

          group.addShape('text', {
            attrs: {
              textBaseline: 'middle',
              textAlign: 'center',
              y: height - 10 - dy,
              x: dx - countWidth / 2,
              fontSize: GRAPH_FONT_SIZE,
              fontFamily: 'Roboto',
              text: cfg.linksCount,
              fill: '#ffffff',
              cursor: 'pointer',
            },
            name: 'collapse-count',
            draggable: true,
          });

          // expanded border shape
          if (!cfg.isExpanded) {
            const R = RADIUS;
            const strokeColor = (cfg.borderColor as string) || 'black';
            const path = `M ${-dx + 2 * R},${-dy}
              v${-R}
              a${R},${R} 0 0 1 ${R},${-R}
              h${width - 2 * R}
              a${R},${R} 0 0 1 ${R},${R}
              v${height - 2 * R}
              a${R},${R} 0 0 1 ${-R},${R}
              h${-R}`;

            group.addShape('path', {
              attrs: {
                path,
                stroke: strokeColor,
                lineWidth: 2,
                cursor: 'pointer',
              },
              name: 'path-border',
            });
          }
        }
      }
      return shape;
    },
  },
  'single-node'
);

G6.registerNode(
  'disabled-node',
  {
    update(cfg, node) {
      const group = node.getContainer();
      const children = group.get('children');
      const root = children[0];
      root.attr(cfg.style);
      children
        .filter((c) => c.get('name') === 'path-border')
        .forEach((shape) => {
          if (!cfg.isExpanded) {
            shape.attr({ opacity: 1 });
          } else {
            shape.attr({ opacity: 0 });
          }
        });

      children
        .filter((c) => c.get('name') === 'collapse-icon')
        .forEach((shape) => {
          if (cfg.isExpanded) {
            shape.attr({ fill: '#A5A5A5' });
          } else {
            shape.attr({ fill: '#fff' });
          }
        });

      children
        .filter((c) => c.get('name') === 'collapse-count')
        .forEach((shape) => {
          if (cfg.isExpanded) {
            shape.attr({ fill: '#fff' });
          } else {
            shape.attr({ fill: '#1D1D1D' });
          }
        });
    },
    draw(cfg, group) {
      let shape;
      if (cfg && group) {
        const width = cfg.size ? cfg.size[0] : 180;
        const height = cfg.size ? cfg.size[1] : 100;
        const dx = width / 2;
        const dy = height / 2;
        const r = RADIUS;

        // root rectangle shape
        shape = group.addShape('rect', {
          attrs: {
            x: -dx,
            y: -dy,
            width,
            height,
            fill: '#C9C9C9',
            radius: r,
            cursor: 'pointer',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
          },
          name: 'main-box',
          draggable: true,
        });

        const str = cfg.name || '';
        const text = fittingString(str, 150, GRAPH_FONT_SIZE);

        // main label text
        group.addShape('text', {
          attrs: {
            textBaseline: 'middle',
            y: 0,
            x: 0,
            textAlign: 'center',
            fontSize: GRAPH_FONT_SIZE,
            fontFamily: 'Roboto',
            text,
            fill: '#1D1D1D',
            pointerEvents: 'none',
            cursor: 'pointer',
          },
          name: 'title',
          draggable: true,
        });

        // linksCount shape with label count
        if (cfg.linksCount) {
          const count = cfg.linksCount as number;
          let countWidth = G6.Util.getTextSize(count.toString(), GRAPH_FONT_SIZE)[0] + 10;
          let fillColor = '#fff';
          const minWidth = 24;
          if (countWidth < 24) countWidth = minWidth;
          if (cfg.isExpanded) fillColor = '#A5A5A5';

          group.addShape('rect', {
            attrs: {
              x: dx - countWidth,
              y: height - 24 - dy,
              width: countWidth,
              height: 24,
              radius: [r, 0, r, 0],
              cursor: 'pointer',
              textAlign: 'center',
              fill: fillColor,
            },
            name: 'collapse-icon',
            draggable: true,
          });

          let textFillColor = '#1D1D1D';
          if (cfg.isExpanded) textFillColor = '#fff';

          group.addShape('text', {
            attrs: {
              textBaseline: 'middle',
              textAlign: 'center',
              y: height - 10 - dy,
              x: dx - countWidth / 2,
              fontSize: GRAPH_FONT_SIZE,
              fontFamily: 'Roboto',
              text: cfg.linksCount,
              fill: textFillColor,
              cursor: 'pointer',
            },
            name: 'collapse-count',
            draggable: true,
          });

          // expanded border shape
          if (!cfg.isExpanded) {
            const R = RADIUS;
            const strokeColor = (cfg.borderColor as string) || 'black';
            const path = `M ${-dx + 2 * R},${-dy}
              v${-R}
              a${R},${R} 0 0 1 ${R},${-R}
              h${width - 2 * R}
              a${R},${R} 0 0 1 ${R},${R}
              v${height - 2 * R}
              a${R},${R} 0 0 1 ${-R},${R}
              h${-R}`;

            group.addShape('path', {
              attrs: {
                path,
                stroke: strokeColor,
                lineWidth: 2,
                cursor: 'pointer',
              },
              name: 'path-border',
            });
          }
        }
      }
      return shape;
    },
  },
  'single-node'
);
