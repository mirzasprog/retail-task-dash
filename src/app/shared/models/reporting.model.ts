import { StoreSummary } from './store.model';

type Decimal = number;

export interface RegionSummary {
  id: string;
  name: string;
  totalSales: Decimal;
  totalTarget: Decimal;
  variance: Decimal;
}

export interface HqOverview {
  regions: RegionSummary[];
  stores: StoreSummary[];
}
