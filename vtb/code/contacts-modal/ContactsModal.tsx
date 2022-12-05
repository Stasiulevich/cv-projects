import React, { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { ModalComponent } from '@components/common/modalComponent';
import { useStore } from '@hooks/useStore';
import {
  ContactsBlockStore,
  TValRulesKeysContactsClaim,
} from '@store/servicesContractCard/childStores/contactsBlockStore';
import InputField from '@components/common/inputField';
import InputPhoneNumber from '@components/common/inputPhone';

type TProps = {
  title?: string;
  setIsOpenModal: (isOpen: boolean) => void;
};

const ContactsModal: FC<TProps> = observer(({ setIsOpenModal, title = 'Создание договора' }) => {
  const { servicesContractCardStore: { contactsBlock } } = useStore();

  useEffect(() => {
    contactsBlock.initEditData();
  }, []);

  const handlerOnCancelModal = () => {
    contactsBlock.clearValidationErrors();
    contactsBlock.clearEditData();
    setIsOpenModal(false);
  };

  const handlerOnSaveModal = async () => {
    contactsBlock.validateFields();
    if (contactsBlock.isFormValid) {
      await contactsBlock.fetchSendEditedContactData();
      setIsOpenModal(false);
    }
  };

  const handleBlurField = (fieldName: TValRulesKeysContactsClaim, value: string) => {
    contactsBlock.validateField(fieldName, value);
  };

  const handleChangeInput = (fieldName: TValRulesKeysContactsClaim, value: string) => {
    contactsBlock.setEditData(fieldName, value);
  };

  const isDisabled = !contactsBlock.isFormValid || !contactsBlock.isDisabledSave;

  return (
    <ModalComponent
      title={title}
      isOpen
      onSave={handlerOnSaveModal}
      isDisabled={isDisabled}
      onClose={handlerOnCancelModal}
      onCancel={handlerOnCancelModal}
      size='sm'
      loading={contactsBlock.requestLoading}
    >
      <>
        <InputField<TValRulesKeysContactsClaim, ContactsBlockStore>
          label='Фамилия'
          fieldName='contactLastName'
          store={contactsBlock}
          onChange={handleChangeInput}
          onBlur={handleBlurField}
        />
        <InputField<TValRulesKeysContactsClaim, ContactsBlockStore>
          label='Имя'
          fieldName='contactFirstName'
          store={contactsBlock}
          onChange={handleChangeInput}
          onBlur={handleBlurField}
        />
        <InputField<TValRulesKeysContactsClaim, ContactsBlockStore>
          label='Отчество'
          fieldName='contactPatronymic'
          store={contactsBlock}
          onChange={handleChangeInput}
          onBlur={handleBlurField}
          required={false}
        />
        <InputPhoneNumber
          label='Телефон'
          fieldName='contactPhone'
          onBlur={handleBlurField}
          onChange={handleChangeInput}
          store={contactsBlock}
        />
        <InputField<TValRulesKeysContactsClaim, ContactsBlockStore>
          label='Электронная почта'
          fieldName='contactEmail'
          store={contactsBlock}
          onChange={handleChangeInput}
          onBlur={handleBlurField}
        />
      </>
    </ModalComponent>
  );
});

export default ContactsModal;
