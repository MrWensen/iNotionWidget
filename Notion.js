// Cache keys and default location
const CACHE_KEY_LAST_UPDATED = 'last_updated';
const CACHE_KEY_LOCATION = 'location';
const DEFAULT_LOCATION = { latitude: 0, longitude: 0 };

// Font name and size
const FONT_NAME = 'Arial';
const TITLE_FONT_SIZE = 10;
const FONT_SIZE = 15;

// Colors
const COLORS = {
    bg: '#191919',
    title: '#D5D5D5',
    body: '#D5D5D5',
};

// TODO: PLEASE SET THESE VALUES
const NAME = '';
const WEATHER_API_KEY = ''; // https://home.openweathermap.org/api_keys (account needed)
const WORK_CALENDAR_NAME = '';
const PERSONAL_CALENDAR_NAME = '';

/******************************************************************************
 * Initial Setups
 *****************************************************************************/

/**
 * Convenience function to add days to a Date.
 * 
 * @param {*} days The number of days to add
 */

// Import and setup Cache
const Cache = importModule('Cache');
const cache = new Cache('Notion');

// Fetch data and create widget
const data = await fetchData();
const widget = createWidget(data);

if (config.runsInApp) {
    widget.presentMedium();
}

Script.setWidget(widget);
Script.complete();

/******************************************************************************
 * Main Functions (Widget and Data-Fetching)
 *****************************************************************************/

/**
 * Main widget function.
 * 
 * @param {} data The data for the widget to display
 */
function createWidget(data) {
    console.log(`Creating widget with data: ${JSON.stringify(data)}`);

    const widget = new ListWidget();
    widget.backgroundColor = new Color(COLORS.bg);
    widget.setPadding(1, 10, 1, 10);

    const stack = widget.addStack();
    stack.layoutVertically();
    stack.spacing = 13;
    stack.size = new Size(320, 0);

    const stack1 = widget.addStack();
    stack1.layoutHorizontally();
    stack1.spacing = 13;
    stack1.size = new Size(320, 0);

    // Line 0 - Title
    const titleLine = stack.addText(`MESSAGE`);
    titleLine.textColor = new Color(COLORS.title);
    titleLine.font = new Font('Arial-BoldMT', TITLE_FONT_SIZE);
    titleLine.url = 'notion://'

    // Line 1 - Next Work Calendar Event
    const nextWorkCalendarEventLine = stack.addText(` 📌   ${getCalendarEventTitle(data.nextWorkEvent, true)}`);
    nextWorkCalendarEventLine.textColor = new Color(COLORS.body);
    nextWorkCalendarEventLine.font = new Font(FONT_NAME, FONT_SIZE);
    nextWorkCalendarEventLine.url = "calshow://"

    // Line 2 - Next Personal Calendar Event
    const nextPersonalCalendarEventLine = stack.addText(` 📘   ${getCalendarEventTitle(data.nextPersonalEvent, false)}`);
    nextPersonalCalendarEventLine.textColor = new Color(COLORS.body);
    nextPersonalCalendarEventLine.font = new Font(FONT_NAME, FONT_SIZE);
    nextPersonalCalendarEventLine.url = "calshow://"

    // Line 3 - Weather
    const weatherLine = stack.addText(` ${data.weather.icon}   ${parseInt((data.weather.temperature - 32) / 1.8)}c Scope : ${parseInt((data.weather.high - 32) / 1.8)}c to ${parseInt((data.weather.low - 32) / 1.8)}c`);
    weatherLine.textColor = new Color(COLORS.body);
    weatherLine.font = new Font(FONT_NAME, FONT_SIZE);
    weatherLine.url = "weather://"

    // Add button to open documentation
    let linkSymbol = SFSymbol.named("arrow.up.forward")
    let footerStack = widget.addStack()
    footerStack.addSpacer(290)
    // Add link to documentation
    let docsSymbol = SFSymbol.named("book")
    let docsElement = footerStack.addImage(docsSymbol.image)
    docsElement.imageSize = new Size(25, 15)
    docsElement.tintColor = Color.white()
    docsElement.imageOpacity = 1
    docsElement.url = ""

    return widget;
}

/**
 * Fetch pieces of data for the widget.
 */
async function fetchData() {
    // Get the weather data
    const weather = await fetchWeather();

    // Get next work/personal calendar events
    const nextWorkEvent = await fetchNextCalendarEvent(WORK_CALENDAR_NAME);
    const nextPersonalEvent = await fetchNextCalendarEvent(PERSONAL_CALENDAR_NAME);

    return {
        weather,
        nextWorkEvent,
        nextPersonalEvent,
    };
}

