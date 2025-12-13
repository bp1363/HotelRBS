/**
 * API Translation Service
 * Translates API responses (hotel names, descriptions, amenities, etc.) to selected language
 */

import { translateText, translateBatch } from "./translationService";

/**
 * Get current language from localStorage (set by TranslationContext)
 */
export const getCurrentLanguage = (): string => {
  return localStorage.getItem("language") || "en";
};

/**
 * Translate hotel data from API response
 */
export const translateHotelData = async (hotel: any, targetLang?: string): Promise<any> => {
  const language = targetLang || getCurrentLanguage();
  
  // If language is English, return as-is
  if (language === "en") {
    return hotel;
  }

  try {
    // Collect all unique texts to translate in one batch
    const textsToTranslate: string[] = [];
    const textMap: { [key: string]: string } = {}; // Maps field path to text

    // Collect all translatable fields
    if (hotel.HotelName) {
      const key = "HotelName";
      if (!textsToTranslate.includes(hotel.HotelName)) {
        textsToTranslate.push(hotel.HotelName);
      }
      textMap[key] = hotel.HotelName;
    }

    if (hotel.Description) {
      const plainText = hotel.Description.replace(/<[^>]*>/g, " ").trim();
      if (plainText) {
        const key = "Description";
        if (!textsToTranslate.includes(plainText)) {
          textsToTranslate.push(plainText);
        }
        textMap[key] = plainText;
      }
    }

    if (hotel.Address) {
      const key = "Address";
      if (!textsToTranslate.includes(hotel.Address)) {
        textsToTranslate.push(hotel.Address);
      }
      textMap[key] = hotel.Address;
    }

    if (hotel.CityName) {
      const key = "CityName";
      if (!textsToTranslate.includes(hotel.CityName)) {
        textsToTranslate.push(hotel.CityName);
      }
      textMap[key] = hotel.CityName;
    }

    if (hotel.CountryName) {
      const key = "CountryName";
      if (!textsToTranslate.includes(hotel.CountryName)) {
        textsToTranslate.push(hotel.CountryName);
      }
      textMap[key] = hotel.CountryName;
    }

    // Collect amenities
    const amenityMap: { [index: number]: string } = {};
    if (hotel.Amenities && Array.isArray(hotel.Amenities)) {
      hotel.Amenities.forEach((amenity: string, idx: number) => {
        if (amenity && typeof amenity === "string") {
          if (!textsToTranslate.includes(amenity)) {
            textsToTranslate.push(amenity);
          }
          amenityMap[idx] = amenity;
        }
      });
    }

    const facilityMap: { [index: number]: string } = {};
    if (hotel.HotelFacilities && Array.isArray(hotel.HotelFacilities)) {
      hotel.HotelFacilities.forEach((facility: string, idx: number) => {
        if (facility && typeof facility === "string") {
          if (!textsToTranslate.includes(facility)) {
            textsToTranslate.push(facility);
          }
          facilityMap[idx] = facility;
        }
      });
    }

    if (hotel.CancellationPolicy) {
      const key = "CancellationPolicy";
      if (!textsToTranslate.includes(hotel.CancellationPolicy)) {
        textsToTranslate.push(hotel.CancellationPolicy);
      }
      textMap[key] = hotel.CancellationPolicy;
    }

    // Collect room texts
    const roomTexts: { [roomIdx: number]: { [field: string]: string } } = {};
    if (hotel.Rooms) {
      const roomsArray = Array.isArray(hotel.Rooms) ? hotel.Rooms : [hotel.Rooms];
      roomsArray.forEach((room: any, roomIdx: number) => {
        roomTexts[roomIdx] = {};
        if (room.RoomType) {
          if (!textsToTranslate.includes(room.RoomType)) {
            textsToTranslate.push(room.RoomType);
          }
          roomTexts[roomIdx]["RoomType"] = room.RoomType;
        }
        if (room.Name) {
          if (!textsToTranslate.includes(room.Name)) {
            textsToTranslate.push(room.Name);
          }
          roomTexts[roomIdx]["Name"] = room.Name;
        }
        if (room.MealType) {
          if (!textsToTranslate.includes(room.MealType)) {
            textsToTranslate.push(room.MealType);
          }
          roomTexts[roomIdx]["MealType"] = room.MealType;
        }
      });
    }

    // Translate all texts in one batch
    if (textsToTranslate.length > 0) {
      const translatedTexts = await translateBatch(textsToTranslate, language, "en");
      const translationMap: { [key: string]: string } = {};
      textsToTranslate.forEach((text, idx) => {
        translationMap[text] = translatedTexts[idx];
      });

      // Build translated hotel object
      const translatedHotel = { ...hotel };

      // Apply translations
      if (hotel.HotelName && textMap["HotelName"]) {
        translatedHotel.HotelName = translationMap[textMap["HotelName"]] || hotel.HotelName;
      }

      if (hotel.Description && textMap["Description"]) {
        const translatedDesc = translationMap[textMap["Description"]] || textMap["Description"];
        translatedHotel.Description = hotel.Description.replace(textMap["Description"], translatedDesc);
      }

      if (hotel.Address && textMap["Address"]) {
        translatedHotel.Address = translationMap[textMap["Address"]] || hotel.Address;
      }

      if (hotel.CityName && textMap["CityName"]) {
        translatedHotel.CityName = translationMap[textMap["CityName"]] || hotel.CityName;
      }

      if (hotel.CountryName && textMap["CountryName"]) {
        translatedHotel.CountryName = translationMap[textMap["CountryName"]] || hotel.CountryName;
      }

      if (hotel.Amenities && Array.isArray(hotel.Amenities)) {
        translatedHotel.Amenities = hotel.Amenities.map((amenity: string, idx: number) => {
          return amenityMap[idx] ? (translationMap[amenityMap[idx]] || amenity) : amenity;
        });
      }

      if (hotel.HotelFacilities && Array.isArray(hotel.HotelFacilities)) {
        translatedHotel.HotelFacilities = hotel.HotelFacilities.map((facility: string, idx: number) => {
          return facilityMap[idx] ? (translationMap[facilityMap[idx]] || facility) : facility;
        });
      }

      if (hotel.CancellationPolicy && textMap["CancellationPolicy"]) {
        translatedHotel.CancellationPolicy = translationMap[textMap["CancellationPolicy"]] || hotel.CancellationPolicy;
      }

      if (hotel.Rooms) {
        const roomsArray = Array.isArray(hotel.Rooms) ? hotel.Rooms : [hotel.Rooms];
        translatedHotel.Rooms = roomsArray.map((room: any, roomIdx: number) => {
          const translatedRoom = { ...room };
          if (roomTexts[roomIdx]) {
            if (roomTexts[roomIdx]["RoomType"]) {
              translatedRoom.RoomType = translationMap[roomTexts[roomIdx]["RoomType"]] || room.RoomType;
            }
            if (roomTexts[roomIdx]["Name"]) {
              translatedRoom.Name = translationMap[roomTexts[roomIdx]["Name"]] || room.Name;
            }
            if (roomTexts[roomIdx]["MealType"]) {
              translatedRoom.MealType = translationMap[roomTexts[roomIdx]["MealType"]] || room.MealType;
            }
          }
          return translatedRoom;
        });
      }

      return translatedHotel;
    }

    // If no texts to translate, return original
    return hotel;
  } catch (error) {
    console.error("Error translating hotel data:", error);
    return hotel; // Return original on error
  }
};

