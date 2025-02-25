import { experience } from "@/config/site.json";

function getDateDifferenceInMonths(initialDate: Date, finalDate: Date): number {
  return Math.max(
    (finalDate.getFullYear() - initialDate.getFullYear()) * 12 +
      finalDate.getMonth() -
      initialDate.getMonth(),
    0
  );
}

function getDateDifferenceInYears(initialDate: Date, finalDate: Date): number {
  return getDateDifferenceInMonths(initialDate, finalDate) / 12;
}

export function getExperienceYearsAmount() {
  const myFirstJobAsDeveloper = experience[0].subitems![1];
  const [year, month, day] = myFirstJobAsDeveloper.from
    .split("-")
    .map(Number)
    .map((date, index) => (index === 1 ? date - 1 : date));

  const startDateOfMyWorkExperience = new Date(year, month, day);

  return Math.trunc(
    getDateDifferenceInYears(startDateOfMyWorkExperience, new Date()),
  );
}
