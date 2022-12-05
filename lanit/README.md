# Ланит

В Ланите в подразделении аналитической системе контрольной деятельности работал над несколькими модулями:

#### [Перейти к дашбордам](#дашборды)
#### [Перейти к реестру запросов](#реестр-запросов)
#### [Перейти к мониторингу взаимодействия](#мониторинг-взаимодействия)

## Дашборды

### Описание
Сервис для просмотра отчетов по всем системам контрольной деятельности в виде графиков и таблиц.

Для удобства имеется фильтрация по периоду, по учреждениям и другим параметрам. Присутствует возможность сравнивать графики в рамках разных периодов и разных организаций. Также присутствует возможность выгрузить отчеты в pdf-файл группы виджетов или отдельных виджетов

### Основной стек (frontend)

- react
- recharts
- pdfkit
- mobx

### Примеры скриншотов приложения

![img_2.png](screenshots/img_2.png)

<details>
  <summary>Смотреть больше</summary>

![img.png](screenshots/img.png)
![img_1.png](screenshots/img_1.png)
![img_3.png](screenshots/img_3.png)
![img_4.png](screenshots/img_4.png)
![img_5.png](screenshots/img_5.png)
![img_6.png](screenshots/img_6.png)
![img_7.png](screenshots/img_7.png)
![img_8.png](screenshots/img_8.png)
![img_9.png](screenshots/img_9.png)
![img_10.png](screenshots/img_10.png)

</details>

## Реестр запросов

### Описание
Сервис для агрегированного и стандартизированного хранения сведений о запросах из Росфинмониторинга и результатов проверок по заказчикам, поставщикам, индивидуальным предпринимателям и физическим лицам.

### Основной стек (frontend)

- react
- typescript
- mobx
- antd
- react-hook-form
- yup
- react-day-picker

### Примеры скриншотов приложения

![img_14.png](screenshots/img_14.png)

<details>
  <summary>Смотреть больше</summary>

![img_15.png](screenshots/img_15.png)
![img_16.png](screenshots/img_16.png)
![img_17.png](screenshots/img_17.png)
![img_18.png](screenshots/img_18.png)

</details>


## Мониторинг взаимодействия

### Описание
Сервис для построения связей взаимодействий между различными типами субъектов. Отображаются в виде графа, с возможностью изменения сетки отображения и раскрытия/скрытия дополнительных связей

### Основной стек (frontend)

- react
- typescript
- mobx
- antd
- @antv/g6

### Примеры скриншотов приложения

![img_11.png](screenshots/img_11.png)

<details>
  <summary>Смотреть больше</summary>

![img_12.png](screenshots/img_12.png)
![img_13.png](screenshots/img_13.png)

</details>
