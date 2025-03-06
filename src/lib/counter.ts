if (!customElements.get("years-counter")) {
  class YearsCounter extends HTMLElement {
    _setNumberToShow(number: number): void {
      if ("innerText" in this) {
        this.innerText = `+${number}`;
      }
    }

    connectedCallback() {
      const yearsAmountFromDataset = this.dataset.yearsAmount;
      if (!yearsAmountFromDataset) {
        this._setNumberToShow(0);
        return;
      }

      let intervalId: number, numberToShow = 0;
      const yearsAmount = parseInt(yearsAmountFromDataset);

      intervalId = setInterval(() => {
        this._setNumberToShow(numberToShow++);

        if (numberToShow > yearsAmount) {
          clearInterval(intervalId);
        }
      }, 100);
    }
  }

  customElements.define("years-counter", YearsCounter);
}