/**
 * Translate array of hotels
 */
export const translateHotelArray = async (
  hotels: any[],
  targetLang?: string
): Promise<any[]> => {
  const language = targetLang || getCurrentLanguage();
  
  if (language === "en" || !hotels || hotels.length === 0) {
    return hotels;
  }

  try {
    // Translate hotels in parallel (but limit concurrency to avoid API rate limits)
    const BATCH_SIZE = 5;
    const translatedHotels: any[] = [];

    for (let i = 0; i < hotels.length; i += BATCH_SIZE) {
      const batch = hotels.slice(i, i + BATCH_SIZE);
      const translatedBatch = await Promise.all(
        batch.map((hotel) => translateHotelData(hotel, language))
      );
      translatedHotels.push(...translatedBatch);
      
      // Small delay to avoid overwhelming translation API
      if (i + BATCH_SIZE < hotels.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return translatedHotels;
  } catch (error) {
    console.error("Error translating hotel array:", error);
    return hotels;
  }
};

/**
 * Map language code for API (e.g., 'ar' -> 'ar', 'en' -> 'en')
 */
export const getApiLanguageCode = (lang?: string): string => {
  const language = lang || getCurrentLanguage();
  // Map language codes - adjust based on API requirements
  const languageMap: { [key: string]: string } = {
    en: "en",
    ar: "ar",
    fr: "fr",
  };
  return languageMap[language] || "en";
};

