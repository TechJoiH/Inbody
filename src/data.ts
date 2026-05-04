export interface InBodyData {
  date: string;
  weight: number;
  muscle: number;
  fat: number;
  bmi: number;
  fatPercent: number;
  score: number;
  tbw: number;
  protein: number;
  minerals: number;
  whr: number;
  visceralFat: number;
  ffm: number;
  bmr: number;
  obesityDegree: number;
  smi: number;
  calorieIntake: number;
}

export const inbodyData: InBodyData[] = [
  { date: '2024-08-21', weight: 72.5, muscle: 30.1, fat: 19.1, bmi: 25.1, fatPercent: 26.4, score: 70, tbw: 39.1, protein: 10.7, minerals: 3.64, whr: 0.88, visceralFat: 7, ffm: 53.4, bmr: 1523, obesityDegree: 114, smi: 8.0, calorieIntake: 2359 },
  { date: '2024-11-18', weight: 71.1, muscle: 30.8, fat: 16.7, bmi: 24.6, fatPercent: 23.5, score: 73, tbw: 39.8, protein: 11.0, minerals: 3.65, whr: 0.88, visceralFat: 6, ffm: 54.4, bmr: 1544, obesityDegree: 112, smi: 8.0, calorieIntake: 2817 },
  { date: '2024-12-16', weight: 72.3, muscle: 32.0, fat: 16.3, bmi: 25.0, fatPercent: 22.6, score: 76, tbw: 41.1, protein: 11.2, minerals: 3.68, whr: 0.92, visceralFat: 6, ffm: 56.0, bmr: 1580, obesityDegree: 114, smi: 8.2, calorieIntake: 2853 },
  { date: '2025-02-23', weight: 74.4, muscle: 31.3, fat: 18.4, bmi: 25.7, fatPercent: 24.8, score: 73, tbw: 41.0, protein: 11.1, minerals: 3.87, whr: 0.89, visceralFat: 7, ffm: 56.0, bmr: 1579, obesityDegree: 117, smi: 8.2, calorieIntake: 2417 },
  { date: '2025-03-26', weight: 73.9, muscle: 32.3, fat: 16.9, bmi: 25.6, fatPercent: 22.9, score: 76, tbw: 41.8, protein: 11.4, minerals: 3.79, whr: 0.89, visceralFat: 6, ffm: 57.0, bmr: 1601, obesityDegree: 116, smi: 8.3, calorieIntake: 2402 },
  { date: '2025-04-09', weight: 73.9, muscle: 32.6, fat: 16.6, bmi: 25.6, fatPercent: 22.5, score: 77, tbw: 42.1, protein: 11.4, minerals: 3.79, whr: 0.87, visceralFat: 6, ffm: 57.3, bmr: 1608, obesityDegree: 116, smi: 8.5, calorieIntake: 2402 },
  { date: '2025-05-09', weight: 74.4, muscle: 33.5, fat: 15.7, bmi: 25.7, fatPercent: 21.1, score: 79, tbw: 43.0, protein: 11.7, minerals: 4.00, whr: 0.87, visceralFat: 6, ffm: 58.7, bmr: 1638, obesityDegree: 117, smi: 8.4, calorieIntake: 2417 },
  { date: '2025-08-25', weight: 68.0, muscle: 31.2, fat: 12.8, bmi: 23.5, fatPercent: 18.8, score: 78, tbw: 40.6, protein: 11.0, minerals: 3.57, whr: 0.86, visceralFat: 5, ffm: 55.2, bmr: 1563, obesityDegree: 107, smi: 8.0, calorieIntake: 2691 },
  { date: '2025-10-02', weight: 67.9, muscle: 31.4, fat: 12.5, bmi: 23.5, fatPercent: 18.4, score: 79, tbw: 40.7, protein: 11.0, minerals: 3.67, whr: 0.83, visceralFat: 4, ffm: 55.4, bmr: 1567, obesityDegree: 107, smi: 8.2, calorieIntake: 2689 },
  { date: '2025-11-01', weight: 67.5, muscle: 30.6, fat: 13.2, bmi: 23.4, fatPercent: 19.6, score: 77, tbw: 39.8, protein: 10.9, minerals: 3.65, whr: 0.83, visceralFat: 5, ffm: 54.3, bmr: 1542, obesityDegree: 106, smi: 8.0, calorieIntake: 2682 },
  { date: '2025-12-03', weight: 68.0, muscle: 31.8, fat: 12.1, bmi: 23.5, fatPercent: 17.8, score: 80, tbw: 41.0, protein: 11.2, minerals: 3.67, whr: 0.86, visceralFat: 4, ffm: 55.9, bmr: 1577, obesityDegree: 107, smi: 8.1, calorieIntake: 2691 },
  { date: '2026-01-09', weight: 68.5, muscle: 31.8, fat: 12.5, bmi: 23.7, fatPercent: 18.2, score: 79, tbw: 41.1, protein: 11.2, minerals: 3.68, whr: 0.85, visceralFat: 4, ffm: 56.0, bmr: 1580, obesityDegree: 108, smi: 8.1, calorieIntake: 2739 },
  { date: '2026-02-25', weight: 68.4, muscle: 31.1, fat: 13.5, bmi: 23.7, fatPercent: 19.8, score: 77, tbw: 40.3, protein: 10.9, minerals: 3.66, whr: 0.83, visceralFat: 5, ffm: 54.9, bmr: 1556, obesityDegree: 108, smi: 8.1, calorieIntake: 2698 },
  { date: '2026-04-06', weight: 68.0, muscle: 31.3, fat: 12.9, bmi: 23.5, fatPercent: 19.0, score: 78, tbw: 40.5, protein: 11.0, minerals: 3.56, whr: 0.88, visceralFat: 5, ffm: 55.1, bmr: 1559, obesityDegree: 107, smi: 8.2, calorieIntake: 2691 }
];
