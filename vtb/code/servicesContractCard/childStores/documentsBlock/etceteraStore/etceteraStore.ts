import { action, computed, makeObservable, observable } from 'mobx';
import { RootStore } from '@store/rootStore';
import { Requestable } from '@store/common/Requestable';
import { getClaimDocumentsEtceteraApi } from '@api/servicesContracts/servicesContracts';
import { TServicesContractDocEtc } from '@api/servicesContracts/types';
import { attachmentFileTypeDescription } from '@api/servicesContracts/enums';
import { format } from 'date-fns';
import { DATE_FORMATS } from '@api/config';
import { FetchRequestStatus } from '~types/common';

class EtceteraStore extends Requestable {

  _documentsEtcetera: TServicesContractDocEtc[] = [];

  constructor(rootStore: RootStore) {
    super(rootStore);
    makeObservable(this,
      {
        fetchDocumentsEtcetera: action,

        _documentsEtcetera: observable,
        setDocumentsEtcetera: action,
        documentsEtcetera: computed,
        adaptDataColumns: computed,

      });
  }

  async fetchDocumentsEtcetera() {
    try {
      this.setRequestStatus(FetchRequestStatus.loading);
      const { claimId } = this._rootStore.servicesContractCardStore;
      const result = await this.wrapApiRequest(getClaimDocumentsEtceteraApi(claimId));
      this.setDocumentsEtcetera(result.files);
      this.setRequestStatus(FetchRequestStatus.finished);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  setDocumentsEtcetera(data: TServicesContractDocEtc[]) {
    this._documentsEtcetera = data;
  }

  get documentsEtcetera() {
    return this._documentsEtcetera;
  }

  get adaptDataColumns() {
    return this.documentsEtcetera.map((file) => ({
      ...file,
      id: String(file.id),
      type: attachmentFileTypeDescription[ file.type ],
      createDate: file.createDate ? format(new Date(file.createDate), DATE_FORMATS.dotted) : '',
    }));
  }

}

export default EtceteraStore;