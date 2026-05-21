import chairImage from '../assets/images/modern_armchair_white_1779096296367.png';
import lampImage from '../assets/images/modern_lamps_collection_1779096310280.png';
import sofaImage from '../assets/images/luxury_living_room_sofa_1779096324917.png';
import karoasLampImage from '../assets/images/karoas_lamp.jpg';
import maliasLampImage from '../assets/images/malias_lamp.jpg';
import lunaTableImage from '../assets/images/luna_table.jpg';
import type { Product } from './types';

const images: Record<Product['imageKey'], string> = {
  chair: chairImage,
  lamp: lampImage,
  sofa: sofaImage,
};

export function productImage(product: Pick<Product, 'imageKey'> & Partial<Pick<Product, 'id' | 'imageUrl'>>) {
  if (product.imageUrl) {
    return product.imageUrl;
  }

  if (product.id === 'karoas-lamp') {
    return karoasLampImage;
  }

  if (product.id === 'malias-lamp') {
    return maliasLampImage;
  }

  if (product.id === 'luna-table') {
    return lunaTableImage;
  }

  return images[product.imageKey] || sofaImage;
}
