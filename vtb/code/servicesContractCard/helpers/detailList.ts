import { format } from 'date-fns';
import { DATE_FORMATS } from '@api/config';
import {
  CONTRACT_FORM_ENUM,
  ContractFormDescription,
  descriptionSigningForm,
} from '@components/common/contract-fill-modal/constants';
import { formattedPrice } from '@helpers/formattedPrice';
import {
  AVAILABLE_STATES_ENUM, AVAILABLE_SUB_STATES_ENUM,
  availableStatesDescription,
  availableSubStatesDescription,
  CONTRACT_CLAIM_STATUS_ENUM,
  contractClaimStatusDescription,
  ContractDetailsEnum,
  MOTIVATION_TYPE_ENUM,
  motivationTypeDescription,
} from '@api/servicesContracts/enums';
import { getFullName } from '@store/credentials/utils';
import {
  ACCOUNT_ACTIVATE_TERM_BY_CONTRACT_TYPE_ENUM,
  ACCOUNT_OPENING_TERM_BY_CONTRACT_TYPE_ENUM,
  accountActivateTermByContractTypeDescription,
  accountOpeningTermByContractTypeDescription,
  AgentBlockEnum,
  AgentSignerEnum,
  BankDataEnum,
  BankRequisitesEnum,
  BankSignerEnum,
  documentTypeEnum,
  PRODUCT_CODE_ENUM,
  productCodeDescription,
  PROVISION_SERVICES_TERM_BY_CONTRACT_ENUM,
  provisionServicesTermByContractDescription,
  signerBasisEnum,
  TaxSystemAgentEnum,
  TaxSystemDescription,
  VAT_ENUM,
} from '@api/contracts/enums';
import { formatPassportDepartmentString, formatPassportString } from '@store/utils';
import { formatPhoneDashed } from '@kap/front-common';
import { TLabeledValues } from '~types/dto/TContract';

// Блок "Статус заявки на договор" в карточке "Заявка на договор"
export const initClaimStatusDetailList: TLabeledValues[] = [
  {
    label: 'Статус',
    value: '',
    key: 'statusCode',
    getValue: (v: keyof typeof CONTRACT_CLAIM_STATUS_ENUM) => v && contractClaimStatusDescription[ v ],
  },
  {
    label: 'Отклик',
    value: '',
    key: 'respondCode',
    getValue: (v: AVAILABLE_STATES_ENUM) => v && availableStatesDescription[ v ],
  },
  {
    label: 'Подотклик',
    value: '',
    key: 'respondSubCode',
    getValue: (v: AVAILABLE_SUB_STATES_ENUM) => v && availableSubStatesDescription[ v ],
  },
];

// Блок "Контакты" в карточке "Заявка на договор"
export const initContactDetailList: TLabeledValues[] = [
  {
    label: 'ФИО',
    value: '',
    key: 'contactFirstName',
    getValue: (v, data) =>
      data && getFullName(data.contactFirstName, data.contactPatronymic, data.contactLastName),
  },
  {
    label: 'Телефон',
    value: '',
    key: 'contactPhone',
    getValue: (v) => v && formatPhoneDashed(v),
  },
  { label: 'Электронная почта', value: '', key: 'contactEmail' },
];

