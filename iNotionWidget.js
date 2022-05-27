// This scrip shows schedule in the calendar in a widget. The script is meant to be used with a widget configured on the Home Screen.
// You can run the script in the app to preview the widget or you can go to the Home Screen, add a new Scriptable widget and configure the widget to run this script.

// Set constants and default values
const DEFAULT_LOCATION = { latitude: 0, longitude: 0 };

// Font settings
const ICONSIZE = 25;
const TEXTSIZE = 14;
const TEXTOPACITY = 0.9;

// Set calendar name
const CLASS_SHEDULE = 'enter your calendar';
const PERSONAL_CALENDAR = 'enter your calendar';
// https://home.openweathermap.org/api_keys (account needed)
const WEATHER_API_KEY = 'enter your key';

// Create the component instance
const data = await fetchData();
const widget = await createWidget(data);

// Set the dynamic background color, the first is the bright state, the second is the dark state
widget.backgroundColor = Color.dynamic(
    new Color("#FFFFFF"),
    new Color("#191919")
);

if (config.runsInWidget) {
    // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
    Script.setWidget(widget)
} else {
    // The script runs inside the app, so we preview the widget.
    widget.presentMedium()
}

// The component script is complete
Script.setWidget(widget);
Script.complete();

// Main function
// @param {} data Use data to show the content
async function createWidget(data) {

    let widget = new ListWidget();
    // Display component content
    // Title    
    let titleStack = widget.addStack();
    let Title = titleStack.addText('RECENTS');
    Title.font = new Font('Arial-BoldMT', 10)
    Title.textOpacity = 0.5
    titleStack.setPadding(2, 0, 5, 0)

    // Class schedule
    let WorkStack = widget.addStack();
    WorkStack.centerAlignContent()
    let WorkLogo = WorkStack.addText(`📌`);
    WorkLogo.font = Font.systemFont(ICONSIZE)
    WorkStack.addSpacer(10);
    let Work = WorkStack.addText(`${getCalendarEventTitle(data.nextPersonalEvent)}`)
    Work.font = Font.mediumSystemFont(TEXTSIZE)
    Work.textOpacity = TEXTOPACITY
    WorkStack.url = "calshow://"
    WorkStack.setPadding(5, 0, 5, 0)
    WorkStack.addSpacer()

    // Personal
    let PersonalStack = widget.addStack();
    PersonalStack.centerAlignContent()
    let PersonalLogo = PersonalStack.addText(`📘`);
    PersonalLogo.font = Font.systemFont(ICONSIZE)
    PersonalStack.addSpacer(10);
    let Personal = PersonalStack.addText(`${getCalendarEventTitle(data.nextWorkEvent)}`)
    Personal.font = Font.mediumSystemFont(TEXTSIZE)
    Personal.textOpacity = TEXTOPACITY
    PersonalStack.url = "calshow://"
    PersonalStack.setPadding(1, 0, 1, 0)

    // Weather  
    let WeatherStack = widget.addStack();
    WeatherStack.centerAlignContent()
    let WeatherLogo = WeatherStack.addText(`️${data.weather.icon}`);
    WeatherLogo.font = Font.systemFont(ICONSIZE)
    WeatherLogo.url = "weather://"
    WeatherStack.addSpacer(10);
    let Weather = WeatherStack.addText(`${parseInt((data.weather.temperature - 32) / 1.8)}c Scope : ${parseInt((data.weather.high - 32) / 1.8)}c to ${parseInt((data.weather.low - 32) / 1.8)}c`)
    Weather.font = Font.mediumSystemFont(TEXTSIZE)
    Weather.textOpacity = TEXTOPACITY
    Weather.url = "weather://"
    WeatherStack.setPadding(0, 0, 2, 0)
    WeatherStack.addSpacer(90)

    let appIcon = await loadAppIcon()
    let appIconElement = WeatherStack.addImage(appIcon)
    appIconElement.imageSize = new Size(40, 40)
    appIconElement.url = "enter a url you want to link"

    return widget
}

// Fetch pieces of data for the widget.

