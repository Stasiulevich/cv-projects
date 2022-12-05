import { Requestable } from '@store/common/Requestable';
import { RootStore } from '@store/rootStore';
import { action, computed, makeObservable, observable, set } from 'mobx';
import { TContactData, TContractClaimApi } from '@api/servicesContracts/types';
import { saveContactClaim } from '@api/servicesContracts/servicesContracts';
import { validationRulesContact } from '@store/servicesContractCard/helpers/validation';
import { ValueOf } from '~types/dto/TClaimContract';
import { FetchRequestStatus } from '~types/common';

export type TValRulesKeysContactsClaim = keyof typeof validationRulesContact;

const necessaryFields = ['contactEmail', 'contactPhone', 'contactFirstName', 'contactPatronymic', 'contactLastName'] as (keyof TContactData)[];

export class ContactsBlockStore extends Requestable {

  _contactData = {} as TContactData;

  validationRules = validationRulesContact;

  _validationErrors: Record<string, string[]> = {};

  _editData = {} as TContactData;

  constructor(rootStore: RootStore) {
    super(rootStore);
    makeObservable(this, {
      fillFromApi: action,
      fetchSendEditedContactData: action,

      _contactData: observable,
      contactData: computed,
      clearContactData: action,

      initEditData: action,
      _editData: observable,
      setEditData: action,
      editData: computed,
      clearEditData: action,

      _validationErrors: observable,
      validationErrors: computed,
      validateField: action,
      validateFields: action,
      clearValidationErrors: action,

      isFormValid: computed,
      isDisabledSave: computed,
      isShowEditBlock: computed,
    });
  }

  fillFromApi(values: TContractClaimApi) {
    this.clearContactData();
    const appropriateFields = (Object.keys(values) as (keyof TContactData)[]).filter(field => necessaryFields.includes(field));
    appropriateFields.forEach(field => {
      this._contactData[ field ] = values[ field ];
    });
  }

  async fetchSendEditedContactData() {
    try {
      this.setRequestStatus(FetchRequestStatus.loading);
      const { claimId } = this._rootStore.servicesContractCardStore;
      await this.wrapApiRequest(saveContactClaim(this.editData, claimId));
      await this._rootStore.servicesContractCardStore.fetchClaimData(claimId);
      this.setRequestStatus(FetchRequestStatus.finished);
      this.showNotification('Контакты отредактированы', 'success');
    } catch (e) {
      this.handleRequestError(e);
    }
  }


  setEditData(fieldName: keyof TContactData, value: ValueOf<TContactData>) {
    set(this._editData, fieldName, value || null);
  }

  initEditData() {
    necessaryFields.forEach((field) => {
      this.setEditData(field, this.contactData[ field ]);
    });
  }

  clearContactData() {
    this._contactData = {} as TContactData;
  }

  clearEditData() {
    this._editData = {} as TContactData;
  }

  clearValidationErrors() {
    this._validationErrors = {};
  }

  validateField(field: TValRulesKeysContactsClaim, value: ValueOf<TContactData> | null) {
    const { required } = this.validationRules[ field ];
    set(this.validationErrors, field, this.validationRules[ field ]?.method(value || '', required));
  }

  validateFields() {
    const validationRules = Object.keys(this.validationRules) as TValRulesKeysContactsClaim[];
    validationRules.forEach((field) => {
      const { fieldName } = this.validationRules[ field ];
      this.validateField(field, this.editData[ fieldName as keyof TContactData ]);
    });
  }

  get contactData() {
    return this._contactData;
  }

  get editData(): TContactData {
    return this._editData;
  }

  get validationErrors() {
    return this._validationErrors;
  }

  get isDisabledSave() {
    const validationRules = Object.keys(this.validationRules) as TValRulesKeysContactsClaim[];
    const onlyRequiredRules = validationRules.filter(
      (field) => this.validationRules[ field ].required,
    );

    return onlyRequiredRules.every((field) => !!this._editData[ field ]);
  }

  get isFormValid(): boolean {
    const countFieldsWithError = Object.values(this.validationErrors).filter((errorField) => {
      if (!errorField) {
        return false;
      }
      return errorField.length > 0;
    });
    return countFieldsWithError.length === 0;
  }

  get isShowEditBlock() {
    const { isCompliance } = this._rootStore.rolesStore;
    const { isMPPRole } = this._rootStore.rolesStore;
    const { isHunterRole } = this._rootStore.rolesStore;
    const { isManagerGoYrak } = this._rootStore.rolesStore;
    const isRole = isCompliance || isMPPRole || isHunterRole || isManagerGoYrak
    return !this._rootStore.servicesContractCardStore.documentCardId && isRole;
  }
}
