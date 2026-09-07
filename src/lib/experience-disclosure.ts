const DISCLOSURE_SELECTOR = "[data-experience-disclosure]";
const JOB_SELECTOR = ".job";

function toggleDisclosure(button: HTMLElement): void {
  const job = button.closest<HTMLElement>(JOB_SELECTOR);
  if (!job) { return; }

  const nextOpenState = job.dataset.open !== "true";

  job.dataset.open = String(nextOpenState);
  button.setAttribute("aria-expanded", String(nextOpenState));
}

const disclosureButtons =
  document.querySelectorAll<HTMLElement>(DISCLOSURE_SELECTOR);

disclosureButtons.forEach((button) => {
  button.addEventListener("click", () => toggleDisclosure(button));
});
