import { RootStore } from '@store/rootStore';

import EtceteraStore from '@store/servicesContractCard/childStores/documentsBlock/etceteraStore';

class DocumentsBlockStore {

  etceteraStore: EtceteraStore;

  constructor(rootStore: RootStore) {
    this.etceteraStore = new EtceteraStore(rootStore);
  }
}

export default DocumentsBlockStore;