// Блок "Договор" в карточке "Заявка на договор"
export const initContractDetailList: TLabeledValues[] = [
  { label: 'Номер договора', value: '', key: ContractDetailsEnum.contractNumber },
  {
    label: 'Дата начала договора',
    value: '',
    key: ContractDetailsEnum.startDate,
    getValue: (v) => v && format(new Date(v), DATE_FORMATS.dotted),
  },
  {
    label: 'Дата окончания договора',
    value: '',
    key: ContractDetailsEnum.expireDate,
    getValue: (v) => v && format(new Date(v), DATE_FORMATS.dotted),
  },
  {
    label: 'Форма подписания договора',
    value: '',
    key: ContractDetailsEnum.signedOnPaper,
    getValue: (v) => {
      if (v) return descriptionSigningForm.MANUAL;
      if (v === false) return descriptionSigningForm.ELECTRONIC;
      return '';
    },
  },
  {
    label: 'Форма договора',
    value: '',
    key: ContractDetailsEnum.contractFormTypeCode,
    getValue: (v: CONTRACT_FORM_ENUM) => ContractFormDescription[ v ],
  },
  {
    label: 'Наличие бэклога',
    value: '',
    key: ContractDetailsEnum.signBacklog,
    getValue: (v) => {
      if (v) return 'Да';
      if (v === false) return 'Нет';
      return '';
    },
  },
  {
    label: 'Дата бэклога',
    value: '',
    key: ContractDetailsEnum.backlogDate,
    getValue: (v) => v && format(new Date(v), DATE_FORMATS.dotted),
  },
  { label: 'Город', value: '', key: ContractDetailsEnum.cityNameInNominativeCase },
  {
    label: 'Субъект РФ (в родительном падеже)',
    value: '',
    key: ContractDetailsEnum.subjectOfRussianFederationForArbitrationInGenitiveCase,
  },
  {
    label: 'Продукт договора',
    value: '',
    key: ContractDetailsEnum.productCode,
    getValue: (v: PRODUCT_CODE_ENUM) => v && productCodeDescription[ v ],
  },
  {
    label: 'Срок оказания услуг',
    value: '',
    key: ContractDetailsEnum.provisionServicesTermByContract,
    // todo: уточнить по возможным вариантам
    getValue: (v: PROVISION_SERVICES_TERM_BY_CONTRACT_ENUM) => provisionServicesTermByContractDescription[ v ],
  },
  {
    label: 'Тип мотивации',
    value: '',
    key: ContractDetailsEnum.motivationType,
    getValue: (v: MOTIVATION_TYPE_ENUM) => motivationTypeDescription[ v ],
  },
  { label: 'Номер СоК', value: '', key: ContractDetailsEnum.ndaNumber },
  {
    label: 'Дата СоК',
    value: '',
    key: ContractDetailsEnum.ndaDate,
    getValue: (v) => v && format(new Date(v), DATE_FORMATS.dotted),
  },
  {
    label: 'Срок для открытия счета',
    value: '',
    key: ContractDetailsEnum.accountOpeningTermByContractType,
    getValue: (v: ACCOUNT_OPENING_TERM_BY_CONTRACT_TYPE_ENUM) => v && accountOpeningTermByContractTypeDescription[ v ],
  },
  {
    label: 'Срок для активации счета',
    value: '',
    key: ContractDetailsEnum.accountActivateTermByContractType,
    getValue: (v: ACCOUNT_ACTIVATE_TERM_BY_CONTRACT_TYPE_ENUM) => v && accountActivateTermByContractTypeDescription[ v ],
  },
  // todo: написать функцию для форматирования лимита
  {
    label: 'Лимит договора',
    value: '',
    key: ContractDetailsEnum.limit,
    getValue: (v) => v && formattedPrice(v),
  },
];

// Блок "Банковские реквизиты агента" в карточке "Заявка на договор"
export const initBankRequisitesDetailList: TLabeledValues[] = [
  { label: 'БИК', value: '', key: BankRequisitesEnum.bic },
  { label: 'Банк', value: '', key: BankRequisitesEnum.bank },
  { label: 'Корреспондентский счет', value: '', key: BankRequisitesEnum.correspondentAccount },
  { label: 'Расчетный счет', value: '', key: BankRequisitesEnum.bankAccount },
];

