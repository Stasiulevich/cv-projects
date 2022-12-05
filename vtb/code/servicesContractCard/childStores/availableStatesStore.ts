import { action, computed, makeObservable, observable, set } from 'mobx';
import { RootStore } from '@store/rootStore';
import { Requestable } from '@store/common/Requestable';
import { TAvailableState, TStateChangingContract } from '@api/servicesContracts/types';
import { Option } from '@vtb-ib/ui-kit';
import {
  ATTACHMENT_FILE_TYPE_ENUM,
  AVAILABLE_STATES_ENUM, AVAILABLE_SUB_STATES_ENUM,
  availableStatesDescription,
} from '@api/servicesContracts/enums';
import {
  changeAvailableStatus,
  editContractByIdAPI,
  getAvailableStatuses, sendFileIdBinding,
  uploadFileApi,
  uploadStateChangingConfirmingFile,
} from '@api/servicesContracts/servicesContracts';
import {
  validationRulesStateChanging,
} from '@store/servicesContractCard/helpers/validation';
import { FetchRequestStatus } from '~types/common';
import { ValueOf } from '~types/dto/TClaimContract';

export type TValRulesKeysStateChanging = keyof typeof validationRulesStateChanging;

class AvailableStatesStore extends Requestable {

  _availableStates: TAvailableState[] = [];

  _respondOptions: Option[] = [];

  _respondSubOptions: Option[] = [];

  _selectedRespond: Option | null = null;

  _selectedRespondSub: Option | null = null;

  _comment = '';

  _file: File | null = null;

  _validationRules = validationRulesStateChanging;

  _validationErrors: Record<string, string[]> = {};

  _editData = {} as TStateChangingContract;

  constructor(rootStore: RootStore) {
    super(rootStore);
    makeObservable(this, {
      fetchAvailableStates: action,
      fetchChangeAvailableState: action,
      fetchSendContractData: action,

      _availableStates: observable,
      setAvailableStates: action,
      availableStates: computed,

      _respondOptions: observable,
      initRespondOptions: action,
      respondOptions: computed,

      _respondSubOptions: observable,
      initRespondSubOptions: action,
      respondSubOptions: computed,

      _selectedRespond: observable,
      setSelectedRespond: action,
      selectedRespond: computed,

      _selectedRespondSub: observable,
      setSelectedRespondSub: action,
      selectedRespondSub: computed,

      _file: observable,
      setFile: action,
      file: computed,

      _editData: observable,
      setEditData: action,
      editData: computed,
      clearEditData: action,

      _validationRules: observable,
      validationRules: computed,
      validateField: action,
      validateFields: action,
      _validationErrors: observable,
      validationErrors: computed,
      clearValidationErrors: action,
      isFormValid: computed,

      _comment: observable,
      setComment: action,
      comment: computed,

      resetAvailableStates: action,
    });
  }

