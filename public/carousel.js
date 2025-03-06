(async () => {
  const { default: EmblaCarousel } = await import("https://unpkg.com/embla-carousel/esm/embla-carousel.esm.js");

  const addTogglePrevNextBtnsActive = (emblaApi, prevBtn, nextBtn) => {
    const togglePrevNextBtnsState = () => {
      if (emblaApi.canScrollPrev()) prevBtn.removeAttribute("disabled");
      else prevBtn.setAttribute("disabled", "disabled");

      if (emblaApi.canScrollNext()) nextBtn.removeAttribute("disabled");
      else nextBtn.setAttribute("disabled", "disabled");
    };

    emblaApi
      .on("select", togglePrevNextBtnsState)
      .on("init", togglePrevNextBtnsState)
      .on("reInit", togglePrevNextBtnsState);

    return () => {
      prevBtn.removeAttribute("disabled");
      nextBtn.removeAttribute("disabled");
    };
  };

  const addPrevNextBtnsClickHandlers = (emblaApi, prevBtn, nextBtn) => {
    const scrollPrev = () => {
      emblaApi.scrollPrev();
    };
    const scrollNext = () => {
      emblaApi.scrollNext();
    };

    prevBtn.addEventListener("click", scrollPrev, false);
    nextBtn.addEventListener("click", scrollNext, false);

    const removeTogglePrevNextBtnsActive = addTogglePrevNextBtnsActive(
      emblaApi,
      prevBtn,
      nextBtn,
    );

    return () => {
      removeTogglePrevNextBtnsActive();
      prevBtn.removeEventListener("click", scrollPrev, false);
      nextBtn.removeEventListener("click", scrollNext, false);
    };
  };

  const addDotBtnsAndClickHandlers = (emblaApi, dotsNode) => {
    let dotNodes = [];

    const tailwindClasses =
      "size-5 touch-manipulation rounded-full transition-colors duration-500 border-2 border-neutral-200 dark:border-neutral-700 data-[selected=true]:border-neutral-500 dark:data-[selected=true]:border-neutral-300";

    const addDotBtnsWithClickHandlers = () => {
      dotsNode.innerHTML = emblaApi
        .scrollSnapList()
        .map(
          () =>
            `<button class="embla__dot ${tailwindClasses}" type="button"></button>`,
        )
        .join("");

      const scrollTo = (index) => {
        emblaApi.scrollTo(index);
      };

      dotNodes = Array.from(dotsNode.querySelectorAll(".embla__dot"));
      dotNodes.forEach((dotNode, index) => {
        dotNode.addEventListener("click", () => scrollTo(index), false);
      });
    };

    const toggleDotBtnsActive = () => {
      const previous = emblaApi.previousScrollSnap();
      const selected = emblaApi.selectedScrollSnap();
      dotNodes[selected]?.setAttribute("data-selected", "true");
      dotNodes[previous]?.setAttribute("data-selected", "false");
    };

    emblaApi
      .on("init", addDotBtnsWithClickHandlers)
      .on("reInit", addDotBtnsWithClickHandlers)
      .on("init", toggleDotBtnsActive)
      .on("reInit", toggleDotBtnsActive)
      .on("select", toggleDotBtnsActive);

    return () => {
      dotsNode.innerHTML = "";
    };
  };

  // -------------------------------------------

  const emblaNode = document.querySelector(".embla");

  const viewportNode = emblaNode.querySelector(".embla__viewport");
  const prevBtnNode = emblaNode.querySelector(".embla__button--prev");
  const nextBtnNode = emblaNode.querySelector(".embla__button--next");
  const dotsNode = emblaNode.querySelector(".embla__dots");

  const emblaApi = EmblaCarousel(viewportNode, { align: "start" });

  const removePrevNextBtnsClickHandlers = addPrevNextBtnsClickHandlers(
    emblaApi,
    prevBtnNode,
    nextBtnNode,
  );

  const removeDotBtnsAndClickHandlers = addDotBtnsAndClickHandlers(
    emblaApi,
    dotsNode,
  );

  emblaApi.on("destroy", removePrevNextBtnsClickHandlers);
  emblaApi.on("destroy", removeDotBtnsAndClickHandlers);
})();