// Блок "Агент" в карточке "Заявка на договор"
export const initAgentDetailList: TLabeledValues[] = [
  { label: 'Наименование организации полное', value: '', key: AgentBlockEnum.companyName },
  {
    label: 'Наименование организации сокращенное',
    value: '',
    key: AgentBlockEnum.companyNameShort,
  },
  { label: 'Форма собственности', value: '', key: AgentBlockEnum.ownershipFull },
  {
    label: 'Система налогообложения',
    value: '',
    key: AgentBlockEnum.taxTypeCode,
    getValue: (v: keyof typeof TaxSystemAgentEnum) => TaxSystemDescription[ TaxSystemAgentEnum[ v ] ],
  },
  {
    label: 'Плательщик НДС',
    value: '',
    key: AgentBlockEnum.vatPayer,
    getValue: (v: keyof typeof VAT_ENUM) => v && VAT_ENUM[ v ],
  },
  { label: 'ИНН', value: '', key: AgentBlockEnum.inn },
  {
    label: 'Дата регистрации',
    value: '',
    key: AgentBlockEnum.registrationDate,
    getValue: (v) => v && format(new Date(v), DATE_FORMATS.dotted),
  },
  { label: 'ОГРН', value: '', key: AgentBlockEnum.ogrn },
  {
    label: 'Дата выдачи ОГРН',
    value: '',
    key: AgentBlockEnum.ogrnDate,
    getValue: (v) => v && format(new Date(v), DATE_FORMATS.dotted),
  },
  { label: 'КПП', value: '', key: AgentBlockEnum.kpp },
  { label: 'Место нахождения', value: '', key: AgentBlockEnum.location },
  { label: 'Почтовый адрес', value: '', key: AgentBlockEnum.postAddress },
];

// Блок "Подписант агента" в карточке "Заявка на договор"
export const initAgentSignerDetailList: TLabeledValues[] = [
  { label: 'Должность', value: '', key: AgentSignerEnum.position },
  { label: 'Фамилия', value: '', key: AgentSignerEnum.lastName },
  { label: 'Имя', value: '', key: AgentSignerEnum.firstName },
  { label: 'Отчество', value: '', key: AgentSignerEnum.patronymic },
  { label: 'ФИО сокращенное', value: '', key: AgentSignerEnum.fioShort },
  {
    label: 'Вид документа',
    value: '',
    key: AgentSignerEnum.documentType,
    getValue: (v: keyof typeof documentTypeEnum) => v && documentTypeEnum[ v ],
  },
  {
    label: 'Серия документа',
    value: '',
    key: AgentSignerEnum.passportSeries,
    getValue: (v) => formatPassportString(v),
  },
  { label: 'Номер документа', value: '', key: AgentSignerEnum.passportNumber },
  { label: 'Кем выдан паспорт', value: '', key: AgentSignerEnum.passportIssued },
  {
    label: 'Дата документа',
    value: '',
    key: AgentSignerEnum.passportIssuedDate,
    getValue: (v) => v && format(new Date(v),
      DATE_FORMATS.dotted),
  },
  {
    label: 'Код подразделения выдавшего паспорт',
    value: '',
    key: AgentSignerEnum.passportDepartmentCode,
    getValue: (v) => v && formatPassportDepartmentString(v),
  },
  {
    label: 'Основание для подписания',
    value: '',
    key: AgentSignerEnum.signerBasis,
    getValue: (v: keyof typeof signerBasisEnum) => v && signerBasisEnum[ v ],
  },
  { label: 'Номер доверенности', value: '', key: AgentSignerEnum.basisDocNum },
  {
    label: 'Дата доверенности',
    value: '',
    key: AgentSignerEnum.basisDocDate,
    getValue: (v) => v && format(new Date(v),
      DATE_FORMATS.dotted),
  },
  {
    label: 'Дата окончания доверенноcти',
    value: '',
    key: AgentSignerEnum.basisDocEndDate,
    getValue: (v) => v && format(new Date(v),
      DATE_FORMATS.dotted),
  },
];

// Блок "Банк" в карточке "Заявка на договор" с имеющимся documentCardId
export const initBankDetailListWithDocumentCardId: TLabeledValues[] = [
  { label: 'Наименование банка полное', value: '', key: BankDataEnum.bankFullName },
  { label: 'Наименование банка сокращенное', value: '', key: BankDataEnum.bankShortName },
  { label: 'Место нахождения (юр.адрес ГО)', value: '', key: BankDataEnum.bankJuridicalAddress },
  { label: 'Почтовый адрес ГО', value: '', key: BankDataEnum.bankMailingAddress },
  { label: 'ИНН Банка (ГО)', value: '', key: BankDataEnum.bankInn },
  { label: 'БИК ГО', value: '', key: BankDataEnum.bankBic },
  { label: 'К / счет ГО', value: '', key: BankDataEnum.bankCorrespondentAccount },
  { label: 'В Банке (к / счета ГО)', value: '', key: BankDataEnum.bankCorrespondentName },
];

