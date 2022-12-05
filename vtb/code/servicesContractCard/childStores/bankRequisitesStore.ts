import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from '@store/rootStore';
import { Requestable } from '@store/common/Requestable';
import { TBankRequisites } from '@api/contracts/types';
import { getBankRequisites } from '@api/servicesContracts/servicesContracts';
import { initBankRequisitesDetailList } from '@store/servicesContractCard/helpers/detailList';
import { TLabeledValues } from '~types/dto/TContract';


export default class BankRequisitesStore extends Requestable {

  _bankRequisitesData: TLabeledValues[] = initBankRequisitesDetailList;

  constructor(rootStore: RootStore) {
    super(rootStore);
    makeObservable(this, {
      _bankRequisitesData: observable,
      bankRequisitesData: computed,
      setBankRequisitesData: action,
    });
  }

  async fetchData(contractId: number) {
    try {
      const result = await this.wrapApiRequest(getBankRequisites(contractId));
      this.setBankRequisitesData(result);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  setBankRequisitesData(values: TBankRequisites) {
    this._bankRequisitesData = initBankRequisitesDetailList.map((list) => ({
      ...list,
      value: values[ list.key as keyof TBankRequisites ] || '',
    }));
  }

  get bankRequisitesData(): TLabeledValues[] {
    return this._bankRequisitesData;
  }
}
