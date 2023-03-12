const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const placeholderDataH = {
    time: 'Now',
    weatherIcon: './icons/clear_night_FILL0_wght400_GRAD0_opsz48.svg',
    humidity: 14, 
    air: 4
};

const placeholderDataW = {
    day: 'Today',
    humidity: 14, 
    air: 4,
    weatherIcon: './icons/clear_day_FILL0_wght400_GRAD0_opsz48.svg',
    tempHigh: 12,
    tempLow: 2
};

const dataHObj = () => placeholderDataH;
const dataWObj = () => placeholderDataW;

const addItemsToHourlyForecast = (data, svgList = null, updateHourlyForecastData = null) => {
    const container = document.querySelector('.app .hourly-forecast');
    const template = ({time, weatherIcon, humidity, air}) =>`
    <div>
        <p>${time}</p>
        <img src=${weatherIcon} alt="clear">
        <img src="./icons/humidity_percentage_FILL0_wght400_GRAD0_opsz48.svg" alt="humidity">
        <p class="humidity">${humidity}%</p>
        <img src="./icons/air_FILL0_wght400_GRAD0_opsz48.svg" alt="air">
        <p class="air">${air} m/s</p>
    </div>`;
    
    const receivedData = data;
    const date = new Date();
    let content = '';
    
    for(let i=0; i<5; i++){
        if(updateHourlyForecastData) data = updateHourlyForecastData(receivedData, svgList, i);
        if(!i) data.time = 'Now';
        else{ 
            date.setHours(date.getHours()+1);
            data.time = `${date.getHours()}:00`;
        }
        content += template(data);
    }
    container.innerHTML = content;
};

const addItemsToWeekForecast = (data, svgList = null, updateWeekForecastData = null) => {
    const container = document.querySelector('.app .week-forecast');
    const template = ({day, humidity, air, weatherIcon, tempHigh, tempLow}) =>`
    <div>
        <h4>${day}</h4>
        <div>
            <img src="./icons/humidity_percentage_FILL0_wght400_GRAD0_opsz48.svg" alt="humidity">
            <p class="humidity">${humidity}%</p>
        </div>
        <div>
            <img src="./icons/air_FILL0_wght400_GRAD0_opsz48.svg" alt="air">
            <p class="air">${air} m/s</p>
        </div>
        <img src="${weatherIcon}" alt="Weather">                            
        <div>
            <p>${tempHigh}&deg;/${tempLow}&deg;</p>
        </div>
    </div>`;
    
    const receivedData = data;
    const date = new Date();
    let content = '';

    for(let i=0; i<7; i++){
        if(updateWeekForecastData) data = updateWeekForecastData(receivedData, svgList, i);
        if(!i) data.day = 'Today';
        else{
            const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()+i);
            data.day = `${weekDays[nextDate.getDay()]}`;
        }
        content += template(data);
    }
    container.innerHTML = content;
};

const input = document.getElementById('city');

addItemsToHourlyForecast(placeholderDataH);
addItemsToWeekForecast(placeholderDataW);

const getData = () => {
    const requestObj = {
        city: 'Washington,DC'
    };
    return requestObj;
};

const buildRequestUrl = (requestData) => {
    return `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${requestData.city}?key=S3MJMPCGJU93MVXEXW2GFJHZK`;
};

const getTxtContent = async (file) => {
    const response = await fetch(file);
    const jsonResponse = await response.json();
    const processedResponse = jsonResponse.svgList;
    return processedResponse;
};

const requestWeather = async (url) => {
    const response = await fetch(url);
    const jsonResponse = await response.json();
    const svgList = await getTxtContent('svgList.json');

    const processedData = processJsonData(jsonResponse);
    updateHeaderData(processedData);
    addItemsToHourlyForecast(processedData, svgList, updateHourlyForecastData);
    addItemsToWeekForecast(processedData, svgList, updateWeekForecastData);
};

const processWeatherRequest = async () => {
    const requestData = getData();
    const requestUrl = buildRequestUrl(requestData);
    await requestWeather(requestUrl);
};

processWeatherRequest();

const processJsonData = jsonData => {
    const data = {
        days: jsonData.days,
    };
    return data;
};

const findIcon = (iconName, svgList) => {
    const arr = iconName.split('-');
    const primaryRe = new RegExp(`${iconName}-svgrepo-com.svg$`,'ig');
    const secondaryRe = new RegExp(`${arr[0]+'-'+arr[1]}-svgrepo-com.svg$`,'ig');
    const tertiaryRe = new RegExp(`${arr[1] ? arr[1]:arr[0]}-svgrepo-com.svg$`,'ig');
    
    return svgList.find(el => primaryRe.test(el)) || svgList.find(el => secondaryRe.test(el)) || svgList.find(el => tertiaryRe.test(el));
}; 

let iterator = 0;
const updateHourlyForecastData = (data, svgList , i) => {
    const today = new Date();
    let currData;
    if(today.getHours()+i-1 > 22){
        currData = data.days[0].hours[iterator];
        iterator++;
    }
    else currData = data.days[0].hours[today.getHours()+i-1];
    
    const dataH = dataHObj();
    const iconMatch = findIcon(currData.icon, svgList);
    console.log(currData);
    
    dataH.weatherIcon = `${'.'+iconMatch.split('weather-app')[1]}`;
    dataH.humidity = currData.humidity.toFixed(0);
    dataH.air = currData.windspeed.toFixed(0);

    return dataH;
}

const updateWeekForecastData = (data, svgList , i) => {
    const today = new Date();
    let currData = data.days[i];
    const dataW = dataWObj();
    const iconMatch = findIcon(currData.icon, svgList);

    dataW.weatherIcon = `${'.'+iconMatch.split('weather-app')[1]}`;
    dataW.humidity = currData.humidity.toFixed(0);
    dataW.air = currData.windspeed.toFixed(0);
    dataW.tempHigh = ((5/9)*(currData.tempmax - 32)).toFixed(0);
    dataW.tempLow = ((5/9)*(currData.tempmin - 32)).toFixed(0);

    return dataW;
}


const updateHeaderData = (data) => {
    const dateEl = document.querySelector('.app .curr-date');
    const tempEl = document.querySelector('.app .temp > div h1');
    const tempHighEl = document.querySelector('.app .temp > div > p.tempHigh');
    const tempLowEl = document.querySelector('.app .temp > div > p.tempLow');
    const today = new Date();
    
    const currData = data.days[0].hours.find(el => +el.datetime.split(':')[0] === today.getHours());
    
    dateEl.innerText = `${weekDays[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]}, ${today.getHours()}: ${today.getMinutes()}`;
    tempEl.innerHTML = `${((5/9)*(currData.temp - 32)).toFixed(0)}&deg;`;
    tempHighEl.innerHTML = `${((5/9)*(data.days[0].tempmax - 32)).toFixed(0)}&deg;`;
    tempLowEl.innerHTML = `${((5/9)*(data.days[0].tempmin - 32)).toFixed(0)}&deg;`;
};