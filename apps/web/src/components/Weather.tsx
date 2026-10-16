import React from 'react';
import { Weather } from '@/lib/types';

interface WeatherProps {
  data: Weather;
}

export function WeatherWidget({ data }: WeatherProps) {
  return (
    <div className="weather-widget">
      <div className="weather-location">{data.city}</div>
      <div className="weather-main">
        <span className="weather-temp">{data.temp}°</span>
        <span className="weather-condition">{data.condition}</span>
      </div>
    </div>
  );
}
