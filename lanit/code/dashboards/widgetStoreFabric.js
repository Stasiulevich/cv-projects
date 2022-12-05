import React from 'react';
import axios from 'axios';
import {
  action,
  autorun,
  comparer,
  computed,
  extendObservable, observable,
} from 'mobx';
import { getPeriodByType } from 'utils/period';
import { moment } from 'utils/moment';
import { appStore } from 'stores/app.store';
import {
  getIsDifferentDate, getIsEqualFilter,
  getOrganization,
  getPeriodByWidgetDate,
  getPeriodName,
} from 'utils/helpers';
import { getTextForBoundaryByWidget } from 'utils/boundary';

const MAX_CHECK_COUNT = {
  day: 365,
  week: 52,
};

// format yyyy-mm-dd
const MAX_CHECK_DATE_PURCHASES = '2014-01-01';
const MAX_CHECK_DATE = '2016-01-01';

const checkAllMoscow = (complex, grbs, orgId) => {
  return complex.length === 0 && grbs.length === 0 && orgId.length === 0;
}

const checkOrganizations = (orgId) => {
  return orgId && orgId.length > 0;
};
const checkGRBS = (grbs, orgId) => {
  return grbs && grbs.length > 0 && orgId.length === 0;
};
const checkComplex = (complex, grbs, orgId) => {
  return complex && complex.length > 0 && grbs.length === 0 && orgId.length === 0;
};

const checkPeriodDayOrWeek = (period) => {
  return period === 'day' || period === 'week';
};

/**
 * Фабрика создающая классы сторов для виджетов
 * */
