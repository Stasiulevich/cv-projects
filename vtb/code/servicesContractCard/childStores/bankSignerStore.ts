import { action, computed, makeObservable, observable, set } from 'mobx';
import { RootStore } from '@store/rootStore';
import { Requestable } from '@store/common/Requestable';
import {
  getAvailableSigners,
  getBankSigner,
  getBankSignerDefault,
  saveBankSigner, saveBankSignerByDocumentCardIdApi,
} from '@api/servicesContracts/servicesContracts';
import { TBankSigner } from '@api/contracts/types';
import { Option } from '@vtb-ib/ui-kit';
import {
  bankSignerEditDetailList,
  bankSignerMainDetailList,
} from '@store/servicesContractCard/helpers/detailList';
import { validationRulesBankSigner } from '@store/servicesContractCard/helpers/validation';
import { TLabeledValues } from '~types/dto/TContract';
import { ValueOf } from '~types/dto/TClaimContract';
import { TEditSelectData, TRequestEditBankSigner } from '~types/dto/TContractCard';

export type TValRulesKeysBankSignerClaim = keyof typeof validationRulesBankSigner;

export default class BankSignerStore extends Requestable {

  _bankSignerData = {} as TBankSigner;

  _editData = {} as TRequestEditBankSigner;

  _validationRules = validationRulesBankSigner;

  _validationErrors: Record<string, string[]> = {};

  _availableSigners: TEditSelectData[] = [];

  _filledSigner = {} as TEditSelectData;

  constructor(rootStore: RootStore) {
    super(rootStore);
    makeObservable(this, {
      fetchFromServicesContract: action,
      fetchFromContract: action,
      _bankSignerData: observable,
      bankSignerData: computed,
      setBankSignerData: action,
      _availableSigners: observable,
      availableSigners: computed,
      _filledSigner: observable,
      filledSigner: computed,
      filledDetailsList: computed,
      mainDetailList: computed,

      // editing and validation
      initEditData: action,
      _editData: observable,
      editData: computed,
      _validationRules: observable,
      validateField: action,
      _validationErrors: observable,
      validationErrors: computed,
      clearValidationErrors: action,
      clearValidationFieldError: action,
      setCustomValidationError: action,
      isFormValid: computed,
      validateFields: action,
      isDisabledSave: computed,
      clearEditData: action,
      setEditData: action,
      saveEdit: action,
      initFioShort: action,
    });
  }

