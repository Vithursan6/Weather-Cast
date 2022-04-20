//Globals
var weatherUrl = 'https://api.openweathermap.org';
var apiKey = '629bd434d9ef026dbd7e7128bdc3d57c';
var searchHistory = [];
//DOM elements
var searchIn = document.querySelector('#search-input');
var searchForm = document.querySelector('#search-form');
var searchCont = document.querySelector('#search-container');
var dailyCont = document.querySelector('#daily-container');
var weeklyCont = document.querySelector('#weekly-container');

//Day.js plugins
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

//render search history
function renderHistory() {
    searchCont.innerHTML = '';
    //loop through history
    for (var i = searchHistory.length -1; i >= 0; i--) {
        var btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-controls', 'daily-container week-container');
        btn.classList.add('history-btn', 'btn-history');
        btn.setAttribute('data-search', searchHistory[i]);
        btn.textContent = searchHistory[i];
        searchCont.append(btn);
    }
}
//update localstorage history and history display
function appendHistory(search) {
    if (searchHistory.indexOf(search) !== -1) {
        return;
    }
    searchHistory.push(search);

    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    renderHistory();
}
//retrive localStorage search history
function searchInit() {
    var storedHistory = localStorage.getItem('search-history');
    if (storedHistory) {
        searchHistory = JSON.parse(storedHistory);
    }
    renderHistory();
}

//render current weather
function renderWeather(city, weather, tmz) {
    var date = dayjs().tz(tmz).format('MMM/DD/YYYY');

    var humidity = weather.humidity;
    var uvi = weather.uvi;
    var tempC = weather.temp;
    var windK = weather.wind_speed;
    var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    var iconDescription = weather.weather[0].description || weather[0].main;

    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var uviEl = document.createElement('p');
    var uviIcon = document.createElement('button');
    var weatherImg = document.createElement('img');
    var humidityEl = document.createElement('p');
    var headers = document.createElement('h2');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');

    headers.setAttribute("class", "h3 card-header");
    card.setAttribute("class", "card");
    cardBody.setAttribute("class", "card-body");
    humidityEl.setAttribute("class", "card-info");
    tempEl.setAttribute("class", "card-info");
    windEl.setAttribute("class", "card-info");
    card.append(cardBody);
    headers.textContent = `${city} (${date})`;
    weatherImg.setAttribute('src', iconUrl);
    weatherImg.setAttribute('alt', iconDescription);
    weatherImg.setAttribute('class', 'weather-img');
    headers.append(weatherImg);
    tempEl.textContent = `Temp: ${tempC}°C`;
    windEl.textContent = `Wind: ${windK} Kmh`;
    humidityEl.textContent = `Humidity: ${humidity} %`;
    cardBody.append(headers, tempEl, windEl, humidityEl);
    uviEl.textContent = 'UV Index: ';
    uviIcon.classList.add('btn', 'btn-sm');
  
    if (uvi < 3) {
      uviIcon.classList.add('btn-success');
    } else if (uvi < 7) {
      uviIcon.classList.add('btn-warning');
    } else {
      uviIcon.classList.add('btn-danger');
    }
    uviIcon.textContent = uvi;
    uviEl.append(uviIcon);
    cardBody.append(uviEl);
    dailyCont.innerHTML = '';
    dailyCont.append(card);
}
//render daily forecast card
function renderDailyCard(daily, tmz) {

    var unixT = daily.dt;
    var iconUrl = `https://openweathermap.org/img/w/${daily.weather[0].icon}.png`;
    var iconDescription = daily.weather[0].description;
    var tempC = daily.temp.day;
    var { humidity } = daily;
    var windK = daily.wind_speed;

    var col = document.createElement('div');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var headers = document.createElement('h5');
    var weatherImg = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');

    col.append(card);
    card.append(cardBody);
    cardBody.append(headers, weatherImg, tempEl, windEl, humidityEl);
  
    col.setAttribute('class', 'col-md');
    col.classList.add('five-day-card');
    card.setAttribute('class', 'card bg-primary h-100 text-white');
    cardBody.setAttribute('class', 'card-body p-2');
    headers.setAttribute('class', 'card-header');
    tempEl.setAttribute('class', 'card-info');
    windEl.setAttribute('class', 'card-info');
    humidityEl.setAttribute('class', 'card-info');

    headers.textContent = dayjs.unix(unixT).tz(tmz).format('M/D/YYYY');
    weatherImg.setAttribute('src', iconUrl);
    weatherImg.setAttribute('alt', iconDescription);
    tempEl.textContent = `Temp: ${tempC} °C`;
    windEl.textContent = `Wind: ${windK} Kmh`;
    humidityEl.textContent = `Humidity: ${humidity} %`;
    weeklyCont.append(col);
}

//render weekly forcast cards
function renderWeeklyCard(weekly, tmz) {
    var startDt = dayjs().tz(tmz).add(1, 'day').startOf('day').unix();
    var endDt = dayjs().tz(tmz).add(6, 'day').startOf('day').unix();
    var headingCol = document.createElement('div');
    var headers = document.createElement('h4');
  
    headingCol.setAttribute('class', 'row1');
    headers.textContent = 'Weekly Forecast :';
    headingCol.append(headers);  
    weeklyCont.innerHTML = '';
    weeklyCont.append(headingCol);

    for (var i=0; i < weekly.length; i++) {
        if (weekly[i].dt >= startDt && weekly[i].dt < endDt) {
            renderDailyCard(weekly[i], tmz);
        }
    }
}

function renderData(city, data) {
    renderWeather(city, data.current, data.tmz);
    renderWeeklyCard(data.daily, data.tmz);
}

//api fetch
function getWeather(location) {
    var { lat } = location;
    var { lon } = location;
    var city = location.name;
    var Url = `${weatherUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly&appid=${apiKey}`;

    fetch(Url).then(function (res) {
        return res.json();
    })
    .then(function (data) {
        renderData(city, data);
    })
    .catch(function (err) {
        console.error(err);
    });
}

function getCoordinates(search) {
    var Url = `${weatherUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${apiKey}`;

    fetch(Url).then(function (res) {
        return res.json();
    })
    .then(function (data) {
        if (!data[0]) {
            alert('Invalid Location!');
        } else {
            appendHistory(search);
            getWeather(data[0]);
        }
    })
    .catch(function (err) {
        console.error(err);
    });
}

function formSubmitHandler(e) {
    if (!searchIn.value) {
      return;
    }
  
    e.preventDefault();
    var search = searchIn.value.trim();
    getCoordinates(search);
    searchIn.value = '';
}

function SearchHistoryHandler(e) {
    if (!e.target.matches('.btn-history')) {
      return;
    }
  
    var btn = e.target;
    var search = btn.getAttribute('data-search');
    getCoordinates(search);
  }

searchInit();
searchForm.addEventListener('submit', formSubmitHandler);
searchCont.addEventListener('click', SearchHistoryHandler);