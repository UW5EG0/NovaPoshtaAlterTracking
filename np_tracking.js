(function () {const TRACKING_NUMBER_NOT_FOUND = "3";

function resetAnswer(){
document.getElementById("answer").innerHTML = "<div id=\"statusBox\" data-alert></div>";
	setStatus("", "Ожидаю...");
}

function setStatus(alertType, statusHint) { 
document.getElementById("statusBox").className = "alert-box "+alertType+" radius";
document.getElementById("statusBox").innerHTML = "<strong>"+statusHint+"</strong>";
}

function setSubmitOnComponentEnter(element, execute) {
 var input = document.getElementById(element);
input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        execute();
    }
}, false);
}
function setSubmitOnComponentClick(element, execute) {
 var input = document.getElementById(element);
input.addEventListener("click", function(event) {
        event.preventDefault();
        execute();    
}, false);
}

function setSubmitOnComponentClick(element, execute, params) {
 var input = document.getElementById(element);
input.addEventListener("click", function(event) {
        event.preventDefault();
        execute(params);    
}, false);
}
var clearData = function () {
document.getElementById("tracking").value="";	
document.getElementById("phone").value="";	
document.getElementById("apiKey").value="";	
resetAnswer();
const url = new URL(window.location.href);
url.searchParams.delete('tracking');
url.searchParams.delete('phone');
window.history.replaceState(null, null, url); 
}

 var copyLink = function() {
	let text = document.getElementById("copyButton").value;
	navigator.clipboard.writeText(new URL(window.location.href)).then(function() {
    /* clipboard successfully set */
	document.getElementById("copyButton").value = "Скопировано!";
	setTimeout(() => {document.getElementById("copyButton").value = text;}, 1000);
  }, function() {
    /* clipboard write failed */
	document.getElementById("copyButton").value = "Ошибка копирования :(";
	setTimeout(() => {document.getElementById("copyButton").value = text;}, 1000);
  });

}
 var typeLine = function(label, variable){
	let line = "";
	if (testText(variable)) {
		line = "<div>"+label+": " +variable+"</div>";
	}
return line;
}
var typeNumber = function (label,dimension,variable){
	let line = "";
	if (testText(variable)) {
		line = "<div>"+label+": " +Number(variable)+" "+dimension+"</div>";
	}
return line;
}
var typeLink = function(label,variable,id,alt){
	let line = "";
	if (testText(variable)) {
		line = "<div>"+label+": <a href=\"javascript:void(0);\" class=\"phoneNumber\" title=\""+alt+"\" id=\""+id+"\">"+variable+"</a></div>";
	}
return line;
}
var handleClick = function() {
	resetAnswer();
	setStatus("secondary","Проверяю...");
	let trackingList = parseTrackingNumber(document.getElementById("tracking").value);
	let phoneNumber = parsePhoneNumber(document.getElementById("phone").value);
	let apiKey = document.getElementById("apiKey").value;
	
//Записываем параметры к запросу для автостарта при копипасте ссылки 	
const url = new URL(window.location.href);
if (trackingList.length >0) url.searchParams.set('tracking', trackingList.toString());
if (phoneNumber.length >0) url.searchParams.set('phone', phoneNumber);
window.history.replaceState(null, null, url); 
	let jsonData = {};
	jsonData.apiKey = apiKey;
	jsonData.modelName = "TrackingDocument";
	jsonData.calledMethod = "getStatusDocuments";
	jsonData.methodProperties = {};
	jsonData.methodProperties.Documents = [];
	trackingList.forEach ((element) => {
		let jsonDocument = {};
		jsonDocument.DocumentNumber = element;
		jsonDocument.Phone = phoneNumber;
		jsonData.methodProperties.Documents.push(jsonDocument);
	});
postData('https://api.novaposhta.ua/v2.0/json/', jsonData)
  .then((data) => {
	// Отчитываемся о успешном соединении с НП
	var block = "";
	setStatus((data.success)?"success":"alert","Запрос "+((data.success)?"":"не ")+"удачен!");
	if (!data.success) { //вываливаем дамп ошибки
		JSON.stringify(data);
	} else {
		//малюем странички
	data.data.forEach((element)	=> {
	let trackingItem = element;
	
	block = "<div class=\"panel radius\" style=\"background-color:white; box-shadow: inset 0px 0px 15px -5px #8C8C8C;\">"; 
	//Выводим цепочку ТТН-ок
	block += "<div class=\"small-12 large-12\"><span style=\"font-size: x-large;\">ТТН: </span>";
	if (testText(trackingItem.OwnerDocumentNumber)) 
	{block +="<span style=\"font-size: x-large; color: #bbb\">"+trackingItem.OwnerDocumentNumber+" -> </span>";}
	block +="<span style=\"font-size: x-large;\">";
	if (testText(trackingItem.OwnerDocumentNumber)) { block +=parseDocumentType(trackingItem.OwnerDocumentType)+" "; }
	block += trackingItem.Number+"</span>";
	if (testText(trackingItem.LastCreatedOnTheBasisNumber)) 
	{ block +="<span style=\"font-size: x-large; color: #bbb\"> -> "+parseDocumentType(trackingItem.LastCreatedOnTheBasisDocumentType)+" "+trackingItem.LastCreatedOnTheBasisNumber+" </span>";
	}
    //выводим тип движения
	if (testText(trackingItem.ServiceType)) {
    block +="   <span style=\"font-size: x-large; \"> Тип: "+parseServiceType(trackingItem.ServiceType)+"</span>";
	}
	block +="</div>"; //закрываем вывод цепочки ТТН-ок
		
	block += "<div class=\"small-12 large-12\">\
			  	<span style=\"font-size: x-large; color: #bbb\">Статус:</span>\
			  	<span style=\"font-size: x-large;\">"+parseTrackingStatus(trackingItem)+"</span>\
			  </div><hr>";
	if (trackingItem.StatusCode != TRACKING_NUMBER_NOT_FOUND) { //"Номер не знайдено"
	if (trackingItem.UndeliveryReasonsDate != "") {
		
	block += "<div style=\"font-size: x-large;\" data-alert class=\"alert-box alert radius\">Недоставлен: "+trackingItem.UndeliveryReasonsSubtypeDescription+"</br>\
	Когда:</span> <span style=\"font-size: x-large;\">"+trackingItem.UndeliveryReasonsDate+"</div>";
	}
	
	block += "<div class=\"row\"><div class=\"small-12 large-4 columns\">\
			  <h5>Общая информация:</h5>"
	+ typeLine("Дата создания:",trackingItem.DateCreated)
	+ typeLine("Создана ведомая ТТН",trackingItem.LastCreatedOnTheBasisDateTime)
	+ typeLine("Предполагаемая доставка",trackingItem.ScheduledDeliveryDate)
	+ typeLine("Начало платного хранения с",trackingItem.DatePayedKeeping)
	+ typeLine("Фактически получен",trackingItem.RecipientDateTime) +"</div>";


	block += "<div class=\"small-12 large-4 columns\">\
			  <h5>Информация о грузе:</h5>"
	+ typeLine("Тип груза",parseCargoType(trackingItem.CargoType)) 
	+ typeLine("Описание груза",trackingItem.CargoDescriptionString) 
	+ typeNumber("Вес груза","кг",trackingItem.DocumentWeight) 
	+ typeNumber("Фактический вес груза","кг",trackingItem.FactualWeight) 
	+ typeNumber("Объёмный вес груза","кг",trackingItem.VolumeWeight) 
	+ typeLine("Дополнительная информация",trackingItem.AdditionalInformationEW) + "</div>";
	
	block += "<div class=\"small-12 large-4 columns\"><h5>Финансовые данные:</h5>"; //style=\"grid-column: 10/ -1;
	block += "<div> Кто платит: ";
	switch (trackingItem.PayerType){
		case "Sender": 
		block +="Отправитель"; 
		break;
		case "Recipient": 
		block +="Получатель"; 
		break;
		
		default: trackingItem.PayerType;
	}	
		switch (trackingItem.PaymentMethod){
		case "Cash": 
		block +=" (Наличные)"; 
		break;
		case "NonCash": 
		block +=" (Безнал)"; 
		break;
		default: trackingItem.PaymentMethod;
	}
	block +="</div>"; //#div - Кто платит
	block += typeNumber("Стоимость доставки","грн",trackingItem.DocumentCost)
		  +	typeNumber("Стоимость хранения на НП","грн",trackingItem.StorageAmount)
	+	typeNumber("Контроль оплаты","грн",trackingItem.AfterpaymentOnGoodsCost)
	+	typeNumber("Оплачено (интернет заказ)","грн",trackingItem.AmountPaid)
	+	typeNumber("К оплате (интернет заказ)","грн",trackingItem.AmountToPay) + "</div></div>"; //#row
	
	block += "<div class=\"row\">\
			  <div class=\"small-12 large-6 columns\">\
			  <h5>Отправитель:</h5>"
	+ typeLine("Город-отправитель",trackingItem.CitySender) 
	+ typeLine("Тип отправителя",parseCounterpartyType(trackingItem.CounterpartySenderType)) 
	+ typeLine("ФИО ЭН",trackingItem.SenderFullNameEW) 
	+ typeLink("Номер",trackingItem.PhoneSender,"search_"+trackingItem.PhoneSender, "Нажмите, чтоб отобразить данные доступные с этим номером") 
	+ typeLine("Склад",trackingItem.WarehouseSender) 
	+ typeLine("Адрес доставки",trackingItem.WarehouseSenderAddress)+"</div>";
	
	block += "<div class=\"small-12 large-6 columns\">\
			  <h5>Получатель:</h5>"
	+ typeLine("Город-получатель",trackingItem.CityRecipient) 
	+ typeLine("Тип получателя",parseCounterpartyType(trackingItem.CounterpartyType)) 
	+ typeLine("ФИО ЭН",trackingItem.RecipientFullNameEW) 
	+ typeLine("ФИО получателя",trackingItem.RecipientFullName) 
	+ typeLink("Номер",trackingItem.PhoneRecipient,"search_"+trackingItem.PhoneRecipient, "Нажмите, чтоб отобразить данные доступные с этим номером") 
	+ typeLine("Склад",trackingItem.WarehouseRecipient) 
	+ typeLine("Адрес доставки",trackingItem.WarehouseRecipientAddress)+"</div></div>";
	
	data.warnings.forEach((element) => { 
		for (key in element) {
		if (key === 'ID_'+trackingItem.Number){	
		block += "<div class=\"row\"><div class=\"small-12 large-12 columns\">\<hr><strong>Предупреждение:</strong> "+parseWarning(element[key])+"</div></div>";}
		}
	});
	}
	block+="</div>";	
	document.getElementById("answer").innerHTML += block;	
	});
	document.getElementById("answer").innerHTML +="<div><input class=\"button prefix\" id=\"copyButton\" style=\"background-color:#3AA\" onclick=\"javascript:copyLink()\" type=\"button\" value=\"Cкопировать ссылку на отчет\" /></div>";
	//Всё выведено;
	var phoneLinks = document.getElementsByClassName("phoneNumber");
	 for(var i=0; i<phoneLinks.length; i++)
                {
			phoneLinks[i].addEventListener("click", (event) => {searchWithThisPhoneNumber(event.target.innerHTML);});
                }
  	};
  });
};