  async fetchAvailableStates(id: string) {
    try {
      this.setRequestStatus(FetchRequestStatus.loading);
      const response = await this.wrapApiRequest(getAvailableStatuses(id));
      this.setAvailableStates(response.availableStates);
      this.setRequestStatus(FetchRequestStatus.finished);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  async fetchChangeAvailableState(id: string) {
    try {
      if (!this.selectedRespond?.stateCode && !this.selectedRespondSub?.stateCode) {
        return;
      }
      this.setRequestStatus(FetchRequestStatus.loading);
      const body = {
        stateCode: this.selectedRespond?.stateCode || this.selectedRespondSub?.stateCode,
      };
      await this.wrapApiRequest(changeAvailableStatus(id, body));
      this.setRequestStatus(FetchRequestStatus.finished);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  async fetchSendContractData() {
    const contractId = this._rootStore?.servicesContractCardStore?.claimData?.documentCardId;
    if (!contractId) return;
    try {
      this.setRequestStatus(FetchRequestStatus.loading);
      await this.wrapApiRequest(editContractByIdAPI(String(contractId), this.editData));
      this.setRequestStatus(FetchRequestStatus.finished);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  async fetchUploadConfirmingFile() {
    if (!this.file) return;
    try {
      this.setRequestStatus(FetchRequestStatus.loading);
      const response = await this.wrapApiRequest(uploadStateChangingConfirmingFile(this.file));
      const body = {
        fileId: response.id,
        type: ATTACHMENT_FILE_TYPE_ENUM.DB_CHECK_CONCLUSION,
      };
      const servicesContractId = this._rootStore.servicesContractCardStore.claimId;
      await this.wrapApiRequest(sendFileIdBinding(servicesContractId, body));
      this.setRequestStatus(FetchRequestStatus.finished);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  async fetchUploadFile() {
    const contractId = this._rootStore?.servicesContractCardStore?.claimData?.documentCardId;
    if (!this.file || !contractId) return;
    try {
      this.setRequestStatus(FetchRequestStatus.loading);
      await this.wrapApiRequest(uploadFileApi(String(contractId), this.file));
      this.setRequestStatus(FetchRequestStatus.finished);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  setAvailableStates(data: TAvailableState[]) {
    this._availableStates = data;
  }

  initRespondOptions() {
    this._respondOptions = this.availableStates.map(respond => ({
      label: availableStatesDescription[ respond.respondCode ],
      value: AVAILABLE_STATES_ENUM[ respond.respondCode ],
      stateCode: respond.stateCode,
    }));
  }

  initRespondSubOptions() {
    this._respondSubOptions = this.availableStates.find(state => state.respondCode === this.selectedRespond?.value)
      ?.respondSubs?.map(respond => ({
        label: respond.respondSubName,
        value: AVAILABLE_SUB_STATES_ENUM[ respond.respondSubCode ],
        stateCode: respond.stateCode,
      })) || [];
  }

  setSelectedRespond(value: Option | Option[]) {
    this._selectedRespond = value instanceof Array ? value[ 0 ] : value;
  }

  setSelectedRespondSub(value: Option | Option[]) {
    this._selectedRespondSub = value instanceof Array ? value[ 0 ] : value;
  }

  resetAvailableStates() {
    this._respondOptions = [];
    this._respondSubOptions = [];
    this._selectedRespondSub = null;
    this._selectedRespond = null;
    this.setFile(null);
    this.setComment('');
    this.clearEditData();
    this.clearValidationErrors();
  }

  setFile(file: File | undefined | null) {
    this._file = file !== undefined ? file : null;
  }


  setEditData(fieldName: keyof TStateChangingContract, value: ValueOf<TStateChangingContract>) {
    set(this._editData, fieldName, value);
  }

  clearEditData() {
    this._editData = {} as TStateChangingContract;
  }

  clearValidationErrors() {
    this._validationErrors = {};
  }

  validateField(
    field: TValRulesKeysStateChanging,
    value: ValueOf<TStateChangingContract> | null,
  ) {
    const { required } = this.validationRules[ field ];
    set(
      this.validationErrors,
      field,
      // @ts-ignore
      this.validationRules[ field ]?.method(value || '', required));
  }

  validateFields() {
    const validationFields = Object.keys(this.validationRules) as TValRulesKeysStateChanging[];

    validationFields.forEach((field) => {
      const { fieldName } = this.validationRules[ field ];
      this.validateField(field, this.editData[ fieldName as keyof TStateChangingContract ]);
    });
  }

  get validationErrors() {
    return this._validationErrors;
  }

  get isFormValid() {
    const countFieldsWithError = Object.values(this.validationErrors).filter((errors) => {
      if (!errors) {
        return false;
      }
      return errors.length > 0;
    });
    return countFieldsWithError.length === 0;
  }


  setComment(value: string) {
    this._comment = value;
  }

  get availableStates() {
    return this._availableStates;
  }

  get respondOptions() {
    return this._respondOptions;
  }

  get respondSubOptions() {
    return this._respondSubOptions;
  }

  get selectedRespond() {
    return this._selectedRespond;
  }

  get selectedRespondSub() {
    return this._selectedRespondSub;
  }

  get file() {
    return this._file;
  }

  get editData() {
    return this._editData;
  }


  get validationRules() {
    return this._validationRules;
  }


  get comment() {
    return this._comment;
  }
}


export default AvailableStatesStore;