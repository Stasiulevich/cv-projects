import { action, computed, makeObservable, observable } from 'mobx';
import { Requestable } from '@store/common/Requestable';
import { RootStore } from '@store/rootStore';
import { ContractClaimStore } from '@store/servicesContractCard/childStores/contractClaimStore';
import {
  getContractDataByDocumentCardId,
  getGeneralClaimInfo,
} from '@api/servicesContracts/servicesContracts';
import HistoryChangesClaimStore from '@store/servicesContractCard/childStores/historyChangesClaimStore';
import BankSignerStore from '@store/servicesContractCard/childStores/bankSignerStore';
import AgentSignerStore from '@store/servicesContractCard/childStores/agentSignerStore';
import AgentBlockStore from '@store/servicesContractCard/childStores/agentBlockStore';
import BankRequisitesStore from '@store/servicesContractCard/childStores/bankRequisitesStore';
import BankDataStore from '@store/servicesContractCard/childStores/bankDataStore';
import {
  initClaimStatusDetailList,
  initContactDetailList,
  initContractDetailList,
} from '@store/servicesContractCard/helpers/detailList';
import { ContactsBlockStore } from '@store/servicesContractCard/childStores/contactsBlockStore';
import FilesClaimStore from '@store/servicesContractCard/childStores/filesClaimStore';
import AvailableStatesStore from '@store/servicesContractCard/childStores/availableStatesStore';
import { TContractClaimApi } from '@api/servicesContracts/types';
import DocumentsBlockStore from '@store/servicesContractCard/childStores/documentsBlock';
import { servicesContractStateDescription } from '@api/servicesContracts/enums';
import { getAgentNda } from '@api/agentsRegistryCard';
import { TLabeledValues } from '~types/dto/TContract';
import { FetchRequestStatus } from '~types/common';

export class ServicesContractCardStore extends Requestable {

  _claimData: TContractClaimApi = {} as TContractClaimApi;

  _claimId = '';

  _servicesContractState: number | null = null;

  _documentCardId: null | undefined | number;

  cities: any = [];

  // вложенные сторы каждого блока
  contractClaim: ContractClaimStore;

  availableStatesStore: AvailableStatesStore;

  bankRequisites: BankRequisitesStore;

  bankDataStore: BankDataStore;

  agentBlock: AgentBlockStore;

  agentSigner: AgentSignerStore;

  bankSigner: BankSignerStore;

  documentsBlockStore: DocumentsBlockStore;

  historyChanges: HistoryChangesClaimStore;

  contactsBlock: ContactsBlockStore;

  filesClaim: FilesClaimStore;

  constructor(rootStore: RootStore) {
    super(rootStore);
    makeObservable(this, {
      fetchServicesContractGeneralInfo: action,
      fetchClaimData: action,

      _claimData: observable,
      setClaimData: action,

      _claimId: observable,
      setClaimId: action,
      claimId: computed,

      _servicesContractState: observable,
      setServicesContractState: action,
      servicesContractState: computed,

      _documentCardId: observable,
      setDocumentCardId: action,

      contractDetailsList: computed,
      contactsDetailsList: computed,
      claimStatusDetailsList: computed,
    });
    this.availableStatesStore = new AvailableStatesStore(rootStore);
    this.contactsBlock = new ContactsBlockStore(rootStore);
    this.contractClaim = new ContractClaimStore(rootStore);
    this.bankRequisites = new BankRequisitesStore(rootStore);
    this.agentBlock = new AgentBlockStore(rootStore);
    this.bankDataStore = new BankDataStore(rootStore);
    this.agentSigner = new AgentSignerStore(rootStore);
    this.bankSigner = new BankSignerStore(rootStore);
    this.documentsBlockStore = new DocumentsBlockStore(rootStore);
    this.historyChanges = new HistoryChangesClaimStore(rootStore);
    this.filesClaim = new FilesClaimStore(rootStore);
  }

  setClaimData(values: TContractClaimApi) {
    this._claimData = values;
  }

  setClaimId(id: string) {
    this._claimId = id;
  }

  setDocumentCardId(id: number | undefined | null) {
    this._documentCardId = id;
  }

  setServicesContractState(state: number) {
    this._servicesContractState = state || null;
  }

  async fetchServicesContractGeneralInfo(id: string) {
    this.setRequestStatus(FetchRequestStatus.loading);
    try {
      await Promise.all([
        this.fetchClaimData(id),
        this.availableStatesStore.fetchAvailableStates(id),
      ]);
      this.setRequestStatus(FetchRequestStatus.finished);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  async fetchClaimData(id: string) {
    try {
      let result;
      const response = await this.wrapApiRequest(getGeneralClaimInfo(id));
      result = { ...response };
      this.setDocumentCardId(response.documentCardId);
      if (this.documentCardId) {
        const response = await this.wrapApiRequest(getContractDataByDocumentCardId(this.documentCardId));
        result = { ...result, ...response };
      }
      if (result.agentId) {
        const nda = await this.wrapApiRequest(getAgentNda(result.agentId));
        result = { ...result, ...nda };
      }
      this.setClaimData(result);
      this.setServicesContractState(servicesContractStateDescription[ result.state ]);
      this.contactsBlock.fillFromApi(result);
      this.contractClaim.fillFromApi(result);

    } catch (e) {
      this.handleRequestError(e);
    }
  }

  get claimId() {
    return this._claimId;
  }

  get claimData(): TContractClaimApi {
    return this._claimData;
  }

  get documentCardId() {
    return this._documentCardId;
  }

  // detailsList data
  get claimStatusDetailsList(): TLabeledValues[] {
    return initClaimStatusDetailList.map((list) => ({
      ...list,
      value: list.getValue
        ? list.getValue(this.claimData[ list.key as keyof TContractClaimApi ])
        : (this.claimData[ list.key as keyof TContractClaimApi ] as string) || '',
    }));
  }

  get contactsDetailsList(): TLabeledValues[] {
    return initContactDetailList.map((list) => ({
      ...list,
      value: list.getValue
        ? list.getValue(this.claimData[ list.key as keyof TContractClaimApi ], this.claimData)
        : (this.claimData[ list.key as keyof TContractClaimApi ] as string) || '',
    }));
  }


  get contractDetailsList(): TLabeledValues[] {
    return initContractDetailList.map((list) => ({
      ...list,
      value: list.getValue
        ? list.getValue(this.claimData[ list.key as keyof TContractClaimApi ])
        : (this.claimData[ list.key as keyof TContractClaimApi ] as string) || '',
    }));
  }

  get servicesContractState() {
    return this._servicesContractState;
  }
}
