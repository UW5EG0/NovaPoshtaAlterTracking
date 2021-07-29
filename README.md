# NovaPoshtaAlterTracking
---
Внедряемая форма для получения статуса и дополнительной информации отслеживания посылки на Новой Почте. 

##Основные отличия от современного (июль 2021) дизайна Новой Почты.
- Классический дизайн отчета в виде карточек с ТТН
- Можно скопировать адресную строку для того, чтоб поделиться отчётом
- Можно опросить много ТТН-ок за раз (при условии, что у них общий телефонный номер)
- Можно добавить ключ API НП, вместо указания телефонного номера
- Полная выкладка по большинству возможных полей карточки ТТН
- Легко добавляется в код сайта. 

## Зависимости
- ITIL® Foundation v4 (ITILFV4) (стили отображения)
- Font Awesome (для иконки поиска)

##Интеграция на сайт 
`<div id="script_form"><script src="{путь к местоположению скрипта}/np_tracking.js"></script></div>`