export const widgetStoreFabric = (
  {
    apiUrl, // адрес бека от корня сайта
    // title = '', // заголовок виджета, может использоваться во вью, необязателен
    position, // начальная позиция и размеры виджета в формате библиотеки react-grid-layout
    BACK_DATE_FORMAT = 'YYYY-MM-DD', // формат даты для параметров dateFrom и dateTo, если null то ISO формат
    // дополнительные поля для стора виджета. могут применяться для связи шапки и вьюхи.
    // ⚠ должны быть сериализуемые. т.к. сохраняются на бек вместе со всеми рабочими столами
    // ⚠ могут содержать геттеры, не шпредить ( {...params.addFields} ) при расширении
    addFields = {},
    startPeriod = 'year', // стартовый период при создании виджета, список смотрим в @see PeriodFilter
    addApiParams = [], // ключи полей из стора дополнительно передаваемые на бек,
    // ⚠ параметры и их начальные значения надо прописать в addFields
    testData = null, // в случае отказа бека или его отсутствия можно
    // тут передать проверочные данные, они будут переданы вместо данных с бека
    dateFrom, // прямое указание начальной даты
    dateTo, // прямое указание конечной даты
    prepareApiParams = (p) => p, // функция подготовки параметров перед отправкой на бек,
    // может пригодится если прописаны параметры через addApiParams, так же используется
    // в функциях-обертках вроде @see PeriodFilter
    isEmptyData = (data) => !data
      || (Array.isArray(data) && data.length === 0)
      || (typeof data == 'object' && Object.keys(data).length == 0), // проверка на приход пустых данных с бека
    method = 'post', // метод запроса к беку
  },
) => class {
  dates = computed(
    () => ({
      from: this.dateFrom ? this.dateFrom.format(BACK_DATE_FORMAT) : null,
      to: this.dateTo ? this.dateTo.format(BACK_DATE_FORMAT) : null,
    }),
    {
      equals: comparer.shallow,
    },
  );

  // передача url в виджеты для запроса репортов
  apiUrl = apiUrl;

  // Для отображения списка фильтрации виджета
  @observable
  showFilterInfo = false;

  // Имя организации когда в фильтре выбрана только одна организация
  @observable
  orgName = '';

  // ключ значение ид организации и наименование выбранных для фильтрации
  @observable
  organizationNames = {};

  // количество и тип выбранных организаций в фильтре
  @observable
  checkedOrganizations = {type: 'complex', count: 0};

  // ссылка на div окружающий виджет
  ref = React.createRef();

  // ссылка на экземпляр компонента вьюхи
  viewRef = React.createRef();

  // начал ли виджет посылать запросы на бек
  @observable
  started = false;

  @observable
  active = false;

  @observable complex = [];
  @observable grbs = [];
  @observable orgId = [];
  @observable showTextBoundary = true;
  @observable clickToggleBoundary = false;
  @observable defaultPeriod = {};

  @computed get showText() {
    return this.showTextBoundary && this.active;
  }

  @computed get empty() {
    return isEmptyData(this.data);
  }

  check;

  _isLoop = false;
  isLoopMoscow = false;
  isLoopComplex = false;
  isLoopGRBS = false;
  isLoopNoFilter = false;

  constructor(type, key, id, title, typeId, params = {}, isCompared) {
    const
      period = params.period || startPeriod;

    this.check = {
      day: 0,
      week: 0,
      custom: 0,
    };

    const startDate = params.dateFrom
      ? moment(params.dateFrom || dateFrom)
      : getPeriodByType(period).startDate;
    const endDate = params.dateTo
      ? moment(params.dateTo || dateTo)
      : getPeriodByType(period).endDate;

    if (params.addApiParams) {
      params.addApiParams.push('complex');
      params.addApiParams.push('grbs');
      params.addApiParams.push('orgId');
    }

    const properties = {
      type,
      key,
      id,
      position,
      title,
      typeId,
      isCompared,
      loading: true,
      error: false,
      data: {},
      period: startPeriod,
      ...params,
      dateFrom: startDate.clone(),
      dateTo: endDate.clone(),
    };

    if (properties.defaultPeriod && properties.defaultPeriod.startDate) {
      properties.defaultPeriod.startDate = moment(properties.defaultPeriod.startDate);
    }
    if (properties.defaultPeriod && properties.defaultPeriod.endDate) {
      properties.defaultPeriod.endDate = moment(properties.defaultPeriod.endDate);
    }

    // проверяем размеры на "не меньше минимальных".
    // если рабочий стол был слишком узким грид сожмёт виджет уже чем указанные минимальные размеры
    // и потом это попадает в сохраненное состояние.
    // далее на другом компьютере это может быть восстановлено
    properties.position.w = Math.max(properties.position.w, properties.position.minW);
    properties.position.h = Math.max(properties.position.h, properties.position.minH);

    // переносим учитывая возможные гет свойства из addFields, что бы они стали @computed
    for (const field of Object.getOwnPropertyNames(addFields)) {
      if (Object.getOwnPropertyDescriptor(addFields, field).hasOwnProperty('value') && typeof this[field] !== 'function') {
        // простые свойства
        properties[field] = params.hasOwnProperty(field)
          ? params[field]
          : addFields[field];
      } else {
        // геттеры и функции
        Object.defineProperty(properties, field, Object.getOwnPropertyDescriptor(addFields, field));
      }
    }

    extendObservable(
      this,
      properties,
    );
  }

  sleep() {
    const addFieldsSave = {};

    for (const field of Object.getOwnPropertyNames(addFields)) {
      // пропускаем геттеры и функции
      if (Object.getOwnPropertyDescriptor(addFields, field).hasOwnProperty('value') && typeof this[field] !== 'function') {
        addFieldsSave[field] = this[field];
      }
    }

    return {
      type: this.type,
      key: this.key,
      id: this.id,
      title: this.title,
      position: this.position,
      period: this.period,
      typeId: this.typeId,
      active: this.active,
      orgName: this.orgName,
      organizationNames: this.organizationNames,
      checkedOrganizations: this.checkedOrganizations,
      isCompared: this.isCompared,
      defaultPeriod: this.defaultPeriod,

      dateFrom: this.dateFrom.startOf('day').format(),
      dateTo: this.dateTo.startOf('day').format(),

      ...addFieldsSave,
    };
  }

  prepareParams() {
    const params = {
      dateFrom: this.dates.get().from,
      dateTo: this.dates.get().to,
    };

    for (const key of addApiParams) {
      params[key] = this[key];
    }

    prepareApiParams(params);

    const nonEmpty = {};

    for (const [k, v] of Object.entries(params)) {
      if (v) {
        nonEmpty[k] = v;
      }
      if (k === 'sortOrder') {
        nonEmpty[k] = v;
      }
    }

    return nonEmpty;
  }

  start() {
    if (!this.started) {
      autorun(this.load, { delay: 100 });
    }

    this.started = true;
  }

  cancelRequest() {
    if (this.cancel) {
      this.cancel.cancel();
      this.started = false;
      this.loading = false;
    }
  }

  get isLoop() {
    return this._isLoop;
  }

  set isLoop(isLoop) {
    this._isLoop = isLoop;
  }

  setLocalDate() {
    const periodDate = appStore.boards.periodDate;
    this.setDate({
      startDate: periodDate.startDate.clone(),
      endDate: periodDate.endDate.clone(),
      type: this.period,
    }, false);
  }

  @action
  checkData() {
    let prevFrom = this.dateFrom.clone().utc(true);
    let prevTo = this.dateTo.clone().utc(true);
    if (this.period !== 'halfYear' && this.period !== 'custom') {
      prevFrom = this.dateFrom.clone().add(-1, `${this.period}s`).utc(true);
      prevTo = prevFrom.clone().endOf(this.period).utc(true);
    }

    if (this.period === 'halfYear') {
      prevFrom = this.dateFrom.clone().add(-2, 'quarters');
      prevTo = this.dateTo.clone().add(-2, 'quarters');
    }

    if (this.period === 'custom') {
      let duration = moment.duration(this.dateFrom.diff(this.dateTo)).asDays();
      if (duration === 0) duration = -1;
      prevFrom = this.dateFrom.clone().add(duration, 'days');
      prevTo = this.dateTo.clone().add(duration, 'days');
    }

    return { prevFrom, prevTo };
  }

  getMaxCheck = () => {
    return this.typeId.match('7.') || this.typeId.match('6.')
      ? moment(MAX_CHECK_DATE_PURCHASES)
      : moment(MAX_CHECK_DATE);
  }

  getCustomMaxByDurationPeriod = (start, end, isMoscow = false) => {
    const duration = moment.duration(end.diff(start)).asDays();
    const maxCheck = this.getMaxCheck();
    switch (true) {
      case duration >= 0 && duration <= 3 && !isMoscow: return 365;
      case duration > 3 && duration <= 14 && !isMoscow: return 52;
      default: return maxCheck;
    }
  }

  getIsContinue = (maxCheck) => {
    const { prevTo } = this.checkData();
    return moment.isMoment(maxCheck)
      ? prevTo.isAfter(maxCheck)
      : this.check[this.period] < maxCheck;
  }

  continuedCheckData = (maxCheck) => {
    if (!moment.isMoment(maxCheck)) this.check[this.period] = this.check[this.period] + 1;
    const { prevFrom, prevTo } = this.checkData();
    this.setDate({
      startDate: prevFrom,
      endDate: prevTo,
      type: this.period,
    });
  }

  load = async () => {
    if (testData) {
      this.loading = false;
      this.data = testData;
      return;
    }

    this.loading = true;

    // отменяем если запрос уже пошёл
    if (this.cancel) {
      this.cancel.cancel();
    }
    this.cancel = axios.CancelToken.source();

    const params = this.prepareParams();

    try {
      const isGet = method === 'get';
      const res = await axios.request(
        {
          method,
          url: apiUrl,
          [isGet ? 'params' : 'data']: isGet ? params : (new URLSearchParams(params)).toString(),
          cancelToken: this.cancel.token,
        },
      );

      // проверяем есть ли данные и ищем до положительного ответа либо до ограничения поиска
      if (!this.isLoop) {
        let maxCheck = this.getMaxCheck();
        if (checkPeriodDayOrWeek(this.period)) {
          maxCheck = MAX_CHECK_COUNT[this.period];
        }
        if (checkPeriodDayOrWeek(this.period)
          && checkAllMoscow(this.complex, this.grbs, this.orgId)) {
          maxCheck = this.getMaxCheck();
        }
        if (this.period === 'custom') {
          let isMoscow = false;
          if (checkAllMoscow(this.complex, this.grbs, this.orgId)) {
            isMoscow = true;
          }
          maxCheck = this.getCustomMaxByDurationPeriod(this.dateFrom, this.dateTo, isMoscow);
        }

        if (isEmptyData(res.data.data) && this.hasFilter && this.started) {
          if (checkAllMoscow(this.complex, this.grbs, this.orgId)) {
            const isContinue = this.getIsContinue(maxCheck);
            if (isContinue && !this.isLoopMoscow) {
              this.continuedCheckData(maxCheck);
            } else {
              this.isLoop = true;
              this.isLoopMoscow = true;
              if (!moment.isMoment(maxCheck)) this.check[this.period] = 0;
              this.setLocalDate();
            }
          }
          if (checkComplex(this.complex, this.grbs, this.orgId)) {
            const isContinue = this.getIsContinue(maxCheck);
            if (isContinue && !this.isLoopComplex) {
              this.continuedCheckData(maxCheck);
            } else {
              this.isLoopMoscow = false;
              this.complex = [];
              this.grbs = [];
              this.orgId = [];
              this.setOrganizationNames({});
              this.setCheckedOrganization({ count: 0, type: 'complex' });
              this.isLoopComplex = true;
              if (!moment.isMoment(maxCheck)) this.check[this.period] = 0;
              this.setLocalDate();
            }
          }
          if (checkGRBS(this.grbs, this.orgId)) {
            const isContinue = this.getIsContinue(maxCheck);
            if (isContinue && !this.isLoopGRBS) {
              this.continuedCheckData(maxCheck);
            } else {
              this.grbs.forEach((item) => {
                const parentId = appStore.companyFilter.grbs.list.find((el) => el.orgId === item).parentId;
                if (!this.complex.find((el) => el === parentId)) {
                  this.complex.push(parentId);
                }
              });
              this.isLoopComplex = false;
              const checked = appStore.companyFilter.definitionCheckedCount(this.complex, [], []);
              const list = appStore.companyFilter.getOrganizationList([...this.complex]);
              this.setCheckedOrganization(checked);
              this.setOrganizationNames(list);
              this.grbs = [];
              this.orgId = [];
              if (!moment.isMoment(maxCheck)) this.check[this.period] = 0;
              this.isLoopGRBS = true;
              this.setLocalDate();
            }
          }
          if (checkOrganizations(this.orgId)) {
            const isContinue = this.getIsContinue(maxCheck);
            if (isContinue && !this.isLoopOrganization) {
              this.continuedCheckData(maxCheck);
            } else {
              this.isLoopGRBS = false;
              this.isLoopOrganization = false;
              this.orgId.forEach((item) => {
                const parentId = appStore.companyFilter.company.list.find((el) => el.orgId === item).parentId;
                if (!this.grbs.find((el) => el === parentId)) {
                  this.grbs.push(parentId);
                }
              });
              const checked = appStore.companyFilter.definitionCheckedCount(this.complex, this.grbs, []);
              const list = appStore.companyFilter.getOrganizationList([...this.complex, ...this.grbs]);
              this.setCheckedOrganization(checked);
              this.setOrganizationNames(list);
              this.orgId = [];
              if (!moment.isMoment(maxCheck)) this.check[this.period] = 0;
              this.isLoopOrganization = true;
              this.setLocalDate();
            }
          }
        }
        if (isEmptyData(res.data.data) && !this.hasFilter && this.started) {
          const isContinue = this.getIsContinue(maxCheck);
          if (isContinue && !this.isLoopNoFilter) {
            this.continuedCheckData(maxCheck);
          } else {
            this.isLoop = true;
            this.isLoopNoFilter = true;
            if (!moment.isMoment(maxCheck)) this.check[this.period] = 0;
            this.setLocalDate();
          }
        }
      }

      this.data = res.data.data;
      this.error = false;
      this.loading = this.empty && !this.isLoop;
    } catch (e) {
      if (!axios.isCancel(e)) {
        this.error = true;
        this.loading = false;
        throw e;
      }
    }
  };

  @action
    toggleFilterInfo = () => {
      this.showFilterInfo = !this.showFilterInfo
    }

  @action
    setOrganizationNames = (list) => {
      this.organizationNames = list;
    }

  @action
    setCheckedOrganization = (checked) => {
      this.checkedOrganizations = checked;
    }

  @action setDate({ startDate, endDate, type }, toggleIsLoop = true) {
    this.dateFrom = startDate;
    this.dateTo = endDate;
    this.period = type;
    if (toggleIsLoop) {
      this.isLoop = false;
      this.isLoopGRBS = false;
      this.isLoopComplex = false;
      this.isLoopOrganization = false;
      this.isLoopMoscow = false;
      this.isLoopNoFilter = false;
    }
  }

  @action matchOrgToDefaultOrg = (orgs) => {
    if (!this.hasFilter) return false;
    return !getIsEqualFilter(this, orgs);
  }

  @action matchDateToDefaultDate = (date) => {
    return getIsDifferentDate(this, date);
  }

  @action getTextForBoundary = (defaultDate, defaultOrganization, allCompany) => {
    return getTextForBoundaryByWidget(this, defaultOrganization, allCompany, defaultDate);
  }

  @action toggleTextBoundary = () => {
    this.showTextBoundary = !this.showTextBoundary;
    this.clickToggleBoundary = true;
  }
};

// export default widgetStoreFabric;
