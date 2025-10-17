import { Pipe, PipeTransform } from '@angular/core';

import { StoreSummary } from '../models/store.model';

@Pipe({
  name: 'asyncRegion'
})
export class RegionFilterPipe implements PipeTransform {
  transform(stores: StoreSummary[] | null | undefined, regionId: string | undefined): StoreSummary[] {
    if (!stores) {
      return [];
    }

    if (!regionId) {
      return stores;
    }

    return stores.filter(store => store.regionId === regionId);
  }
}