async function fetchData() {
    // Get next work personal calendar events
    const nextWorkEvent = await fetchNextCalendarEvent(CLASS_SHEDULE);
    const nextPersonalEvent = await fetchNextCalendarEvent(PERSONAL_CALENDAR);

    // Get the weather data
    const weather = await fetchWeather();

    return {
        nextWorkEvent,
        nextPersonalEvent,
        weather,
    };
}

// Fetch the next "accepted" calendar event from the given calendar
// @param {*} calendarName The calendar to get events from

async function fetchNextCalendarEvent(calendarName) {
    const calendar = await Calendar.forEventsByTitle(calendarName);
    const events = await CalendarEvent.today([calendar]);
    const tomorrow = await CalendarEvent.tomorrow([calendar]);

    console.log(`Got ${events.length} events for ${calendarName}`);
    console.log(`Got ${tomorrow.length} events for ${calendarName} tomorrow`);

    const upcomingEvents = events.concat(tomorrow).filter(e => (new Date(e.endDate)).getTime() >= (new Date()).getTime());

    return upcomingEvents ? upcomingEvents[0] : null;
}

//Given a calendar event, return the display text with title and time.
// @param {*} calendarEvent The calendar event

function getCalendarEventTitle(calendarEvent) {
    if (!calendarEvent) {
        return `No upcoming events`;
    }

    const timeFormatter = new DateFormatter();
    timeFormatter.locale = 'it';
    timeFormatter.useNoDateStyle();
    timeFormatter.useShortTimeStyle();

    const eventTime = new Date(calendarEvent.startDate);

    return `${timeFormatter.string(eventTime)}  ${calendarEvent.title}`;
}

// Fetch the weather data from Open Weather Map

async function fetchWeather() {
    let location = await Location.current();
    if (!location) {
        location = DEFAULT_LOCATION;
    }

    const url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + location.latitude + "&lon=" + location.longitude + "&exclude=minutely,hourly,alerts&units=imperial&lang=en&appid=" + WEATHER_API_KEY;
    const address = await Location.reverseGeocode(location.latitude, location.longitude);
    const data = await fetchJson(url);

    return {
        icon: getWeatherEmoji(data.current.weather[0].id),
        temperature: Math.round(data.current.temp),
        high: Math.round(data.daily[0].temp.max),
        low: Math.round(data.daily[0].temp.min),
    }
}

//Given a weather code from Open Weather Map, determine the best emoji to show.
// @param {*} code Weather code from Open Weather Map

function getWeatherEmoji(code) {
    if (code >= 200 && code < 300 || code == 960 || code == 961) {
        return "⛈"
    } else if ((code >= 300 && code < 600) || code == 701) {
        return "🌧"
    } else if (code >= 600 && code < 700) {
        return "❄"
    } else if (code == 711) {
        return ""
    } else if (code == 800) {
        return ""
    } else if (code == 801) {
        return "🌤"
    } else if (code == 802) {
        return "⛅"
    } else if (code == 803) {
        return "🌥"
    } else if (code == 804) {
        return ""
    } else if (code == 900 || code == 962 || code == 781) {
        return "🌪"
    } else if (code >= 700 && code < 800) {
        return "🌫"
    } else if (code == 903) {
        return "🥶"
    } else if (code == 904) {
        return "🥵"
    } else if (code == 905 || code == 957) {
        return ""
    } else if (code == 906 || code == 958 || code == 959) {
        return "🧊"
    } else {
        return "❓"
    }
}

// Make a REST request and return the response
// @param {*} url URL to make the request to
// @param {*} headers Headers for the request

async function fetchJson(url, headers) {
    try {
        console.log(`Fetching url: ${url}`);
        const req = new Request(url);
        req.headers = headers;
        const resp = await req.loadJSON();
        return resp;
    } catch (error) {
        console.error(`Error fetching from url: ${url}, error: ${JSON.stringify(error)}`);
    }
}

// Load image
async function loadAppIcon() {
    let url = "https://s1.ax1x.com/2022/05/27/Xmk6aR.png"
    let req = new Request(url)
    return req.loadImage()
}
