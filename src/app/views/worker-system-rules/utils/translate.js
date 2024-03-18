const translateFieldName = (fieldName) => {
  const translationMap = {
    fuelType: 'Rodzaj paliwa: ',
    diesel: 'diesel',
    gasoline: 'benzyna',
    lpg: 'instalacja lpg',
    engineSuperchargingType: 'Rodzaj doładowania: ',
    turbo: 'turbosprężarkowe',
    compressor: 'mechaniczne (kompresor)',
    engineFailure_noisyWork: 'Głośna praca',
    engineFailure_heavyShiftingGears: 'Odgłosy przy zmianie biegów',
    engineFailure_unevenWork: 'Nierówna praca',
    engineFailure_whenAccelerating: 'Przerywanie podczas przyśpieszania',
    engineFailure_increasedFuelConsumption: 'Zwiększone zużycie paliwa',
    engineFailure_lossOfEnginePower: 'Utrata mocy silnika',
    engineFailure_noises: 'Niepokojące odgłosy dobiegające z silnika',
    engineFailure_vibrationsWhileDriving: 'Wibracje podczas jazdy',
    engineFailure_suddenEngineStop: 'Nagłe zatrzymanie pracy silnika',
    engineFailure_temperatureDifficultyStartingTheEngine: 'Trudności z uruchomieniem, gdy silnik ',
    warm: 'ciepły',
    cold: 'zimny',
    both: 'zimny i ciepły',
    engineFailure_exhaustPipeSmokeColor: 'Kolor spalin: ',
    white: 'biały',
    black: 'czarny',
    blue: 'niebieski',
    engineFailure_warningLightsGlowPlug: 'Kontrolka świec żarowych',
    engineFailure_warningLightsCheckEngine: 'Kontrolka check engine',
    engineFailure_warningLightsEngineCoolant: 'Kontrolka temperatury płynu chłodzącego',
    engineFailure_warningLightsEngineOil: 'Kontrolka oleju',
    engineFailure_warningLightsBattery: 'Kontrolka akumulatora',
  };

  return translationMap[fieldName] || fieldName;
};

export default translateFieldName;
