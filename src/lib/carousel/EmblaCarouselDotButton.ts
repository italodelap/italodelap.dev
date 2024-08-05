import { type EmblaCarouselType } from 'embla-carousel'

export const addDotBtnsAndClickHandlers = (
  emblaApi: EmblaCarouselType,
  dotsNode: HTMLElement
): (() => void) => {
  let dotNodes: HTMLElement[] = []

  const tailwindClasses = "size-5 touch-manipulation rounded-full transition-colors duration-500 border-2 border-neutral-200 dark:border-neutral-700 data-[selected=true]:border-neutral-500 dark:data-[selected=true]:border-neutral-300";

  const addDotBtnsWithClickHandlers = (): void => {
    dotsNode.innerHTML = emblaApi
      .scrollSnapList()
      .map(() => `<button class="embla__dot ${tailwindClasses}" type="button"></button>`)
      .join('')

    const scrollTo = (index: number): void => {
      emblaApi.scrollTo(index)
    }

    dotNodes = Array.from(dotsNode.querySelectorAll('.embla__dot'))
    dotNodes.forEach((dotNode, index) => {
      dotNode.addEventListener('click', () => scrollTo(index), false)
    })
  }

  const toggleDotBtnsActive = (): void => {
    const previous = emblaApi.previousScrollSnap()
    const selected = emblaApi.selectedScrollSnap()
    dotNodes[previous].setAttribute("data-selected", "false")
    dotNodes[selected].setAttribute("data-selected", "true")
  }

  emblaApi
    .on('init', addDotBtnsWithClickHandlers)
    .on('reInit', addDotBtnsWithClickHandlers)
    .on('init', toggleDotBtnsActive)
    .on('reInit', toggleDotBtnsActive)
    .on('select', toggleDotBtnsActive)

  return (): void => {
    dotsNode.innerHTML = ''
  }
}