document.addEventListener('DOMContentLoaded', function() {
/*Создаём форму*/ 
var form = "<form onsubmit=\"javascript:handleClick(); return false;\">";
form +="<fieldset>\
		<legend>Введите ТТН НП</legend>\
		<input class=\"columns large-6\" id=\"tracking\" style=\"font-size: x-large; height: auto\" type=\"text\" value=\"\" placeholder=\"1234567890123456\">\
		</fieldset>"; // Создаём ведущее поле для ТТН-ок
form +="<fieldset><legend>Дополнительные поля:</legend>\
		<div class=\"row collapse prefix-radius\">\
        <div class=\"large-3 small-12 columns\">\
          \<span class=\"prefix\">Номер телефона (если есть):</span>\
        \</div>\
        \<div class=\"small-12 large-9 columns\">\
          \<input id=\"phone\" type=\"text\" value=\"\" placeholder=\"380ххххххххх\">\
        </div>\
		 <div class=\"large-3 small-12 columns\">\
          \<span class=\"prefix\">Ключ API новой почты (если есть):</span>\
        \</div>\
        \<div class=\"small-12 large-9 columns\">\
          \<input id=\"apiKey\" type=\"text\" value=\"\" placeholder=\"\">\
        </div>\
		</fieldset>"; // Создаём кнопки для дополнительных полей
form += "<div class=\"row\">\
		<div class=\"small-12 large-7 columns\">\
          <a class=\"button prefix\" href=\"#\" id=\"searchButton\">Отследить <i class=\"fa fa-search\"></i></a>\
        </div>\
		<div class=\"small-6 large-2 columns\">\
          <input class=\"button prefix\" id=\"clearButton\" style=\"background-color:#F55\" onclick=\"javascript:clearData()\" type=\"button\" value=\"Очистить\" />\
        </div>\
		<div class=\"small-6 large-3 columns\">\
          <input class=\"button prefix\" id=\"copyButton\" style=\"background-color:#3AA\" onclick=\"javascript:copyLink()\" type=\"button\" value=\"Cкопировать ссылку на отчет\" />\
        </div>\
		</div>"; //Создаём строку с кнопками
form +="</form><div id=\"answer\"></div>";
document.getElementById("script_form").innerHTML = form;
resetAnswer();
setSubmitOnComponentEnter("tracking",handleClick);
setSubmitOnComponentEnter("phone",handleClick);
setSubmitOnComponentEnter("apiKey",handleClick); 
setSubmitOnComponentClick("searchButton", handleClick);


//Считываем параметры и заносим в поля
const url = new URL(window.location.href); 
if (url.searchParams.get('phone') != null) {
	document.getElementById("phone").value = url.searchParams.get('phone');
}
if (url.searchParams.get('tracking') != null) {
	document.getElementById("tracking").value = url.searchParams.get('tracking');
    handleClick(); // Если параметры есть - вызываем автозапуск запроса
}
});

