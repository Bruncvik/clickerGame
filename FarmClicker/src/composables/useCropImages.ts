import PotatoCrop1 from '../assets/PotatoCrop1.webp';
import PotatoCrop2 from '../assets/PotatoCrop2.webp';
import PotatoCrop3 from '../assets/PotatoCrop3.webp';
import WheatCrop1 from '../assets/WheatCrop1.webp';
import WheatCrop2 from '../assets/WheatCrop2.webp';
import WheatCrop3 from '../assets/WheatCrop3.webp';
import CornCrop1 from '../assets/CornCrop1.webp';
import CornCrop2 from '../assets/CornCrop2.webp';
import CornCrop3 from '../assets/CornCrop3.webp';
import TulipCrop1 from '../assets/TulipCrop1.webp';
import TulipCrop2 from '../assets/TulipCrop2.webp';
import TulipCrop3 from '../assets/TulipCrop3.webp';
import PumpkinCrop1 from '../assets/PumpkinCrop1.webp';
import PumpkinCrop2 from '../assets/PumpkinCrop2.webp';
import PumpkinCrop3 from '../assets/PumpkinCrop3.webp';
import AppleCrop1 from '../assets/AppleCrop1.webp';
import AppleCrop2 from '../assets/AppleCrop2.webp';
import AppleCrop3 from '../assets/AppleCrop3.webp';
import Farmer_icon from '../assets/Farmer_icon.webp';
import Tractor_icon from '../assets/Tractor_icon.webp';
import AutoHarvester_icon from '../assets/AutoHarvester_icon.webp';

export const cropImageById: Record<string, string[]> = {
  potato_seed:  [PotatoCrop1,  PotatoCrop2,  PotatoCrop3],
  wheat_seed:   [WheatCrop1,   WheatCrop2,   WheatCrop3],
  corn_seed:    [CornCrop1,    CornCrop2,    CornCrop3],
  tulip_seed:   [TulipCrop1,   TulipCrop2,   TulipCrop3],
  pumpkin_seed: [PumpkinCrop1, PumpkinCrop2, PumpkinCrop3],
  apple_seed:   [AppleCrop1,   AppleCrop2,   AppleCrop3],
};

export const autoIconById: Record<string, string> = {
  auto_person:     Farmer_icon,
  auto_tractor:    Tractor_icon,
  auto_harvester:  AutoHarvester_icon,
};

export function getFieldCropImage(cropId: string | null, progress: number): string | null {
  if (!cropId) return null;
  const stages = cropImageById[cropId];
  if (!stages) return null;
  if (progress >= 0.66) return stages[2] ?? stages[0] ?? null;
  if (progress >= 0.33) return stages[1] ?? stages[0] ?? null;
  return stages[0] ?? null;
}
