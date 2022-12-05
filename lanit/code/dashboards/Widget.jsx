import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { WidgetContext } from 'context/widget';
import { Loader } from 'components/controls/Loader/Loader';
import { Error } from 'components/controls/Error/Error';
import CompanyList from 'components/controls/CompanyList/CompanyList';
import TextBoundary from 'components/controls/TextBoundary/TextBoundary';
import { appStore } from 'stores/app.store';
import './widget.scss';

/**
 * Компонент выводящий виджет.
 *
 * - выводит виджет и шапку
 * - в случае ошибки бека или ошибки рендера вьюхи в нижней части покажет сообщение об ошибки
 * - в случае ошибки в рендере шапки, покажет сообщение об ошибки на весь виджет
 * - показывает лоадер во время загрузки
 * - показывает сообщение "Нет данных" на основе функции переданной в параметре isEmptyData при создании стора через
 * widgetStoreFabric
 *
 * ℹ для передачи параметров между шапкой и вьюхой добавьте поле через addFields у widgetStoreFabric при создании
 * стора.
 * */
export const Widget = observer(
  class extends React.Component {
    static propTypes = {
      type: PropTypes.object.isRequired,
      widget: PropTypes.object.isRequired,
    };

    state = {
      error: false,
    };

    static getDerivedStateFromError() {
      return { error: true };
    }

    checkBoundary = (defaultDate, defaultOrganization) => {
      const { complex, grbs, orgId } = this.props.widget;
      const isChecked = complex.length !== 0 || grbs.length !== 0 || orgId.length !== 0;
      const isDefaultChecked =
        defaultOrganization.complex.length === 0 &&
        defaultOrganization.grbs.length === 0 &&
        defaultOrganization.orgId.length === 0;
      if (!this.props.widget.hasFilter && !isDefaultChecked) return true;
      if (this.props.widget.matchDateToDefaultDate(defaultDate)) return true;
      if (this.props.widget.matchOrgToDefaultOrg(defaultOrganization) && isChecked) return true;
      return false;
    };

    render() {
      const widget = this.props.widget;
      const error = this.state.error;
      const View = this.props.type.view;
      const Header = this.props.type.header;
      const showBoundary = this.checkBoundary(appStore.boards.periodDate, appStore.boards.filterCompany);

      return (
        <WidgetContext.Provider value={widget}>
          <section className={`widget ${View.className || ''}`}>
            {error ? ( // ошибка рендера вне вьюхи виджета
              <div className="widget-overlay widget-overlay-error">
                <Error />
              </div>
            ) : (
              <>
                {!widget.loading ? (
                  <header>
                    <Header widget={widget} />
                  </header>
                ) : null}
                {widget.error ? (
                  <div className="widget-content-msg">
                    <Error />
                  </div>
                ) : widget.loading ? ( // загрузка
                  <div className="widget-content-msg">
                    <Loader />
                  </div>
                ) : widget.empty ? (
                  <div className="widget-content-msg widget-nodata">Нет данных</div>
                ) : widget.showFilterInfo ? ( // показ информации о фильтрации виджета
                  <CompanyList widget={widget} />
                ) : (
                  <WidgetViewFuse>
                    <>
                      {!this.props.print && (
                        <TextBoundary clicked={widget.toggleTextBoundary} show={widget.showText && showBoundary}>
                          {widget.getTextForBoundary(
                            appStore.boards.periodDate,
                            appStore.boards.filterCompany,
                            appStore.boards.companyFilter.allOrganization
                          )}
                        </TextBoundary>
                      )}
                      {this.props.children}
                    </>
                  </WidgetViewFuse>
                )}
              </>
            )}
          </section>
        </WidgetContext.Provider>
      );
    }
  }
);

// в случае ошибки во вьюхе, покажем сообщение, но не накроем хеадер
class WidgetViewFuse extends React.Component {
  state = { error: false };

  static getDerivedStateFromError() {
    return { error: true };
  }

  render() {
    return this.state.error ? (
      <div className="widget-content-msg">
        <Error />
      </div>
    ) : (
      this.props.children
    );
  }
}
