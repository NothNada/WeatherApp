function loadAnimation(condition) {
    const animationContainer = document.getElementById('animation');
    animationContainer.innerHTML = ''; // Limpa animação anterior

    let animFile = 'assets/animações/sun.json';
    if (condition.includes('Rain')) animFile = 'assets/animações/rain.json';
    else if (condition.includes('Cloud')) animFile = 'assets/animações/clouds.json';

    lottie.loadAnimation({
        container: animationContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: animFile
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    const citySpan = document.getElementById('city');
    const todayDiv = document.getElementById('today');
    const forecastDiv = document.getElementById('forecast');

    const loc = await window.weatherAPI.getLocation();
    const city = loc.city;
    citySpan.textContent = city;

    const data = await window.weatherAPI.getWeather(city);

    const current = data.list[0];
    const condition = current.weather[0].main;

    // Tema visual
    const body = document.body;
    if (condition.includes('Rain')) body.className = 'rainy-theme';
    else if (condition.includes('Clear')) body.className = 'sunny-theme';
    else if (condition.includes('Clouds')) body.className = 'cloudy-theme';
    else body.className = 'default-theme';

    // Carrega animação Lottie
    loadAnimation(condition);

    // Dia atual
    todayDiv.innerHTML = `
      <h2>Agora</h2>
      <p>${current.main.temp}°C - ${current.weather[0].description}</p>
    `;

    // Previsão próxima (1 por dia)
    // Previsão dos próximos dias
    
    await updateWeatherForCity(city);

    document.getElementById('search-button').addEventListener('click', async () => {
        const input = document.getElementById('search-input').value.trim();
        if (input) {
            await updateWeatherForCity(input);
        }
    });

    document.getElementById('search-input').addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const input = document.getElementById('search-input').value.trim();
            if (input) {
                await updateWeatherForCity(input);
            }
        }
    });


});

function setTheme(condition) {
    const body = document.body;

    if (condition.includes('Rain')) body.className = 'rainy-theme';
    else if (condition.includes('Clear')) body.className = 'sunny-theme';
    else if (condition.includes('Cloud')) body.className = 'cloudy-theme';
    else body.className = 'default-theme';
}

async function updateWeatherForCity(city) {
    const citySpan = document.getElementById('city');
    const todayDiv = document.getElementById('today');
    const forecastDiv = document.getElementById('forecast');
    const app = document.getElementById('app');

    try {
        const data = await window.weatherAPI.getWeather(city);
        citySpan.textContent = city;

        const current = data.list[0];
        const condition = current.weather[0].main;

        setTheme(condition);
        loadAnimation(condition);

        app.classList.add('fade-out');
        setTimeout(() => {
            todayDiv.innerHTML = `
          <h2>Agora</h2>
          <p>${current.main.temp}°C - ${current.weather[0].description}</p>
        `;

            forecastDiv.innerHTML = '<h2>Próximos dias</h2>';

            const dayCard = document.createElement('div');
            dayCard.classList.add('forecast-day');
            dayCard.innerHTML = `<strong>Domingo á Noite</strong>: 20°C - limpo`;

            dayCard.addEventListener('click', () => {
                app.classList.add('fade-out');
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "smooth"
                });
                setTimeout(() => {
                    
                    todayDiv.innerHTML = `
                        <h2>Domingo à Noite</h2>
                        <p>20°C - Clima limpo mas cheio de tristeza e melancolia</p>
                    `;
                    document.body.className = 'rainy-theme';
                    const animationContainer = document.getElementById('animation');
                    animationContainer.innerHTML = `
                       <video width="200" height="200" autoplay>
                        <source src="assets/video/domingo.mp4" type="video/mp4">
                       </video>
                    `;
                    app.classList.remove('fade-out');
                    app.classList.add('fade-in');
                    setTimeout(() => app.classList.remove('fade-in'), 500);
                }, 500);
            });

            forecastDiv.appendChild(dayCard);

            for (let i = 8; i < data.list.length; i += 8) {
                const item = data.list[i];
                const date = new Date(item.dt * 1000);
                const day = date.toLocaleDateString('pt-BR', { weekday: 'long' });
                const temp = item.main.temp.toFixed(0);
                const condition = item.weather[0].main;

                const dayCard = document.createElement('div');
                dayCard.classList.add('forecast-day');
                dayCard.innerHTML = `<strong>${day}</strong>: ${temp}°C - ${condition}`;

                dayCard.addEventListener('click', () => {
                    app.classList.add('fade-out');
                    window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "smooth"
                    });
                    setTimeout(() => {
                        todayDiv.innerHTML = `
                            <h2>${day}</h2>
                            <p>${temp}°C - ${item.weather[0].description}</p>
                        `;
                        setTheme(condition);
                        loadAnimation(condition);
                        app.classList.remove('fade-out');
                        app.classList.add('fade-in');
                        setTimeout(() => app.classList.remove('fade-in'), 500);
                    }, 500);
                });

                forecastDiv.appendChild(dayCard);
            }

            app.classList.remove('fade-out');
            app.classList.add('fade-in');
            setTimeout(() => app.classList.remove('fade-in'), 500);
        }, 500);

        // Mostra as horas que vai chover
        const rainTimesDiv = document.getElementById('rain-times');
        rainTimesDiv.innerHTML = ''; // limpa

        const rainForecasts = data.list.filter(item => item.weather[0].main.includes('Rain'));

        if (rainForecasts.length === 0) {
        rainTimesDiv.innerHTML = '<p>Sem chuva nas próximas horas.</p>';
        } else {
        rainForecasts.forEach(item => {
            const date = new Date(item.dt * 1000);
            const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const description = item.weather[0].description;
            const temp = item.main.temp.toFixed(0);

            const rainItem = document.createElement('p');
            rainItem.innerHTML = `${time} - ${description} (${temp}°C)`;
            rainTimesDiv.appendChild(rainItem);
        });
        }


    } catch (error) {
        alert('Não foi possível encontrar a cidade.');
        console.error(error);
    }
}
