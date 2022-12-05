import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from '@store/rootStore';
import { Requestable } from '@store/common/Requestable';
import { getAgentSigner } from '@api/servicesContracts/servicesContracts';
import { TAgentSigner } from '@api/contracts/types';
import { initAgentSignerDetailList } from '@store/servicesContractCard/helpers/detailList';
import { TLabeledValues } from '~types/dto/TContract';


export default class AgentSignerStore extends Requestable {

  _agentSignerData: TLabeledValues[] = initAgentSignerDetailList;

  constructor(rootStore: RootStore) {
    super(rootStore);
    makeObservable(this,
      {
        _agentSignerData: observable,
        agentSignerData: computed,
        setAgentSignerData: action,
      });
  }

  async fetchData(contractId: number) {
    try {
      const result = await this.wrapApiRequest(getAgentSigner(contractId));
      this.setAgentSignerData(result);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  setAgentSignerData(values: TAgentSigner) {
    this._agentSignerData = initAgentSignerDetailList.map((list) => ({
      ...list,
      value: list.getValue
        ? list.getValue(values[ list.key as keyof TAgentSigner ] || '')
        : values[ list.key as keyof TAgentSigner ] || '',
    }));
  }

  get agentSignerData(): TLabeledValues[] {
    return this._agentSignerData;
  }
}