  async fetchFromServicesContract() {
    try {
      const { documentCardId } = this._rootStore.servicesContractCardStore;
      const { claimId } = this._rootStore.servicesContractCardStore;
      const result = documentCardId
        ? await this.wrapApiRequest(getBankSigner(documentCardId))
        : await this.wrapApiRequest(getBankSignerDefault(claimId));
      if (!documentCardId) {
        result.patronymicGenitive = result.patronymicGenitive || result.patronymicNameGenitive;
        result.patronymicNominative = result.patronymicNominative || result.patronymicNameNominative;
      }
      this.setBankSignerData(result);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  async fetchFromContract(contractId: number) {
    try {
      const result = await this.wrapApiRequest(getBankSigner(contractId));
      this.setBankSignerData(result);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  initFioShort() {
    const fitsNameShort = this._editData.firstNameNominative ? `${this._editData.firstNameNominative[ 0 ].toLocaleUpperCase()}.` : '';
    const patronymicNameShort = this._editData.patronymicNameNominative ? `${this._editData.patronymicNameNominative[ 0 ].toLocaleUpperCase()}.` : '';
    this._editData.fioShort = `${this._editData.lastNameNominative || ''} ${fitsNameShort}${patronymicNameShort}`;
  }

  setBankSignerData(values: TBankSigner) {
    this._bankSignerData = values;
  }

  get bankSignerData(): TBankSigner {
    return this._bankSignerData;
  }

  setAvailableSigners(values: TEditSelectData[]) {
    this._availableSigners = values;
  }

  get availableSigners(): Option[] {
    return this._availableSigners.map((signer) => ({
      ...signer,
      value: String(signer.id),
      label: `${signer.lastNameNominative || ''} ${signer.firstNameNominative || ''} ${signer.middleNameNominative || ''}`,
    }));
  }

  async fetchAvailableSingers() {
    try {
      const result = await this.wrapApiRequest(getAvailableSigners());
      this.setAvailableSigners(result.data);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  // editing and validation

  setFilledSigner(value: TEditSelectData) {
    this.initEditData(value);
  }

  get filledSigner() {
    return this._filledSigner;
  }

  get filledDetailsList(): TLabeledValues[] {
    return bankSignerEditDetailList.map((list) => ({
      ...list,
      value: list.getValue
        ? list.getValue(this.editData[ list.key as keyof TRequestEditBankSigner ] || '')
        : (this.editData[ list.key as keyof TRequestEditBankSigner ] as string) || '',
    }));
  }

  get mainDetailList(): TLabeledValues[] {
    return bankSignerMainDetailList.map((list) => ({
      ...list,
      value: list.getValue
        ? list.getValue(this.bankSignerData[ list.key as keyof TBankSigner ] || '')
        : (this.bankSignerData[ list.key as keyof TBankSigner ] as string) || '',
    }));
  }

  async saveEdit(id: string | number) {
    try {
      const { documentCardId } = this._rootStore.servicesContractCardStore;
      const result = documentCardId
        ? await this.wrapApiRequest(saveBankSignerByDocumentCardIdApi(documentCardId, this.editData))
        : await this.wrapApiRequest(saveBankSigner(Number(id), this.editData));
      await this.fetchFromServicesContract();
      result.contractId && this.showNotification('Данные успешно обновлены', 'success');
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  setEditData(fieldName: keyof TRequestEditBankSigner, value: ValueOf<TRequestEditBankSigner>) {
    set(this._editData, fieldName, value);
  }

  initEditData(value?: TEditSelectData) {
    if (value) {
      this.setEditData('lastNameNominative', value.lastNameNominative);
      this.setEditData('firstNameNominative', value.firstNameNominative);
      this.setEditData('patronymicNameNominative', value.middleNameNominative);
      this.setEditData('lastNameGenitive', value.lastNameGenitive);
      this.setEditData('firstNameGenitive', value.firstNameGenitive);
      this.setEditData('patronymicNameGenitive', value.middleNameGenitive);
      this.setEditData('fioShort', value.shortFullNameNominative);
      this.setEditData('basisDocNum', value.attorneyNumber);
      this.setEditData('basisDocDate', value.attorneyDate);
      this.setEditData('hasEdm', value.hasDigitalSignature);
      this.setEditData('signerBasis', value.authorityType);
    } else {
      this.setEditData('lastNameNominative', this.bankSignerData.lastNameNominative);
      this.setEditData('firstNameNominative', this.bankSignerData.firstNameNominative);
      this.setEditData('patronymicNameNominative', this.bankSignerData.patronymicNominative);
      this.setEditData('lastNameGenitive', this.bankSignerData.lastNameGenitive);
      this.setEditData('firstNameGenitive', this.bankSignerData.firstNameGenitive);
      this.setEditData('patronymicNameGenitive', this.bankSignerData.patronymicGenitive);
      this.setEditData('fioShort', this.bankSignerData.fioShort);
      this.setEditData('basisDocNum', this.bankSignerData.basisDocNum);
      this.setEditData('basisDocDate', this.bankSignerData.basisDocDate);
      this.setEditData('hasEdm', this.bankSignerData.hasEdm);
    }
  }

  clearValidationErrors() {
    this._validationErrors = {};
  }

  clearValidationFieldError(fieldName: string) {
    this._validationErrors[ fieldName ] = [];
  }

  setCustomValidationError(field: string, error: string[]) {
    set(this._validationErrors, field, error);
  }

  get editData(): TRequestEditBankSigner {
    return this._editData;
  }

  clearEditData() {
    this._editData = {} as TRequestEditBankSigner;
  }

  get validationErrors() {
    return this._validationErrors;
  }

  validateField(
    field: TValRulesKeysBankSignerClaim,
    value: ValueOf<TRequestEditBankSigner>,
    validationRules = this._validationRules,
  ) {
    const required = validationRules[ field ]?.required;
    set(
      this._validationErrors,
      field,
      // @ts-ignore
      validationRules[ field ]?.method(value || '', required),
    );
  }

  validateFields() {
    const validationRules = Object.keys(this._validationRules) as TValRulesKeysBankSignerClaim[];

    validationRules.forEach((field) => {
      const { fieldName } = this._validationRules[ field ];
      this.validateField(field, this.editData[ fieldName as keyof TRequestEditBankSigner ]);
    });
  }

  get isDisabledSave() {
    const validationRules = Object.keys(this._validationRules) as TValRulesKeysBankSignerClaim[];
    const onlyRequiredRules = validationRules.filter(
      (field) => this._validationRules[ field ].required,
    );

    return onlyRequiredRules.every((field) => {
      const { fieldName } = this._validationRules[ field ];
      return !!this._editData[ fieldName as keyof TRequestEditBankSigner ];
    });
  }

  get isFormValid(): boolean {
    const countFieldsWithError = Object.values(this._validationErrors).filter((errorField) => {
      if (!errorField) {
        return false;
      }
      return errorField.length > 0;
    });
    return countFieldsWithError.length === 0;
  }

}
