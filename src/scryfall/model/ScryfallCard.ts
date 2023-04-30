import { ScryfallCardPrices } from './ScryfallCardPrices';

export interface ScryfallCard {
  id: string;
  name: string;
  multiverse_ids: number[];
  reserved: boolean;
  prices: ScryfallCardPrices;
  released_at: string;
}
