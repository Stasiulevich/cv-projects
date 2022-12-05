import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from '@store/rootStore';
import { Requestable } from '@store/common/Requestable';
import { getAgentBlockData } from '@api/servicesContracts/servicesContracts';
import { TAgentBlock } from '@api/contracts/types';
import { AgentBlockEnum } from '@api/contracts/enums';
import { initAgentDetailList } from '@store/servicesContractCard/helpers/detailList';
import { TLabeledValues } from '~types/dto/TContract';

export default class AgentBlockStore extends Requestable {

  _agentBlockData: TLabeledValues[] = initAgentDetailList;

  constructor(rootStore: RootStore) {
    super(rootStore);
    makeObservable(this, {
      _agentBlockData: observable,
      agentBlockData: computed,
      setAgentBlockData: action,
      initAgentBlock: action,
    });
  }

  async fetchData(contractId: number) {
    try {
      const result = await this.wrapApiRequest(getAgentBlockData(contractId));
      this.setAgentBlockData(result);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  setAgentBlockData(values: TAgentBlock) {
    this._agentBlockData = initAgentDetailList.map((list) => ({
      ...list,
      value: list.getValue
        ? list.getValue(values[ list.key as keyof TAgentBlock ] || '')
        : values[ list.key as keyof TAgentBlock ] || '',
    }));
  }

  initAgentBlock() {
    const initData = {
      [ AgentBlockEnum.companyName ]: this._rootStore.servicesContractCardStore.claimData.organization,
      [ AgentBlockEnum.inn ]: this._rootStore.servicesContractCardStore.claimData.taxpayerIdentificationNumber,
    };
    this.setAgentBlockData(initData as TAgentBlock);
  }

  get agentBlockData(): TLabeledValues[] {
    return this._agentBlockData;
  }
}
