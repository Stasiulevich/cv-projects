import { Requestable } from '@store/common/Requestable';
import { RootStore } from '@store/rootStore';
import { action, computed, makeObservable, observable } from 'mobx';
import { TMetadata } from '@store/agentSOKCard/types';
import { PrintedFormTypeEnum, TFilesCardMetadataApi } from '@api/commonCard/types';
import { cardMetadataAPI, generatePrintedFormDoc } from '@api/commonCard/commonCard';
import { saveAs } from 'file-saver';
import { FetchRequestStatus } from '~types/common';

export default class FilesClaimStore extends Requestable {
  _metaData: TMetadata[] = [];

  _bitesForFileDownload: any = '';

  constructor(rootStore: RootStore) {
    super(rootStore);
    makeObservable(this, {
      _metaData: observable,
      metaData: computed,
      fillMetadata: action,
      _bitesForFileDownload: observable,
      bitesForFileDownload:computed,
      loadFileLocal: action
    });
  }

  fillMetadata(apiData: TFilesCardMetadataApi): this {
    const filePrepared = apiData.files.map((file) => ({
      ...file,
      id: String(file.id),
      number: file.number || '',
      form: file.form || '',
    }));
    this._metaData = filePrepared;
    return this;
  }

  async fetchFilesCard(id: string) {
    this.setRequestStatus(FetchRequestStatus.loading);
    const metaData = await this.wrapApiRequest(cardMetadataAPI(id));
    this.fillMetadata(metaData);
    this.setRequestStatus(FetchRequestStatus.finished);
  }

  setBitesForFileDownload(bites: any) {
    this._bitesForFileDownload = bites;
  }

  async fetchGeneratePrintedFormDoc(type: string, callBack: () => void) {
    const id = this._rootStore.servicesContractCardStore.claimData.documentCardId;
    if (!id) {
      return;
    }

    this.setRequestStatus(FetchRequestStatus.loading);
    try {
      const bites = await this.wrapApiRequest(
        generatePrintedFormDoc(
          String(id),
          PrintedFormTypeEnum[
            type === 'ООО' ? 'SERVICE_AGREEMENT_FOR_JP' : 'SERVICE_AGREEMENT_FOR_IE'
          ],
        ),
      );
      this.setBitesForFileDownload(bites);
      callBack();
      this.setRequestStatus(FetchRequestStatus.finished);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  loadFileLocal() {
    saveAs(this._bitesForFileDownload, 'Сформированный документ.docx');
  }

  get metaData() {
    return this._metaData;
  }

  get bitesForFileDownload() {
    return this._bitesForFileDownload;
  }

}
