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

addItemsToHourlyForecast(placeholderDataH);
addItemsToWeekForecast(placeholderDataW);

const input = document.getElementById('city');



const getData = cityName => {
    const requestObj = {
        city: cityName
    };
    return requestObj;
};

const buildRequestUrl = (requestData) => {
    return `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${requestData.city}?key=S3MJMPCGJU93MVXEXW2GFJHZK`;
};

const getFileContent = async (file) => {
    const response = await fetch(file);
    const jsonResponse = await response.json();
    return jsonResponse;
};

const requestWeather = async (url) => {
    const response = await fetch(url);
    const jsonResponse = await response.json();
    const jsonSvgList = await getFileContent('svgList.json');
    const countries = await getFileContent('countries.min.json');
    
    const processedData = processJsonData(jsonResponse);
    updateHeaderData(processedData, jsonSvgList.svgList);
    addItemsToHourlyForecast(processedData, jsonSvgList.svgList, updateHourlyForecastData);
    addItemsToWeekForecast(processedData, jsonSvgList.svgList, updateWeekForecastData);
    chooseCity(countries);
};

const processWeatherRequest = async city => {
    const requestData = getData(city);
    const requestUrl = buildRequestUrl(requestData);
    await requestWeather(requestUrl);
};

processWeatherRequest('Washington,DC');

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

let indexSecond;
const updateHourlyForecastData = (data, svgList , i) => {
    const today = new Date();
    const hours = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours()+i+1).getUTCHours();
    
    const index = data.days[0].hours.findIndex(el => +el.datetime.split(':')[0] === hours);
    if(i === 2) indexSecond = index;
    // arr from server missing second entry
    const currData = index === -1 ? data.days[0].hours[indexSecond] : data.days[0].hours[index];
    
    const dataH = dataHObj();
    const iconMatch = findIcon(currData.icon, svgList);  
    
    dataH.weatherIcon = `${'.'+iconMatch.split('weather-app')[1]}`;
    dataH.humidity = currData.humidity.toFixed(0);
    dataH.air = currData.windspeed.toFixed(0);

    return dataHObj();;
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


const updateHeaderData = (data, svgList) => {
    const weatherIcon = document.querySelector('.app .temp > div img');
    const dateEl = document.querySelector('.app .curr-date');
    const tempEl = document.querySelector('.app .temp > div h1');
    const tempHighEl = document.querySelector('.app .temp > div > p.tempHigh');
    const tempLowEl = document.querySelector('.app .temp > div > p.tempLow');
    const today = new Date();
    
    const currData = data.days[0].hours.find(el => +el.datetime.split(':')[0] === today.getHours());
    const iconMatch = findIcon(currData.icon, svgList);  
    
    weatherIcon.src = `${'.'+iconMatch.split('weather-app')[1]}`;
    dateEl.innerText = `${weekDays[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]}, ${today.getHours()}: ${today.getMinutes()}`;
    tempEl.innerHTML = `${((5/9)*(currData.temp - 32)).toFixed(0)}&deg;`;
    tempHighEl.innerHTML = `${((5/9)*(data.days[0].tempmax - 32)).toFixed(0)}&deg;`;
    tempLowEl.innerHTML = `${((5/9)*(data.days[0].tempmin - 32)).toFixed(0)}&deg;`;
};


const chooseCity = countries => {
    const template = city => `<div><p>${city}</p></div>`;
    const countriesEl = document.querySelector('.app .countries');
    let content = '';
    input.addEventListener('input', e => {
        content = '';
        const re = new RegExp(`^${e.target.value}`,'i');
        let listOfCities = [];
        
        if(e.target.value != '')Object.keys(countries).forEach(country => listOfCities.push(...countries[country].filter(city => re.test(city))));

        const uniq = listOfCities.filter((city, i, arr) => arr.indexOf(city) === i);
        const first15Entries = uniq.length > 10 ? uniq.splice(0, 10) : uniq;

        first15Entries.forEach(city => content += template(city));
        countriesEl.innerHTML = content;
        countriesEl.querySelectorAll('div').forEach(el => el.addEventListener('click', clickEv => {
            processWeatherRequest(clickEv.target.innerText);
            countriesEl.innerHTML = '';  
            e.target.placeholder = clickEv.target.innerText;  
        },
        {once:true}));
    });
};
