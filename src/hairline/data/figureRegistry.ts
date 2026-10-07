import {
  basket, branches, cabinet, dish, drawer, elevator, exploded, keyboard, laptop,
  lockers, loupe, padlock, patch, phone, phosphor, plot, plug, query, rail,
  riffle, router, sieve, slow, terminal, terrain, turntable, vault,
  type Figure, type HairlineOptions,
} from '@lucasmarkes/hairline';

import { HairlineFigureName } from '../HairlineFigureName';

export type MountFigure = (el: HTMLElement, options?: HairlineOptions) => Figure;

export const FIGURE_REGISTRY: Record<HairlineFigureName, MountFigure> = {
  [HairlineFigureName.Basket]: basket,
  [HairlineFigureName.Branches]: branches,
  [HairlineFigureName.Cabinet]: cabinet,
  [HairlineFigureName.Dish]: dish,
  [HairlineFigureName.Drawer]: drawer,
  [HairlineFigureName.Elevator]: elevator,
  [HairlineFigureName.Exploded]: exploded,
  [HairlineFigureName.Keyboard]: keyboard,
  [HairlineFigureName.Laptop]: laptop,
  [HairlineFigureName.Lockers]: lockers,
  [HairlineFigureName.Loupe]: loupe,
  [HairlineFigureName.Padlock]: padlock,
  [HairlineFigureName.Patch]: patch,
  [HairlineFigureName.Phone]: phone,
  [HairlineFigureName.Phosphor]: phosphor,
  [HairlineFigureName.Plot]: plot,
  [HairlineFigureName.Plug]: plug,
  [HairlineFigureName.Query]: query,
  [HairlineFigureName.Rail]: rail,
  [HairlineFigureName.Riffle]: riffle,
  [HairlineFigureName.Router]: router,
  [HairlineFigureName.Sieve]: sieve,
  [HairlineFigureName.Slow]: slow,
  [HairlineFigureName.Terminal]: terminal,
  [HairlineFigureName.Terrain]: terrain,
  [HairlineFigureName.Turntable]: turntable,
  [HairlineFigureName.Vault]: vault,
};
