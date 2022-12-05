import { Enum, EnumType } from 'ts-jenum';

@Enum<MapNameEnum>('shortName')
export class MapNameEnum extends EnumType<MapNameEnum>() {
  public static readonly OOO = new MapNameEnum('ООО', 'Общество с ограниченной ответственностью');

  public static readonly ZAO = new MapNameEnum('ЗАО', 'Закрытое акционерное общество');

  public static readonly AO = new MapNameEnum('АО', 'Акционерное общество');

  public static readonly PAO = new MapNameEnum('ПАО', 'Публичное акционерное общество');

  public static readonly GBUZ = new MapNameEnum(
    'ГБУЗ',
    'Государственное бюджетное учреждение здравоохранения'
  );

  public static readonly GKU = new MapNameEnum('ГКУ', 'Государственное казенное учреждение');

  public static readonly GBU = new MapNameEnum('ГБУ', 'Государственное бюджетное учреждение');

  public static readonly AU = new MapNameEnum('АУ', 'Автономное учреждение');

  public static readonly OAO = new MapNameEnum('ОАО', 'Открытое акционерное общество');

  public static readonly GBOU = new MapNameEnum(
    'ГБОУ',
    'Государственное бюджетное образовательное учреждение'
  );

  public static readonly GBOU_WPO = new MapNameEnum(
    'ГБОУ ВПО',
    'Государственное бюджетное образовательное учреждение высшего профессионального образования'
  );

  public static readonly GBOU_SPO = new MapNameEnum(
    'ГБОУ СПО',
    'Государственное бюджетное образовательное учреждение среднего профессионального образования'
  );

  public static readonly GUK = new MapNameEnum('ГУК', 'Государственное учреждение культуры');

  public static readonly GUP = new MapNameEnum('ГУП', 'Государственное унитарное предприятие');

  public static readonly PIF = new MapNameEnum('ПИФ', 'Паевой инвестиционный фонд');

  public static readonly ANO = new MapNameEnum('АНО', 'Автономная некоммерческая организация');

  public static readonly GK = new MapNameEnum('ГК', 'Государственная корпорация');

  private constructor(public readonly shortName: string, public readonly fullName: string) {
    super();
  }
}
