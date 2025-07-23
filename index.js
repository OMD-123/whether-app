const usertab = document.querySelector("[data-userwhether]");
const searchtab = document.querySelector("[data-searchWhether]");
const usercontainer = document.querySelector(".whether-cont");

const grantacces = document.querySelector(".grant-location");
const searchform = document.querySelector("[data-search]");
const loadingvisible = document.querySelector(".loadingscreen");
const userinfocont = document.querySelector(".user-info-container");
const grantbtn = document.querySelector("[data-grant-access]");

let currentTab = usertab;
let API_KEY = "235f12b60a81376aeca0a467fdf20b4b";

if (currentTab) currentTab.classList.add("current-tab");

document.addEventListener('DOMContentLoaded', function () {
    getfromsessionstorage();
});

if (usertab) {
    usertab.addEventListener('click', () => switchtab(usertab));
}
if (searchtab) {
    searchtab.addEventListener('click', () => switchtab(searchtab));
}

function switchtab(clicktab) {
    if (clicktab != currentTab) {
        currentTab.classList.remove("current-tab");
        userinfocont.classList.remove("active");
        currentTab = clicktab;
        currentTab.classList.add("current-tab");


        if (clicktab === usertab) {
            searchform.classList.remove("active");
            usercontainer.classList.remove("active");
            grantacces.classList.remove("active");
            // userinfocont.classList.add("active");
             getfromsessionstorage();
        } else {
            usercontainer.classList.remove("active");
            grantacces.classList.remove("active");
            searchform.classList.add("active");
            // userinfocont.classList.add("active");
        }
    }
}

function getfromsessionstorage() {
    let usercoodinate = sessionStorage.getItem("user-coordinates");
    if (!usercoodinate) {
        grantacces.classList.add("active");
    } else {
        const coordinates = JSON.parse(usercoodinate);
        FeatchUserWeatherInfo(coordinates);
    }
}

async function FeatchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    grantacces.classList.remove("active");
    loadingvisible.classList.add("active");
    userinfocont.classList.add("active");

    try {
        let res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        let data = await res.json();
        loadingvisible.classList.remove("active");
        usercontainer.classList.add("active");
        renderWhetherInfo(data);
    } catch (err) {
        loadingvisible.classList.remove("active");
        alert("Could not fetch weather data. Please try again.");
        grantacces.classList.add("active");
    }
}

function renderWhetherInfo(whetherdata) {
    const citname = document.querySelector("[data-cityname]");
    const countryFlag = document.querySelector("[data-countryIcon]");
    const weatherdesc = document.querySelector("[data-description]");
    const whethericon = document.querySelector("[data-weather-icon]");
    const temperature = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windSpeed]");
    const humanity = document.querySelector("[data-humidity]");
    const pressure = document.querySelector("[data-pressure]");

    citname.textContent = whetherdata?.name || "Unknown";
    countryFlag.src = `https://flagcdn.com/144x108/${whetherdata?.sys?.country.toLowerCase()}.png`;
    weatherdesc.innerText = whetherdata?.weather?.[0]?.description || "No description";
    whethericon.src = `https://openweathermap.org/img/w/${whetherdata?.weather?.[0]?.icon}.png`;
    temperature.innerText = `${Math.round(whetherdata?.main?.temp || 0)}°C`;
    windSpeed.innerText = `${whetherdata?.wind?.speed || 0} m/s`;
    humanity.innerText = `${whetherdata?.main?.humidity || 0}%`;
    pressure.innerText = `${whetherdata?.main?.pressure || 0} hPa`;
}

function getlocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showpostion, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showpostion(Position) {
    const ussercoodinate = {
        lat: Position.coords.latitude,
        lon: Position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(ussercoodinate));
    FeatchUserWeatherInfo(ussercoodinate);
}

function showError(error) {
    let message;
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            message = "The request to get user location timed out.";
            break;
        default:
            message = "An unknown error occurred.";
    }
    alert(message);
    grantacces.classList.add("active");
}

if (grantbtn) {
    grantbtn.addEventListener('click', getlocation);
}

let searchInput = document.querySelector("[data-searchInput]");

if (searchform) {
    searchform.addEventListener("submit", (e) => {
        e.preventDefault();
        let cityname = searchInput?.value?.trim();
        if (cityname === "" || !cityname) return;
        else feachsearchinfo(cityname);
    });
}

async function feachsearchinfo(city) {
    loadingvisible.classList.add("active");
    usercontainer.classList.remove("active");
    grantacces.classList.remove("active");
   

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        if (data.cod === "404") throw new Error("City not found");

        // loadingvisible.classList.remove("active");
        usercontainer.classList.add("active");
            loadingvisible.classList.remove("active");
         userinfocont.classList.add("active");

        renderWhetherInfo(data);

        if (searchInput) searchInput.value = "";

    } catch (error) {
        loadingvisible.classList.remove("active");
        alert(`Could not fetch weather data for "${city}". Please check the city name and try again.`);
        if (currentTab === usertab) getfromsessionstorage();
        else searchform.classList.add("active");
    }
}