var searchWithThisPhoneNumber = function (phone)
{
	document.getElementById("phone").value = phone;
	handleClick();
}

var testText = function (input)
{
	return !(input == undefined || input == "")
}

var parseServiceType = function (input){
	switch (input){
		case "DoorsWarehouse":
		 return "Дверь-склад";
		 break;
		case "WarehouseDoors":
		 return "Склад-Дверь";
		 break;
		case "WarehouseWarehouse":
		 return "Склад-Склад";
		 break;
		case "DoorsDoors":
		 return "Дверь-Дверь";
		 break;
		default: return input;
	}
}

var parseCargoType = function (input){
	switch (input){
		case "Parcel":
		 return "Посылка";
		 break;
		case "Documents":
		 return "Документы";
		 break;
		case "TiresWheels":
		 return "Шины-Диски";
		 break;
		case "Pallet":
		 return "Пеллеты";
		 break;
		case "Money":
		 return "Деньги";
		 break;
		case "CreditDocuments":
		 return "Кредитные документы";
		 break;
		case "SignedDocuments":
		 return "Контроль подписи документов";
		 break;
		 case "Trays":
		 return "Пiддони(тара)";
		 break;
		 
		default: return input;
	}
	
}


var parseCounterpartyType = function (input){
	switch (input){
		case "Organization":
		 return "Организация";
		 break;
		case "PrivatePerson":
		 return "Частное лицо";
		 break;
		 
		default: return input;
	}
	
}

