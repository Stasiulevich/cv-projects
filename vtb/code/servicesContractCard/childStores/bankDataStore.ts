import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from '@store/rootStore';
import { Requestable } from '@store/common/Requestable';
import { PaginationStore } from '@store/pagination';
import { getBankData, getBankDataDefault } from '@api/servicesContracts/servicesContracts';
import { TBankAttributes, TBankData } from '@api/contracts/types';
import {
  initBankDetailListWithDocumentCardId,
  initBankDetailListWithOutDocumentCardId,
} from '@store/servicesContractCard/helpers/detailList';
import { TLabeledValues } from '~types/dto/TContract';
import { FetchRequestStatus } from '~types/common';


export default class BankDataStore extends Requestable {

  _bankData: TLabeledValues[] = initBankDetailListWithOutDocumentCardId;

  pagination: PaginationStore = new PaginationStore();

  constructor(rootStore: RootStore) {
    super(rootStore);
    makeObservable(this, {
      fetchFromServicesContract: action,
      fetchFromContract: action,

      _bankData: observable,
      bankData: computed,
      setBankData: action,
    });
  }

  async fetchFromServicesContract() {
    try {
      this.setRequestStatus(FetchRequestStatus.loading);
      const { documentCardId } = this._rootStore.servicesContractCardStore;
      if (documentCardId) {
        const result = await this.wrapApiRequest(getBankData(documentCardId));
        this.setBankData(result, initBankDetailListWithDocumentCardId);
      } else {
        const result = await this.wrapApiRequest(getBankDataDefault());
        this.setBankData(result.attributes[ 0 ], initBankDetailListWithOutDocumentCardId);
      }
      this.setRequestStatus(FetchRequestStatus.finished);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  async fetchFromContract(contractId: number) {
    try {
      this.setRequestStatus(FetchRequestStatus.loading);
      const result = await this.wrapApiRequest(getBankData(contractId));
      this.setBankData(result, initBankDetailListWithDocumentCardId);
      this.setRequestStatus(FetchRequestStatus.finished);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  setBankData(values: TBankData | TBankAttributes, store: TLabeledValues[]) {
    this._bankData = store.map((list) => ({
      ...list,
      value: values[ list.key as keyof TBankData & keyof TBankAttributes ] || '',
    }));
  }

  get bankData(): TLabeledValues[] {
    return this._bankData;
  }
}