// Блок "Банк" в карточке "Заявка на договор" при отсутствии documentCardId
export const initBankDetailListWithOutDocumentCardId: TLabeledValues[] = [
  { label: 'Наименование банка полное', value: '', key: BankDataEnum.bankFullName },
  { label: 'Наименование банка сокращенное', value: '', key: BankDataEnum.bankShortName },
  { label: 'Место нахождения (юр.адрес ГО)', value: '', key: BankDataEnum.juridicalAddress },
  { label: 'Почтовый адрес ГО', value: '', key: BankDataEnum.mailingAddress },
  { label: 'ИНН Банка (ГО)', value: '', key: BankDataEnum.bankInn },
  { label: 'БИК ГО', value: '', key: BankDataEnum.bik },
  { label: 'К / счет ГО', value: '', key: BankDataEnum.correspondentAccount },
  { label: 'В Банке (к / счета ГО)', value: '', key: BankDataEnum.bankCorrespondentAccount },
];

const bankSignerCommonList: Record<string, TLabeledValues> = {
  lastName: { label: 'Фамилия', value: '', key: BankSignerEnum.lastNameNominative },
  lastNameGenitive: {
    label: 'Фамилия (в родительном падеже)',
    value: '',
    key: BankSignerEnum.lastNameGenitive,
  },
  firstName: { label: 'Имя', value: '', key: BankSignerEnum.firstNameNominative },
  firstNameGenitive: {
    label: 'Имя (в родительном падеже)',
    value: '',
    key: BankSignerEnum.firstNameGenitive,
  },
  fioShort: { label: 'ФИО сокращенно', value: '', key: BankSignerEnum.fioShort },
  signerBasis: {
    label: 'Основание для подписания',
    value: '',
    key: BankSignerEnum.signerBasis,
    getValue: (v: keyof typeof signerBasisEnum) => v && signerBasisEnum[ v ],
  },
  basisDocNum: { label: 'Номер доверенности', value: '', key: BankSignerEnum.basisDocNum },
  basisDocDate: {
    label: 'Дата доверенности',
    value: '',
    key: BankSignerEnum.basisDocDate,
    getValue: (v) => v && format(new Date(v), DATE_FORMATS.dotted),
  },
  hasEdm: {
    label: 'Наличие электронной подписи',
    value: '',
    key: BankSignerEnum.hasEdm,
    getValue: (v) => (v ? 'Да' : 'Нет'),
  },
};

export const bankSignerEditDetailList: TLabeledValues[] = [
  bankSignerCommonList.lastName,
  bankSignerCommonList.lastNameGenitive,
  bankSignerCommonList.firstName,
  bankSignerCommonList.firstNameGenitive,
  { label: 'Отчество', value: '', key: BankSignerEnum.patronymicNameNominative },
  {
    label: 'Отчество (в родительном падеже)',
    value: '',
    key: BankSignerEnum.patronymicNameGenitive,
  },
  bankSignerCommonList.fioShort,
  bankSignerCommonList.signerBasis,
  bankSignerCommonList.basisDocNum,
  bankSignerCommonList.basisDocDate,
  bankSignerCommonList.hasEdm,
];

export const bankSignerMainDetailList: TLabeledValues[] = [
  bankSignerCommonList.lastName,
  bankSignerCommonList.lastNameGenitive,
  bankSignerCommonList.firstName,
  bankSignerCommonList.firstNameGenitive,
  { label: 'Отчество', value: '', key: BankSignerEnum.patronymicNameNominative },
  { label: 'Отчество (в родительном падеже)', value: '', key: BankSignerEnum.patronymicNameGenitive },
  bankSignerCommonList.fioShort,
  bankSignerCommonList.signerBasis,
  bankSignerCommonList.basisDocNum,
  bankSignerCommonList.basisDocDate,
  bankSignerCommonList.hasEdm,
];
