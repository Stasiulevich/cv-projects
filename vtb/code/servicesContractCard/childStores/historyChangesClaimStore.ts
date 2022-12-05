import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from '@store/rootStore';
import { Requestable } from '@store/common/Requestable';
import { PaginationStore } from '@store/pagination';
import { getHistoryData } from '@api/servicesContracts/servicesContracts';
import { THistoryClaim, THistoryClaimModel } from '@api/contracts/types';
import { FetchRequestStatus } from '~types/common';

export default class HistoryChangesClaimStore extends Requestable {
  _historyData: THistoryClaimModel[] = [];

  pagination: PaginationStore = new PaginationStore();

  constructor(rootStore: RootStore) {
    super(rootStore);
    makeObservable(this,
      {
        _historyData: observable,
        historyData: computed,
        setHistoryData: action,
        fetchData: action,
      });
  }

  async fetchData(claimId: string) {
    try {
      this.setRequestStatus(FetchRequestStatus.loading);
      const queryParams = {
        pageNumber: this.pagination.currentPage,
        pageSize: this.pagination.rowCountPerPage,
      };
      const result = await this.wrapApiRequest(getHistoryData(claimId, queryParams));
      this.pagination.setTotalPage(result.paging.totalPages);
      this.setHistoryData(result.data);
      this.setRequestStatus(FetchRequestStatus.finished);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  setHistoryData(values: THistoryClaim[]) {
    this._historyData = values.map((v) => ({
      ...v,
      id: String(v.id || ''),
    }));
  }

  get historyData(): THistoryClaimModel[] {
    return this._historyData;
  }
}
