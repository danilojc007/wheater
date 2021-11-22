sap.ui.define([], function (Object, JSONModel) {
    "use strict";
    return {
        inDebounce: null,
        configApiCities: {
            baseURL: "https://wft-geo-db.p.rapidapi.com/v1/geo",
            fixedParams: [{
                    param: "limit",
                    value: "10"
                },
                {
                    param: "languageCode",
                    value: "EN"
                }
            ],
            fixedHeaders: [{
                    param: "x-rapidapi-host",
                    value: "wft-geo-db.p.rapidapi.com"
                },
                {
                    param: "x-rapidapi-key",
                    value: "4fe174ea35msh51277f5899bf966p1b6bdbjsnb2e9cb7af8c0"
                }
                
            ]
        },
        configApiWheater: {
            baseURL: "https://api.openweathermap.org/data/2.5/weather",
            fixedParams: [{
                param: "APPID",
                value: "cea76ec969489fe260c64c96c1238a8c"
            },
            {
                param: "lang",
                value: "en"
            },
            {
                param: "units",
                value: "imperial"
            }   
            ]
        },
        callApiCities: function(path, callBack){
            const data = null;
            const xhr = new XMLHttpRequest();
            xhr.withCredentials = true;

            xhr.addEventListener("readystatechange", function () {
                if (this.readyState === this.DONE) {
                    callBack(JSON.parse(this.responseText));
                }
            });

            xhr.open("GET", path);
            this.configApiCities.fixedHeaders.forEach(element => {
                xhr.setRequestHeader(element.param, element.value);
            });
            xhr.send(data);
        },
        getCities: function (sQuery, callBack) {
            var path = this.configApiCities.baseURL;
            path = path + "/cities?namePrefix=" + sQuery;

            this.configApiCities.fixedParams.forEach(element => {
                path = path + "&" + element.param + "=" + element.value
            });

            this.callApiCities(path, callBack);  
        },
        getNearbyCities: function(lat, long, callBack){
            var path = this.configApiCities.baseURL;
            path = path + "/locations/"+ lat + long + "/nearbyCities"
            path = path + "?radius=100";
            this.callApiCities(path, callBack);  
        },
        getWheater: function (city, country, callBack, callBackError) {
            var path = this.configApiWheater.baseURL;
            path = path + "?q=" + city;
            if(country != null){
                path = path + "," + country;
            }
            this.configApiWheater.fixedParams.forEach(element => {
                path = path + "&" + element.param + "=" + element.value
            });
            fetch(path)
            .then(response => response.json())
            .then(data => {
                callBack(data);
            })
            .catch(err => {
                callBackError();
            })
        },
        debounce: function (func, delay) {
            const context = this
            const args = arguments
            clearTimeout(this.inDebounce)
            this.inDebounce = setTimeout(() => func.apply(context, args), delay)
        },
        clearDebbounce: function(){
            clearTimeout(this.inDebounce)
        }
    }
});