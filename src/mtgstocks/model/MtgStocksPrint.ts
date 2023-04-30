import { MtgStockLatestPrice } from './MtgStockLatestPrice';
import { MtgStocksAllTime } from './MtgStocksAllTime';
import { MtgStocksCard } from './MtgStocksCard';
import { MtgStocksSet } from './MtgStocksSet';

export interface MtgStocksPrint {
  id: number;
  name: string;
  card: MtgStocksCard;
  all_time_low: MtgStocksAllTime;
  all_time_high: MtgStocksAllTime;
  latest_price: MtgStockLatestPrice;
  multiverse_id: number;
  sets: MtgStocksSet[];
}
