import { action, computed, observable, makeObservable } from 'mobx';

import { RootStore } from '@store/rootStore';
import { ApiError } from '@features/classes';
import { notify } from '@vtb-ib/ui-kit';
import { ReactNode } from 'react';
import { NotificationStatus } from '@vtb-ib/ui-kit/lib/esm/ui-kit/src/Notification/types';
import { TLinkSettings, TRequestErrorHandleOptions } from '@store/common/types';
import {
  TWrapApiRequestOptions,
  FetchRequestStatus,
  APIWrap,
  APIWrapFail, APIWrapSuccess,
} from '~types/common';

import styles from '../../components/AppLayout/styles.scss';


const { NODE_ENV } = process.env;

const IS_DEV = NODE_ENV !== 'production';

// Включаем их потому что для этих статусов нет макетов с ошибками.
// После уточнений требований можно будет убрать эти статусы
const PERMITTED_STATUS_CODE = [401, 400, 405, 504, 415, 422, 425];

// default request error notification options
const defaultRequestErrorOptions: TRequestErrorHandleOptions = { backNotification: true };

/**
 * Класс-расширение для сторов, которые могут запрашивать данные. Оперирует только одним запросом.
 *
 */
export class Requestable {
  protected _rootStore: RootStore;

  requestStatus: FetchRequestStatus = FetchRequestStatus.notStarted;

  _requestErrorCode: null | number = null;

  constructor(rootStore: RootStore) {
    this._rootStore = rootStore;
    makeObservable(this, {
      requestStatus: observable,
      _requestErrorCode: observable,
      setRequestStatus: action,
      setRequestErrorCode: action,
      showNotification: action,
      requestErrorCode: computed,
      requestLoading: computed,
      requestNotStarting: computed,
      requestLoadingMore: computed,
      requestUploading: computed,
      requestSuccessful: computed,
      requestFailed: computed,
      requestIsFinished: computed,
    });
  }

  setRequestStatus(status: FetchRequestStatus) {
    this.requestStatus = status;
  }

  setRequestErrorCode(errorCode: number | null) {
    this._rootStore.config._requestErrorCode = errorCode;
  }

  get requestLoading() {
    return this.requestStatus === FetchRequestStatus.loading;
  }

  get requestNotStarting() {
    return this.requestStatus === FetchRequestStatus.notStarted;
  }

  get requestLoadingMore() {
    return this.requestStatus === FetchRequestStatus.loadingMore;
  }

  get requestUploading() {
    return this.requestStatus === FetchRequestStatus.uploading;
  }

  get requestSuccessful() {
    return this.requestStatus === FetchRequestStatus.finished;
  }

  get requestFailed() {
    return this.requestStatus === FetchRequestStatus.error;
  }

  get requestIsFinished() {
    return this.requestStatus === FetchRequestStatus.finished || this.requestStatus === FetchRequestStatus.error;
  }

  get requestErrorCode() {
    return this._requestErrorCode;
  }

  logError(error: Error | any, excludedErrorTypes?: any[]): void {
    if (!IS_DEV || excludedErrorTypes?.some(errorConstructor => error instanceof errorConstructor)) return;
    console.log(error);
  }

  static hasError<T>(result: APIWrap<T>): result is APIWrapFail {
    return Object.prototype.hasOwnProperty.call(result, 'err');
  }

  async wrapApiRequest<T,
    O extends TWrapApiRequestOptions,
    R extends (O['withWholeResponse'] extends true ? APIWrapSuccess<T> : T)>(promise: Promise<APIWrap<T>>, options: O = {} as O): Promise<R | never> {
    const {
      withWholeResponse,
    }: O = options;

    const result = await promise;

    if (Requestable.hasError(result)) {
      this.logError(result.err);
      throw result.err;
    }

    return (withWholeResponse ? result : result.data) as R;
  }

  showNotification(text: ReactNode, status: NotificationStatus, title?: ReactNode, linkSettings: TLinkSettings = {}) {
    notify().toast({
      title,
      text,
      duration: 3,
      status,
      ...(linkSettings.href && { href: linkSettings.href }),
      ...(linkSettings.linkText && { linkText: linkSettings.linkText }),
      ...(linkSettings.onLinkClick && { onLinkClick: linkSettings.onLinkClick }),
      className: styles.globalNotification,
    });
  }

  handleRequestError(error: any, handleOptions?: TRequestErrorHandleOptions ): void {
    const options = { ...defaultRequestErrorOptions, ...handleOptions };
    if (error) {
      this.setRequestErrorCode(error.status);
      this.logError(error, [ApiError]);
      this.setRequestStatus(FetchRequestStatus.error);
    }
    if (options.backNotification && PERMITTED_STATUS_CODE.includes(error.status)) {
      if (error?.additionalInformation?.length) {
        const message = error?.additionalInformation?.[ 0 ]?.message;
        if (message) {
          this.showNotification(message, 'critical', options.backNotificationTitle && error?.title);
          return;
        }
      }
      if (error?.detail) {
        this.showNotification(error?.detail, 'critical', options.backNotificationTitle && error?.title);
        return;
      }
      if (!error?.detail || !error?.additionalInformation?.length) {
        this.showNotification('Ваш запрос не может быть обработан, повторите попытку позже', 'critical');
      }
    }
  }
}
