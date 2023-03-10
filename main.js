const getData = () => {
    const requestObj = {
        city: 'Washington,DC'
    };
    return requestObj;
};

const buildRequestUrl = (requestData) => {
    return `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${requestData.city}?key=S3MJMPCGJU93MVXEXW2GFJHZK`;
};

const requestWeather = async (url) => {
    const response = await fetch(url);
    const jsonResponse = await response.json();

    processJsonData(jsonResponse);
};

const processJsonData = jsonData => {
    console.log(jsonData);
};

const processWeatherRequest = async () => {
    const requestData = getData();
    const requestUrl = buildRequestUrl(requestData);
    await requestWeather(requestUrl);
};

processWeatherRequest();