var parseDocumentType = function (input){
	switch (input){
		case "CargoReturn":
		 return "Возврат";
		 break;
		case "Redirecting":
		 return "Переадресация";
		 break;
		 
		default: return input;
	}
	
}

var parseWarning = function (input){
	switch (input){
		case "Please enter a valid phone number from the express invoice to show full information":
		 return "Телефон не совпадает с номером отправителя или получателя. Для получения подробной информации попробуйте ввести номер еще раз.";
		 break;
				default: return input;
	}
	
}

var parseTrackingStatus = function (input)
{
	switch (input.statusCode){
		
		case "1": 
			return "Нова пошта очікує надходження від відправника"; 
			break;
		case "2": 
			return "Видалено"; 
			break;
		case TRACKING_NUMBER_NOT_FOUND: 
			return "Номер не знайдено";
			break;
		case "4": 
			return "Відправлення у місті "+input.CitySender+". (міжобласна доставка)";
			break;
		case "41": 
			return "Відправлення у місті "+input.CitySender+". (локально в межах міста)";
			break;
		case "5": 
		return "Відправлення прямує до міста "+input.CityRecipient+".";
			break;
		case "6": 
			return "Відправлення у місті "+input.CityRecipient+", орієнтовна доставка до ВІДДІЛЕННЯ-XXX "+input.ScheduledDeliveryDate+". Очікуйте додаткове повідомлення про прибуття.";
			break;
		case "7": 
		case "8": 
			return "Прибув на відділення";
			break;
		case "9": 
			return "Відправлення отримано";
			break;
		case "10": 
			return "Відправлення отримано "+input.RecipientDateTime+".<br>Протягом доби ви одержите SMS-повідомлення про надходження грошового переказу та зможете отримати його в касі відділення «Нова пошта».";
			break;
		case "11": 
			return "Відправлення отримано "+input.RecipientDateTime+".<br>Грошовий переказ видано одержувачу.";
			break;
		case "12": 
			return "Нова Пошта комплектує ваше відправлення";
			break;
		case "101": 
			return "На шляху до одержувача";
			break;
		case "102":
		case "103": 
		case "108": 
			return "Відмова одержувача";
			break;
		case "104": 
			return "Змінено адресу";
			break;
		case "105": 
			return "Припинено зберігання";
			break;
		case "106": 
			return "Одержано і створено ЄН зворотньої доставки";
			break;
		case "111": 
			return "Невдала спроба доставки через відсутність Одержувача на адресі або зв'язку з ним";
			break;
		case "112": 
			return "Дата доставки перенесена Одержувачем";
			break;
		default: return input.Status;
	}	
}


var parseTrackingNumber = function (inputString) {
	let Arr = [];
	let itemNumber = "";
	inputString.replace(/\D/g, " ").split(' ').filter(String).forEach((element, index, currentArr) => {
	itemNumber += element;
	if ((itemNumber.startsWith("2") | itemNumber.startsWith("5")) & itemNumber.length >= 14 | (itemNumber.startsWith("1") & itemNumber.length >= 8)) {
		Arr.push(itemNumber);
		itemNumber = "";
	}
	});
	if (Arr.indexOf(itemNumber) == -1 && itemNumber.length >0) { //add EW with wrong number if it`s last in sequence
		Arr.push(itemNumber);
	}
	return Arr;
}

var parsePhoneNumber = function(inputString) {
	return inputString.replace(/\D/g, "");
}

var postData = async function (url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return await response.json(); // parses JSON response into native JavaScript objects
}
}
).call(this);
