import { action, computed, extendObservable, observable } from 'mobx';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import { WIDGET_BY_TYPE, WIDGETS } from './widgetTypes';

export class SingleBoardStore {

  notSaveWidgets = [];

  constructor({ id, title, active, isBlocked = false, widgets = [], type = '', indexActiveWidget }, user) {
    extendObservable(
      this,
      {
        id,
        isBlocked,
        title,
        active,
        type,
        indexActiveWidget,
        widgetsList: [],
        currentIndex: 0,
      },
    );

    const filteredWidgets = widgets.filter((w) => !WIDGET_BY_TYPE[w.type].hidden);

    if (indexActiveWidget > filteredWidgets.length - 1
      || !filteredWidgets[indexActiveWidget].active) {
      this.setActiveIndex(0);
      filteredWidgets[0].active = true;
    }

    filteredWidgets.forEach((sleeperWidget) => {
      if (WIDGET_BY_TYPE[sleeperWidget.type].hidden) return;
      if (WIDGET_BY_TYPE[sleeperWidget.type].title !== sleeperWidget.title) {
        const titleWidget = WIDGET_BY_TYPE[sleeperWidget.type].title;
        this.createWidget(sleeperWidget.type, { ...sleeperWidget, title: titleWidget });
      } else {
        this.createWidget(sleeperWidget.type, sleeperWidget);
      }
    });

    this.user = user;

    this.notSaveWidgets = _.pullAllBy(this.allowedWidgets, widgets, 'type');

    this.notSaveWidgets.forEach((widget) => {
      this.createWidget(widget.type, {});
    });

  }

  @observable carouselRef = null;

  @computed get allowedWidgets() {
    return WIDGETS.filter(({ permission }) => this.user.widgetsPermissions
      .includes(permission))
      .find((el) => el.id === this.type)
      .widgets
      .filter((el) => !el.hidden);
  }

  @computed get widgets() {
    return _.sortBy(this.widgetsList, 'typeId');
  }

  sleep(){
    return {
      id: this.id,
      title: this.title,
      active: this.active,
      isBlocked: this.isBlocked,
      type: this.type,
      indexActiveWidget: this.indexActiveWidget,

      widgets: this.widgets.map(widget => widget.sleep()),
    };
  }

  @action createWidget(widgetType, params = {}, isCompared = false) {
    const id = uuid();
    const key = id;
    const widgetTypeDescription = WIDGET_BY_TYPE[widgetType];
    const title = widgetTypeDescription.title;
    const typeId = widgetTypeDescription.id;

    if (widgetTypeDescription) {
      this.widgetsList.push(
        new widgetTypeDescription.store(
          widgetType,
          key,
          id,
          title,
          typeId,
          params,
          isCompared,
        ),
      );
    } else console.warn(`Виджет с типом "${widgetType}" не указан в widgetTypes.`);
  }

  @action removeWidget(widgetKey) {
    this.widgetsList = this.widgets.filter(widget => widget.key !== widgetKey)
  }

  @action setActiveWidget(next) {
    this.widgets[this.indexActiveWidget].active = false;
    this.widgets[this.indexActiveWidget].showTextBoundary = true;
    this.widgets[next].active = true;
    this.indexActiveWidget = next;
  }

  @action setActiveIndex(index) {
    this.indexActiveWidget = index;
  }
}
