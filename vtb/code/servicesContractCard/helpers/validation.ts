import {
  commonErrorRequiredField,
  validateEmail,
  validateFirstName,
  validateMiddleName,
  validatePhoneNumber,
  validateSecondName,
} from '@kap/front-common';
import {
  commonErrorNotRequiredField,
  validateCityName,
  validateCurrencyLimit,
  validateSubject,
} from '@features/validationFieldsForms/utils';

export const validationRulesStateChanging = {
  number: {
    method: commonErrorRequiredField,
    fieldName: 'number',
    required: true,
  },
  signedDate: {
    method: commonErrorRequiredField,
    fieldName: 'signedDate',
    required: true,
  },
};

export const validationRulesContact = {
  contactLastName: {
    method: validateSecondName,
    fieldName: 'contactLastName',
    required: true,
  },
  contactFirstName: {
    method: validateFirstName,
    fieldName: 'contactFirstName',
    required: true,
  },
  contactPatronymic: {
    method: validateMiddleName,
    fieldName: 'contactPatronymic',
    required: false,
  },
  contactPhone: {
    method: validatePhoneNumber,
    fieldName: 'contactPhone',
    required: true,
  },
  contactEmail: {
    method: validateEmail,
    fieldName: 'contactEmail',
    required: true,
  },
};

export const validationRulesContractBlock = {
  contractFormTypeCode: {
    method: commonErrorRequiredField,
    fieldName: 'contractFormTypeCode',
    required: true,
  },
  backlogDate: {
    method: commonErrorNotRequiredField,
    fieldName: 'backlogDate',
    required: false,
  },
  cityNameInNominativeCase: {
    method: validateCityName,
    fieldName: 'cityNameInNominativeCase',
    required: true,
  },
  subjectOfRussianFederationForArbitrationInGenitiveCase: {
    method: validateSubject,
    fieldName: 'subjectOfRussianFederationForArbitrationInGenitiveCase',
    required: true,
  },
  limit: {
    method: validateCurrencyLimit,
    fieldName: 'limit',
    required: true,
  },
  contractNumber: {
    method: commonErrorNotRequiredField,
    fieldName: 'contractNumber',
    required: false,
  },
  startDate: {
    method: commonErrorNotRequiredField,
    fieldName: 'startDate',
    required: false,
  },
  expireDate: {
    method: commonErrorNotRequiredField,
    fieldName: 'expireDate',
    required: false,
  },
};

export const validationRulesBankSigner = {
  lastNameNominative: {
    method: validateSecondName,
    fieldName: 'lastNameNominative',
    required: true,
  },
  lastNameGenitive: {
    method: validateSecondName,
    fieldName: 'lastNameGenitive',
    required: true,
  },
  firstNameNominative: {
    method: validateFirstName,
    fieldName: 'firstNameNominative',
    required: true,
  },
  firstNameGenitive: {
    method: validateFirstName,
    fieldName: 'firstNameGenitive',
    required: true,
  },
  patronymicNameNominative: {
    method: validateMiddleName,
    fieldName: 'patronymicNameNominative',
    required: true,
  },
  patronymicNameGenitive: {
    method: validateMiddleName,
    fieldName: 'patronymicNameGenitive',
    required: true,
  },
  basisDocNum: {
    method: commonErrorRequiredField,
    fieldName: 'basisDocNum',
    required: true,
  },
  basisDocDate: {
    method: commonErrorRequiredField,
    fieldName: 'basisDocDate',
    required: true,
  },
};
