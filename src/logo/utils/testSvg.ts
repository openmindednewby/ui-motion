export interface FakeAnimation {
  finished: Promise<void>;
  cancel: jest.Mock;
  finish: () => void;
}

export function makeFakeAnimation(): FakeAnimation {
  let resolveFinished: () => void = () => undefined;
  let rejectFinished: (reason: Error) => void = () => undefined;
  const finished = new Promise<void>((resolve, reject) => {
    resolveFinished = resolve;
    rejectFinished = reject;
  });
  const cancel = jest.fn(() => rejectFinished(new Error('AbortError')));
  return { finished, cancel, finish: () => resolveFinished() };
}

export function makeSvg(markup: string): SVGSVGElement {
  const host = document.createElement('div');
  host.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`;
  document.body.appendChild(host);
  return host.querySelector('svg') as SVGSVGElement;
}

export function installFakeAnimate(): { animate: jest.Mock; animations: FakeAnimation[] } {
  const animations: FakeAnimation[] = [];
  const animate = jest.fn(() => {
    const animation = makeFakeAnimation();
    animations.push(animation);
    return animation;
  });
  Element.prototype.animate = animate as unknown as Element['animate'];
  return { animate, animations };
}

export function removeFakeAnimate(): void {
  delete (Element.prototype as Partial<Element>).animate;
  document.body.innerHTML = '';
}
