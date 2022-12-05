import { CardTypeEnum } from '../enums/CardTypeEnum';
import { FileModel } from './file.model';
import { ObjectModel } from './object.model';
import { ResponseModel } from './response.model';
import { TagModel } from './tag.model';
import { UserModel } from './user.model';
import { Exclude, Transform, Type } from 'class-transformer';
import { makeAutoObservable } from 'mobx';
import { ObjectsCardsInfoModel } from 'models/objects-cards-info.model';
import moment from 'moment';
import { EnumConstNames } from 'ts-jenum';

export class RequestModel {
  id!: number;

  cardNumber?: string;

  requestCardId!: number;

  @Transform(({ value }) => (value ? moment(value, 'DD.MM.YYYY') : moment()), {
    toClassOnly: true,
  })
  @Transform(({ value }) => (value ? moment(value, 'DD.MM.YYYY').format('DD.MM.YYYY') : ''), {
    toPlainOnly: true,
  })
  createDate!: Date;

  @Type(() => UserModel)
  createUser!: UserModel;

  @Transform(({ value }) => value || '', {
    toClassOnly: true,
  })
  userComment!: string;

  @Type(() => UserModel)
  modifyUser!: UserModel;

  @Type(() => FileModel)
  filesInfo!: FileModel[];

  @Type(() => ObjectsCardsInfoModel)
  objectsCardsInfo!: ObjectsCardsInfoModel[];

  @Type(() => RequestModel)
  additionalRequestCards!: RequestModel[];

  @Type(() => RequestModel)
  parentRequestCards!: RequestModel[];

  @Type(() => RequestModel)
  responseCards!: ResponseModel[];

  requestType: EnumConstNames<typeof CardTypeEnum> = 'REQUEST';

  tags!: TagModel[];

  @Exclude({ toClassOnly: true })
  objects?: ObjectModel;

  constructor() {
    makeAutoObservable(this);
  }
}
