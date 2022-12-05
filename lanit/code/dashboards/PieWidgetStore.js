import { widgetStoreFabric } from 'lanit/code/dashboards/widgetStoreFabric';

// const testData = {
//   "data": [{"id": 0, "value": 5.49, "active": true, "string": "Федеральный уровень"}, {
//     "id": 1,
//     "value": 1.4,
//     "active": true,
//     "string": "Ямало-Ненецкий автономный округ (Тюменская область)"
//   }, {"id": 2, "value": 1.29, "active": true, "string": "Челябинская область"}, {
//     "id": 3,
//     "value": 1.18,
//     "active": true,
//     "string": "Курганская область"
//   }, {"id": 4, "value": 1.01, "active": true, "string": "Московская область"}, {
//     "id": 5,
//     "value": 19.11,
//     "active": true,
//     "string": "Остальные"
//   }]
// };

export const PieWidgetStore = widgetStoreFabric({
  position: { i: 'id-0', x: 0, y: 0, w: 6, h: 8, minW: 6, minH: 8 },
  startPeriod: 'year',
  apiUrl: '/askd-dashboard/api/data/6_1',
  isEmptyData: (data) => {
    if (!data) return true;
    const other = data && data.length > 0 && data.find(({ string }) => string === 'Другие субъекты РФ');
    return !data.length || !other || !other.value;
  },
  addFields: {
    bp: [11, 22],
    countType: 'rub',
  },
  addApiParams: ['bp'],
  // testData,
});
