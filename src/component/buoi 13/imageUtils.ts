/**
 * Centralized image mapping utility
 * Maps database image names to actual asset paths
 */

const imageMap: { [key: string]: any } = {
  // Gundam images
  'Unicorn_gundam.jpg': require('../../assets/images/Unicorn_gundam.jpg'),
  'Unicorn_gundam_0.2.jpg': require('../../assets/images/Unicorn_gundam_0.2.jpg'),
  'Astray_gold.jpg': require('../../assets/images/astray_gold.jpg'), // File thực tế: astray_gold.jpg (lowercase)
  'astray_gold.jpg': require('../../assets/images/astray_gold.jpg'), // Support cả lowercase
  'Astray_hirm.webp': require('../../assets/images/Astray_hirm.webp'),
  'asray_noname.webp': require('../../assets/images/asray_noname.webp'),
  'astray_noname.webp': require('../../assets/images/asray_noname.webp'), // Support cả tên không có typo

  // Legacy/default images
  'hinh1.jpg': require('../../assets/images/asray_noname.webp'),
  'hinh2.jpg': require('../../assets/images/astray_gold.jpg'),
  'hinh3.jpg': require('../../assets/images/Astray_hirm.webp'),
  'gigachad.jpg': require('../../assets/images/Unicorn_gundam.jpg'),
  'hii.jpg': require('../../assets/images/Unicorn_gundam_0.2.jpg'),

  // Banner images
  'banner_Home.webp': require('../../assets/images/banner_Home.webp'),
  'banner_2.jpg': require('../../assets/images/banner_2.jpg'),
  'banner_4.jpg': require('../../assets/images/banner_4.jpg'),
  'banner_5.jpg': require('../../assets/images/banner_5.jpg'),
};
/**
 * Get image source from database image name
 * @param img - Image name from database or file:// URI
 * @returns React Native image source object
 */
export const getImageSource = (img: string) => {
  // Handle file:// URIs (from device storage)
  if (img && img.startsWith('file://')) {
    return { uri: img };
  }

  // Handle mapped images
  if (img && imageMap[img]) {
    return imageMap[img];
  }

  // Default fallback
  console.warn(`⚠️ Image not found in map: ${img}, using default`);
  return require('../../assets/images/banner_Home.webp');
};

/**
 * List all available images in the map
 */
export const getAvailableImages = () => Object.keys(imageMap);
