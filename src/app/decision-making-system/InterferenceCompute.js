import { addDoc, collection } from 'firebase/firestore';
import { db } from 'firebase';
import loadKnowledgeBase from './utils/loadKnowledgeBase';

const compute = async (formData, user) => {
  const knowledgeBase = await loadKnowledgeBase();
  if (!knowledgeBase) {
    console.log('Błąd wczytywania bazy wiedzy!');
    return;
  }
  const uid = user.uid;
  const form = {
    fuelType: [formData.fuelType],
    engineSuperchargingType: [formData.engineSuperchargingType],
    faultType: [formData.faultType],
    description: [formData.description],
    engineFailure_noisyWork: [formData.engineFailure_noisyWork],
    engineFailure_heavyShiftingGears: [formData.engineFailure_heavyShiftingGears],
    engineFailure_unevenWork: [formData.engineFailure_unevenWork],
    engineFailure_whenAccelerating: [formData.engineFailure_whenAccelerating],
    engineFailure_increasedFuelConsumption: [formData.engineFailure_increasedFuelConsumption],
    engineFailure_lossOfEnginePower: [formData.engineFailure_lossOfEnginePower],
    engineFailure_noises: [formData.engineFailure_noises],
    engineFailure_vibrationsWhileDriving: [formData.engineFailure_vibrationsWhileDriving],
    engineFailure_suddenEngineStop: [formData.engineFailure_suddenEngineStop],
    engineFailure_temperatureDifficultyStartingTheEngine: [
      formData.engineFailure_temperatureDifficultyStartingTheEngine,
    ],
    engineFailure_exhaustPipeSmokeColor: [formData.engineFailure_exhaustPipeSmokeColor],
    engineFailure_warningLightsGlowPlug: [formData.engineFailure_warningLightsGlowPlug],
    engineFailure_warningLightsCheckEngine: [formData.engineFailure_warningLightsCheckEngine],
    engineFailure_warningLightsEngineCoolant: [formData.engineFailure_warningLightsEngineCoolant],
    engineFailure_warningLightsEngineOil: [formData.engineFailure_warningLightsEngineOil],
    engineFailure_warningLightsBattery: [formData.engineFailure_warningLightsBattery],
  };

  const generatedCombinations = generateCombinations(form);
  let isMatchingIssues;
  generatedCombinations.forEach((combination) => {
    const matchingIssues = identifyIssues(combination, knowledgeBase);

    if (matchingIssues.length >= 1) {
      const matchingIssuesInfo = matchingIssues.map((issue) => `${issue.issue}: ${issue.solution}`);
      isMatchingIssues = matchingIssuesInfo;
    } else {
      isMatchingIssues = 'Nie można określić przyczyny usterki';
    }
  });

  try {
    const repairOrdersDocRef = collection(db, 'repair-orders');
    let date = new Date();
    await addDoc(repairOrdersDocRef, {
      uid: uid,
      dateTime: date,
      name: formData.name,
      surname: formData.surname,
      carBrand: formData.selectedCarBrand,
      carModel: formData.selectedCarModel,
      faultType: formData.faultType,
      computedIssues: isMatchingIssues,
      description: formData.description,
      status: 'Weryfikacja',
      isActive: true,
    });
  } catch (error) {
    console.error('Błąd:', error);
  }

  function generateCombinations(categories) {
    const keys = Object.keys(categories);
    const combinations = [];

    const generate = (index, combination) => {
      if (index === keys.length) {
        combinations.push({ ...combination });
        return;
      }

      const currentCategory = keys[index];
      const symptoms = categories[currentCategory];

      for (const symptomValue of symptoms) {
        combination[currentCategory] = symptomValue;
        generate(index + 1, combination);
      }
    };

    generate(0, {});
    return combinations;
  }

  function identifyIssues(combination, knowledgeBase) {
    return knowledgeBase.filter((issue) => {
      const matchingSymptoms = issue.symptomRequirements.filter((requirement) => {
        const symptomValue = combination[requirement.field];
        if (symptomValue === undefined) return false;

        if (requirement.values) {
          return requirement.values.includes(symptomValue);
        } else {
          return symptomValue === requirement.value;
        }
      });

      return matchingSymptoms.length >= issue.minSymptoms;
    });
  }
};
export default compute;
