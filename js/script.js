/**
 * Created by lurai on 01/02/2016.
 */

var backgrounds = {
    clear:      'img/clear.gif',
    overcast:   'img/overcast.gif',
    snow:       'img/snow.gif',
    rain:       'img/rain.gif',
    storm:      'img/storm.gif',
    fewClouds:  'img/fewClouds.gif',
    tornado:    'img/tornado.gif'
};

function getPosition() {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(

            function (position) {   // success

                var lat = position.coords.latitude;
                var lon = position.coords.longitude;
                console.log('Position: ' + lat + ' / ' + lon);
                getWeatherData([lat, lon]);
            },

            function (error) {           // error

                console.log('Geolocation not available. Error: ' + error.message);
                // LOCATION BY IP
                var api = 'b68a5ae312a5790b38fc231f633f9e189e681bf0efea29129aee12e676ee7752';
                var url = 'http://api.ipinfodb.com/v3/ip-city/?key=' + api +'&format=json';

                //<editor-fold desc="EJEMPLO JSON DE IP">
                //{
                //    "statusCode"      : "OK",
                //    "statusMessage"   : "",
                //    "ipAddress"       : "83.47.241.86",
                //    "countryCode"     : "ES",
                //    "countryName"     : "Spain",
                //    "regionName"      : "Navarra",
                //    "cityName"        : "Pamplona",
                //    "zipCode"         : "31080",
                //    "latitude"        : "42.8169",
                //    "longitude"       : "-1.64323",
                //    "timeZone"        : "+01:00"
                //}
                //</editor-fold>

                $.ajax({
                    url: url,
                    cache: false,
                    dataType: 'jsonp',
                    success: function(data) {
                        console.log(data);
                        getWeatherData([data.latitude, data.longitude]);
                    },
                    error: function() {
                        $("#weather .location").html('Unknown location');
                        console.log('An error has occurred fetching IP data');
                    }
                });
            }
        ); // getCurrentPosition

    } // if

} // getPosition()


function getWeatherData(position) {

    var lat = position[0];
    var lon = position[1];
    var api = 'fc253373089fdb78e742aaba7dcd0494';
    var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon +
        '&appid=' + api;

    //<editor-fold desc="EJEMPLO JSON OPENWEATHER">

    // {"coord":{"lon":139,"lat":35},
    //  "sys":{"country":"JP","sunrise":1369769524,"sunset":1369821049},
    //  "weather":[{"id":804,"main":"clouds","description":"overcast clouds","icon":"04n"}],
    //  "main":{"temp":289.5,"humidity":89,"pressure":1013,"temp_min":287.04,"temp_max":292.04},
    //  "wind":{"speed":7.31,"deg":187.002},
    //  "rain":{"3h":0},
    //  "clouds":{"all":92},
    //  "dt":1369824698,
    //  "id":1851632,
    //  "name":"Shuzenji",
    //  "cod":200}
    //</editor-fold>

    $.ajax({
        url: url,
        cache: false,
        dataType: 'jsonp',
        success: function(data) { displayWeather(data); },
        error: function() {
            console.log('An error has occurred fetching weather data');
        }
    });

} // getWeatherData()


function getTime(unixTime) {
    var date = new Date(unixTime * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    return hours + ':' + minutes.substr(-2);
}


function displayWeather(data) {

    var $body = $('body'),          $temperature = $('#temperature'),   $location = $('#location');
    var $icon = $('#icon'),         $description = $('#description'),   $time =$('#time');
    var $refresh = $('#refresh'),   $info = $('#info');

    var location    = data.name;
    var tempK       = data.main.temp;
    var description = data.weather[0].description;
    var unixTime    = data.dt;
    var weatherId   = String(data.weather[0].id, 10);

    var background  = null;
    var tempF       = Math.round(1.8 * (tempK - 273) + 32);
    var tempC       = Math.round(tempK - 273);
    var temp        = tempC;
    var icon        = null;

    // Set icon and background depending on weatherId
    switch(true) {
        case (weatherId === '800'):                // clear
            icon = weatherIcons.sun;
            $body.css('background-size', 'cover');
            background = backgrounds.clear;
            break;
        case (weatherId === '804'):                        // overcast clouds
            icon = weatherIcons.overcast;
            background = backgrounds.overcast;
            break;
        case (weatherId.charAt(0) === '6'):                // snow
            icon = weatherIcons.snow;
            pictureUrl = backgrounds.snow;
            break;
        case (weatherId.charAt(0) === '3'):                // light rain
            icon = weatherIcons.rain;
            $body.css('background-size', 'cover');
            background = backgrounds.rain;
            break;
        case (weatherId.charAt(0) === '2'):                // thunderstorm
            icon = weatherIcons.storm;
            background = backgrounds.storm;

            break;
        case (weatherId.charAt(0) === '5'):                // rain
            icon = weatherIcons.rain;
            $body.css('background-size', 'cover');
            background = backgrounds.rain;
            break;
        case (weatherId.charAt(0) === '8'):                // clouds
            icon = weatherIcons.scatteredClouds;
            background = backgrounds.fewClouds;
            break;
        default:                                    // extreme,...
            icon = weatherIcons.severe;
            $body.css('background-size', 'cover');
            background = backgrounds.tornado;
    }

    $body.css('background-image', 'url(' + background + ')');
    $location.html(location);
    $temperature.html(tempC + '&deg;C');

    $temperature.click(function() {
        if (temp === tempF) {
            temp = tempC;
            $temperature.html(temp + '&deg;C');
        } else {
            temp = tempF;
            $temperature.html(temp + '&deg;F');
        }
    });

    $icon.html('<img class="icon-img" src="' + icon + '" />');
    $description.html(description);
    $time.html('updated at ' + getTime(unixTime));

    $refresh.click( function() {
        $('#refresh i').addClass('fa-spin');
        getPosition();
    });
    $('#refresh i').removeClass('fa-spin');

    $info.click( function() {

        var text = '<p>This is a local weather app coded as part of the FreeCodeCamp curriculum. ' +
            'Weather data is retrieved from the OpenWeather API. ' +
            'It uses your geolocation, or an approximation via IP when geolocalization is not available.</p>' +
            '<br><br><p>Made with <i class="fa fa-heart-o" ></i> by lurai</p>';

        swal({
                title: 'About this app',
                text:text,
                html: true
        });

    });

} // displayWeather()



(function () {

    getPosition();

}());