/******************************************************************************
 * Helper Functions
 *****************************************************************************/

//-------------------------------------
// Weather Helper Functions
//-------------------------------------

/**
 * Fetch the weather data from Open Weather Map
 */
async function fetchWeather() {
    let location = await cache.read(CACHE_KEY_LOCATION);
    if (!location) {
        try {
            Location.setAccuracyToThreeKilometers();
            location = await Location.current();
        }
        catch (error) {
            location = await cache.read(CACHE_KEY_LOCATION);
        }
    }
    if (!location) {
        location = DEFAULT_LOCATION;
    }
    const url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + location.latitude + "&lon=" + location.longitude + "&exclude=minutely,hourly,alerts&units=imperial&lang=en&appid=" + WEATHER_API_KEY;
    const address = await Location.reverseGeocode(location.latitude, location.longitude);
    const data = await fetchJson(url);

    const cityState = `${address[0].postalAddress.city}, ${address[0].postalAddress.state}`;

    if (!data) {
        return {
            location: cityState,
            icon: '❓',
            description: 'Unknown',
            temperature: '?',
            wind: '?',
            high: '?',
            low: '?',
            feelsLike: '?',
        }
    }

    const currentTime = new Date().getTime() / 1000;
    const isNight = currentTime >= data.current.sunset || currentTime <= data.current.sunrise

    return {
        location: cityState,
        icon: getWeatherEmoji(data.current.weather[0].id, isNight),
        description: data.current.weather[0].main,
        temperature: Math.round(data.current.temp),
        wind: Math.round(data.current.wind_speed),
        high: Math.round(data.daily[0].temp.max),
        low: Math.round(data.daily[0].temp.min),
        feelsLike: Math.round(data.current.feels_like),
    }
}

/**
 * Given a weather code from Open Weather Map, determine the best emoji to show.
 * 
 * @param {*} code Weather code from Open Weather Map
 * @param {*} isNight Is `true` if it is after sunset and before sunrise
 */
function getWeatherEmoji(code, isNight) {
    if (code >= 200 && code < 300 || code == 960 || code == 961) {
        return "⛈"
    } else if ((code >= 300 && code < 600) || code == 701) {
        return "🌧"
    } else if (code >= 600 && code < 700) {
        return "❄️"
    } else if (code == 711) {
        return ""
    } else if (code == 800) {
        return isNight ? "🌕" : "️"
    } else if (code == 801) {
        return isNight ? "️" : "🌤"
    } else if (code == 802) {
        return isNight ? "️" : "⛅️"
    } else if (code == 803) {
        return isNight ? "️" : "🌥"
    } else if (code == 804) {
        return "️"
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

//-------------------------------------
// Calendar Helper Functions
//-------------------------------------

/**
 * Fetch the next calendar event from the given calendar
 * 
 * @param {*} calendarName The calendar to get events from
 */
async function fetchNextCalendarEvent(calendarName) {
    const calendar = await Calendar.forEventsByTitle(calendarName);
    const events = await CalendarEvent.today([calendar]);
    const tomorrow = await CalendarEvent.tomorrow([calendar]);

    console.log(`Got ${events.length} events for ${calendarName}`);
    console.log(`Got ${tomorrow.length} events for ${calendarName} tomorrow`);

    const upcomingEvents = events.concat(tomorrow).filter(e => (new Date(e.endDate)).getTime() >= (new Date()).getTime());

    return upcomingEvents ? upcomingEvents[0] : null;
}

/**
 * Given a calendar event, return the display text with title and time.
 * 
 * @param {*} calendarEvent The calendar event
 * @param {*} isWorkEvent Is this a work event?
 */
function getCalendarEventTitle(calendarEvent, isWorkEvent) {
    if (!calendarEvent) {
        return `No upcoming ${isWorkEvent ? 'lessons' : 'events'}`;
    }

    const timeFormatter = new DateFormatter();
    timeFormatter.locale = 'it';
    timeFormatter.useNoDateStyle();
    timeFormatter.useShortTimeStyle();

    const eventTime = new Date(calendarEvent.startDate);

    return `${timeFormatter.string(eventTime)} ${calendarEvent.title}`;
}

/**
 * Make a REST request and return the response
 * 
 * @param {*} url URL to make the request to
 * @param {*} headers Headers for the request
 */

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