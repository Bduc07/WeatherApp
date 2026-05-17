import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from django.conf import settings
from django.http import JsonResponse


OPENWEATHER_BASE_URL = 'https://api.openweathermap.org'


def fetch_json(path, params):
    query = urlencode(params)
    with urlopen(f'{OPENWEATHER_BASE_URL}{path}?{query}', timeout=10) as response:
        return json.loads(response.read().decode('utf-8'))


def openweather_error_message(error):
    try:
        payload = json.loads(error.read().decode('utf-8'))
        message = payload.get('message')
        if message:
            return message
    except (json.JSONDecodeError, UnicodeDecodeError):
        pass

    return error.reason


def weather(request):
    city = request.GET.get('city', 'Kathmandu').strip() or 'Kathmandu'
    api_key = settings.OPENWEATHER_API_KEY

    if not api_key:
        return JsonResponse(
            {'error': 'OPENWEATHER_API_KEY is not set on the Django server.'},
            status=500,
        )

    try:
        locations = fetch_json(
            '/geo/1.0/direct',
            {'q': city, 'limit': 1, 'appid': api_key},
        )

        if not locations:
            return JsonResponse({'error': f'No weather location found for {city}.'}, status=404)

        location = locations[0]
        current = fetch_json(
            '/data/2.5/weather',
            {
                'lat': location['lat'],
                'lon': location['lon'],
                'appid': api_key,
                'units': 'metric',
            },
        )
    except HTTPError as error:
        return JsonResponse({'error': openweather_error_message(error)}, status=error.code)
    except (TimeoutError, URLError):
        return JsonResponse({'error': 'Weather service is not reachable.'}, status=503)

    weather_info = current['weather'][0] if current.get('weather') else {}
    main_info = current.get('main', {})
    wind_info = current.get('wind', {})

    return JsonResponse(
        {
            'location': f"{current.get('name', location['name'])}, {location.get('country', '')}",
            'condition': weather_info.get('description', 'Current weather'),
            'temperature': round(main_info.get('temp', 0)),
            'humidity': main_info.get('humidity', 0),
            'wind': round(wind_info.get('speed', 0) * 3.6),
            'pressure': main_info.get('pressure', 0),
            'feelsLike': round(main_info.get('feels_like', 0)),
        }
    )
