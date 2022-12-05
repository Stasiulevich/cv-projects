import { Requestable } from '@store/common/Requestable';
import { RootStore } from '@store/rootStore';
import { action, computed, makeObservable, observable, remove, set } from 'mobx';
import { citiesApi } from '@api/cities';
import { TProduct } from '@store/createApplication/types';
import { getBankingProduct } from '@api/agentApplication';
import {
  createContractClaim,
  editContractClaim,
  editContractDataByDocumentCardIdApi,
  editContractProduct,
  editContractProductByDocumentCardIdApi,
} from '@api/servicesContracts/servicesContracts';
import { TContractClaimApi, TEditClaimResponse } from '@api/servicesContracts/types';
import { ContractDetailsEnum, MOTIVATION_TYPE_ENUM } from '@api/servicesContracts/enums';
import { validationRulesContractBlock } from '@store/servicesContractCard/helpers/validation';
import { TCitiesData } from '@store/agent-attribute/location/geography/types';
import { compareStrings } from '@store/utils';
import { Option } from '@vtb-ib/ui-kit';
import { isNotNil } from '@components/utils';
import {
  ACCOUNT_ACTIVATE_TERM_BY_CONTRACT_TYPE_ENUM,
  ACCOUNT_OPENING_TERM_BY_CONTRACT_TYPE_ENUM,
  PRODUCT_CODE_ENUM,
  productCodeDescription,
  PROVISION_SERVICES_TERM_BY_CONTRACT_ENUM,
} from '@api/contracts/enums';
import { TClaimContract, ValueOf } from '~types/dto/TClaimContract';
import { APIWrap, FetchRequestStatus } from '~types/common';

const necessaryFields = [
  'contractFormTypeCode',
  'signBacklog',
  'signedOnPaper',
  'backlogDate',
  'cityNameInNominativeCase',
  'subjectOfRussianFederationForArbitrationInGenitiveCase',
  'productCode',
  'provisionServicesTermByContract',
  'motivationType',
  'accountOpeningTermByContractType',
  'accountActivateTermByContractType',
  'limit',
  'contractNumber',
  'startDate',
  'expireDate'
] as (keyof TClaimContract)[];


export type TValRulesKeysContractClaim = keyof typeof validationRulesContractBlock;

const initValue = {
  signedOnPaper: false,
  signBacklog: false,
  productCode: PRODUCT_CODE_ENUM.RKO_SRB,
  provisionServicesTermByContract: PROVISION_SERVICES_TERM_BY_CONTRACT_ENUM.TWELVE,
  accountOpeningTermByContractType: ACCOUNT_OPENING_TERM_BY_CONTRACT_TYPE_ENUM.NINETY_CALENDAR,
  accountActivateTermByContractType: ACCOUNT_ACTIVATE_TERM_BY_CONTRACT_TYPE_ENUM.NINETY_CALENDAR,
  motivationType: MOTIVATION_TYPE_ENUM.TWENTY_ONE_YEARS,
} as TClaimContract;

export class ContractClaimStore extends Requestable {

  _contractData = {} as TClaimContract;

  validationRules = validationRulesContractBlock;

  _validationErrors: Record<string, string[]> = {};

  _editData: TClaimContract = initValue;

  _cities: Option[] = [];

  _products: Option[] = [];

  _visibleEditFields: (keyof TClaimContract)[] = necessaryFields;

  constructor(rootStore: RootStore) {
    super(rootStore);
    makeObservable(this, {
      fillFromApi: action,
      fetchSendEditedContractData: action,
      fetchProduct: action,
      fetchCities: action,

      _contractData: observable,
      contractData: computed,
      clearContractData: action,

      _editData: observable,
      setEditData: action,
      editData: computed,
      clearEditData: action,
      deleteEditData: action,

      _cities: observable,
      setCities: action,
      cities: computed,

      _products: observable,
      setProducts: action,
      products: computed,

      validationContract: computed,
      validateField: action,
      validateFields: action,
      _validationErrors: observable,
      validationErrors: computed,
      clearValidationErrors: action,

      isFormValid: computed,
      isDisabledSave: computed,

      isShowEditBlock: computed,

      _visibleEditFields: observable,
      setVisibleEditFields: action,
    });
  }

  fillFromApi(values: TContractClaimApi) {
    this.clearContractData();
    const appropriateFields = (Object.keys(values) as (keyof TClaimContract)[]).filter(field => necessaryFields.includes(field));
    appropriateFields.forEach(field => {
      // @ts-ignore
      this._contractData[ field ] = values[ field ];
    });
  }

  async fetchCities() {
    try {
      const result = await this.wrapApiRequest(citiesApi());
      this.setCities(result.cities);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  async fetchProduct() {
    try {
      const result = await this.wrapApiRequest(getBankingProduct());
      this.setProducts(result.products);
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  initSelectedProduct() {
    if (this.products.length === 1) {
      const { value } = this.products[ 0 ];
      this.setEditData(ContractDetailsEnum.productCode, value);
    }
    if (this.products.length > 1 && !isNotNil(this.contractData[ ContractDetailsEnum.productCode ])) {
      this.setEditData(ContractDetailsEnum.productCode, undefined);
    }
  }

  async fetchCreateContract(agentId: string) {
    try {
      this.setRequestStatus(FetchRequestStatus.loading);
      await this.wrapApiRequest(createContractClaim(agentId, this.editData));
      this.setRequestStatus(FetchRequestStatus.finished);
      this.showNotification('Подробная информация на вкладке «Заявки на договоры»', 'success', 'Заявка на договор создана!');
    } catch (e) {
      this.handleRequestError(e, { backNotificationTitle: true });
    }
  }

  async fetchSendEditedContractData(id: string) {
    try {
      this.setRequestStatus(FetchRequestStatus.loading);
      const { documentCardId } = this._rootStore.servicesContractCardStore;
      const { isCompliance } = this._rootStore.rolesStore;
      remove(this.editData, ContractDetailsEnum.productName);

      let api: Promise<APIWrap<TEditClaimResponse>>;
      if (documentCardId) {
        api = isCompliance ? editContractDataByDocumentCardIdApi(documentCardId, this.editData) : editContractProductByDocumentCardIdApi(documentCardId, this.editData);
      }
      else {
        api = isCompliance ? editContractClaim(id, this.editData) : editContractProduct(id, this.editData);
      }

      const result = await this.wrapApiRequest(api);
      if (result && result.contractId) {
        if (this.contractData.signedOnPaper !== this.editData.signedOnPaper) {
          await this._rootStore.servicesContractCardStore.bankSigner.fetchFromServicesContract();
        }
      }
      await this._rootStore.servicesContractCardStore.fetchClaimData(id);
      this.setRequestStatus(FetchRequestStatus.finished);
      this.showNotification('Данные успешно сохранены', 'success');
    } catch (e) {
      this.handleRequestError(e);
    }
  }

  setVisibleEditFields(fields?: (keyof TClaimContract)[]) {
    this._visibleEditFields = fields ?? necessaryFields;
  }

  setEditData(fieldName: keyof TClaimContract, value: ValueOf<TClaimContract>) {
    set(this._editData, fieldName, value);
  }

  initEditData() {
    this.deleteEditData();
    this._visibleEditFields.forEach((field) => {
      if (isNotNil(this.contractData[ field ])) {
        this.setEditData(field, this.contractData[ field ]);
      } else {
        this.setEditData(field, initValue[ field ]);
      }
    });
  }

  clearEditData() {
    this.deleteEditData();
    this._visibleEditFields.forEach((field) => {
      if (isNotNil(initValue[ field ])) {
        this.setEditData(field, initValue[ field ]);
      }
    });
  }

  deleteEditData() {
    this._editData = {} as TClaimContract;
  }

  clearContractData() {
    this._contractData = {} as TClaimContract;
  }

  setProducts(values: TProduct[]) {
    this._products = values.map((v) => ({
      ...v,
      value: PRODUCT_CODE_ENUM[ v.code ],
      label: productCodeDescription[ v.code ],
    }));
  }

  setCities(values: TCitiesData[]) {
    this._cities = values.map((v) => v.cities)
      .flat()
      .map((v) => ({
        label: v.nameInNominativeCase,
        value: v.nameInNominativeCase,
      }))
      .sort((a: any, b: any) => compareStrings(a.label, b.label));
  }

  validateField(field: TValRulesKeysContractClaim, value: ValueOf<TClaimContract> | null) {
    const { required } = this.validationContract[ field ];
    // @ts-ignore
    set(this.validationErrors, field, this.validationContract[ field ]?.method(value || '', required));
  }

  validateFields() {
    const validationRules = Object.keys(this.validationContract) as TValRulesKeysContractClaim[];
    validationRules.forEach((field) => {
      const { fieldName } = this.validationContract[ field ];
      this.validateField(field, this.editData[ fieldName as keyof TClaimContract ]);
    });
  }

  clearValidationErrors() {
    this._validationErrors = {};
  }

  get contractData() {
    return this._contractData;
  }

  get editData(): TClaimContract {
    return this._editData;
  }

  get cities(): Option[] {
    return this._cities;
  }

  get products(): Option[] {
    return this._products;
  }

  get validationContract() {
    const newValues = Object.fromEntries(
      Object.entries(this.validationRules)
        .filter(([key]) => this._visibleEditFields.includes(key as keyof TClaimContract)),
    );

    if (newValues.backlogDate) {
      newValues.backlogDate.required = this.editData.signBacklog;
    }

    if (newValues.contractNumber) {
      const required = this._rootStore.servicesContractCardStore.servicesContractState === 30;
      newValues.contractNumber.required = required;
      newValues.startDate.required = required;
      newValues.expireDate.required = required;
    }
    return newValues;
  }

  get validationErrors() {
    return this._validationErrors;
  }

  get isDisabledSave() {
    const validationRules = Object.keys(this.validationContract) as TValRulesKeysContractClaim[];
    const onlyRequiredRules = validationRules.filter(
      (field) => this.validationContract[ field ].required);

    return onlyRequiredRules.every((field) => !!this.editData[ field ]);
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

  getIsStateForEdit(state: number | null, min: number, max: number) {
    if (!state) return false;
    return (min <= state) && (state <= max);
  }


  get isShowEditBlock() {
    const { isCompliance } = this._rootStore.rolesStore;
    const { isMPPRole } = this._rootStore.rolesStore;
    const { isHunterRole } = this._rootStore.rolesStore;
    const { isManagerGoYrak } = this._rootStore.rolesStore;
    const isRole = isMPPRole || isHunterRole || isManagerGoYrak;
    if (isCompliance) {
      return this.getIsStateForEdit(this._rootStore.servicesContractCardStore.servicesContractState, 6, 30);
    }
    if (isRole) {
      return this.getIsStateForEdit(this._rootStore.servicesContractCardStore.servicesContractState, 6, 25);
    }
    return false;
  }

}
