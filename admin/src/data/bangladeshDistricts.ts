export interface District {
  id: string;
  nameEn: string;
  nameBn: string;
  isDhakaCity: boolean;
}

export interface Division {
  id: string;
  nameEn: string;
  nameBn: string;
  districts: District[];
}

export const BANGLADESH_DIVISIONS: Division[] = [
  {
    id: 'dhaka',
    nameEn: 'Dhaka',
    nameBn: 'ঢাকা',
    districts: [
      { id: 'dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা (মেট্রোপলিটন ও জেলা)', isDhakaCity: true },
      { id: 'gazipur', nameEn: 'Gazipur', nameBn: 'গাজীপুর', isDhakaCity: false },
      { id: 'narayanganj', nameEn: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', isDhakaCity: false },
      { id: 'tangail', nameEn: 'Tangail', nameBn: 'টাঙ্গাইল', isDhakaCity: false },
      { id: 'faridpur', nameEn: 'Faridpur', nameBn: 'ফরিদপুর', isDhakaCity: false },
      { id: 'manikganj', nameEn: 'Manikganj', nameBn: 'মানিকগঞ্জ', isDhakaCity: false },
      { id: 'munshiganj', nameEn: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', isDhakaCity: false },
      { id: 'narsingdi', nameEn: 'Narsingdi', nameBn: 'নরসিংদী', isDhakaCity: false },
      { id: 'gopalganj', nameEn: 'Gopalganj', nameBn: 'গোপালগঞ্জ', isDhakaCity: false },
      { id: 'kishoreganj', nameEn: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', isDhakaCity: false },
      { id: 'madaripur', nameEn: 'Madaripur', nameBn: 'মাদারীপুর', isDhakaCity: false },
      { id: 'rajbari', nameEn: 'Rajbari', nameBn: 'রাজবাড়ী', isDhakaCity: false },
      { id: 'shariatpur', nameEn: 'Shariatpur', nameBn: 'শরীয়তপুর', isDhakaCity: false }
    ]
  },
  {
    id: 'chattogram',
    nameEn: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    districts: [
      { id: 'chattogram', nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম', isDhakaCity: false },
      { id: 'coxsbazar', nameEn: "Cox's Bazar", nameBn: 'কক্সবাজার', isDhakaCity: false },
      { id: 'cumilla', nameEn: 'Cumilla', nameBn: 'কুমিল্লা', isDhakaCity: false },
      { id: 'feni', nameEn: 'Feni', nameBn: 'ফেনী', isDhakaCity: false },
      { id: 'brahmanbaria', nameEn: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', isDhakaCity: false },
      { id: 'chandpur', nameEn: 'Chandpur', nameBn: 'চাঁদপুর', isDhakaCity: false },
      { id: 'noakhali', nameEn: 'Noakhali', nameBn: 'নোয়াখালী', isDhakaCity: false },
      { id: 'lakshmipur', nameEn: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', isDhakaCity: false },
      { id: 'khagrachhari', nameEn: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', isDhakaCity: false },
      { id: 'rangamati', nameEn: 'Rangamati', nameBn: 'রাঙ্গামাটি', isDhakaCity: false },
      { id: 'bandarban', nameEn: 'Bandarban', nameBn: 'বান্দরবান', isDhakaCity: false }
    ]
  },
  {
    id: 'rajshahi',
    nameEn: 'Rajshahi',
    nameBn: 'রাজশাহী',
    districts: [
      { id: 'rajshahi', nameEn: 'Rajshahi', nameBn: 'রাজশাহী', isDhakaCity: false },
      { id: 'bogra', nameEn: 'Bogura', nameBn: 'বগুড়া', isDhakaCity: false },
      { id: 'pabna', nameEn: 'Pabna', nameBn: 'পাবনা', isDhakaCity: false },
      { id: 'sirajganj', nameEn: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', isDhakaCity: false },
      { id: 'naogaon', nameEn: 'Naogaon', nameBn: 'নওগাঁ', isDhakaCity: false },
      { id: 'natore', nameEn: 'Natore', nameBn: 'নাটোর', isDhakaCity: false },
      { id: 'chapainawabganj', nameEn: 'Chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', isDhakaCity: false },
      { id: 'joypurhat', nameEn: 'Joypurhat', nameBn: 'জয়পুরহাট', isDhakaCity: false }
    ]
  },
  {
    id: 'khulna',
    nameEn: 'Khulna',
    nameBn: 'খুলনা',
    districts: [
      { id: 'khulna', nameEn: 'Khulna', nameBn: 'খুলনা', isDhakaCity: false },
      { id: 'jashore', nameEn: 'Jashore', nameBn: 'যশোর', isDhakaCity: false },
      { id: 'satkhira', nameEn: 'Satkhira', nameBn: 'সাতক্ষীরা', isDhakaCity: false },
      { id: 'bagerhat', nameEn: 'Bagerhat', nameBn: 'বাগেরহাট', isDhakaCity: false },
      { id: 'kushtia', nameEn: 'Kushtia', nameBn: 'কুষ্টিয়া', isDhakaCity: false },
      { id: 'jhenaidah', nameEn: 'Jhenaidah', nameBn: 'ঝিনাইদহ', isDhakaCity: false },
      { id: 'chuadanga', nameEn: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', isDhakaCity: false },
      { id: 'magura', nameEn: 'Magura', nameBn: 'মাগুরা', isDhakaCity: false },
      { id: 'meherpur', nameEn: 'Meherpur', nameBn: 'মেহেরপুর', isDhakaCity: false },
      { id: 'narail', nameEn: 'Narail', nameBn: 'নড়াইল', isDhakaCity: false }
    ]
  },
  {
    id: 'barishal',
    nameEn: 'Barishal',
    nameBn: 'বরিশাল',
    districts: [
      { id: 'barishal', nameEn: 'Barishal', nameBn: 'বরিশাল', isDhakaCity: false },
      { id: 'bhola', nameEn: 'Bhola', nameBn: 'ভোলা', isDhakaCity: false },
      { id: 'patuakhali', nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী', isDhakaCity: false },
      { id: 'pirojpur', nameEn: 'Pirojpur', nameBn: 'পিরোজপুর', isDhakaCity: false },
      { id: 'barguna', nameEn: 'Barguna', nameBn: 'বরগুনা', isDhakaCity: false },
      { id: 'jhalokati', nameEn: 'Jhalokati', nameBn: 'ঝালকাঠি', isDhakaCity: false }
    ]
  },
  {
    id: 'sylhet',
    nameEn: 'Sylhet',
    nameBn: 'সিলেট',
    districts: [
      { id: 'sylhet', nameEn: 'Sylhet', nameBn: 'সিলেট', isDhakaCity: false },
      { id: 'moulvibazar', nameEn: 'Moulvibazar', nameBn: 'মৌলভীবাজার', isDhakaCity: false },
      { id: 'habiganj', nameEn: 'Habiganj', nameBn: 'হবিগঞ্জ', isDhakaCity: false },
      { id: 'sunamganj', nameEn: 'Sunamganj', nameBn: 'সুনামগঞ্জ', isDhakaCity: false }
    ]
  },
  {
    id: 'rangpur',
    nameEn: 'Rangpur',
    nameBn: 'রংপুর',
    districts: [
      { id: 'rangpur', nameEn: 'Rangpur', nameBn: 'রংপুর', isDhakaCity: false },
      { id: 'dinajpur', nameEn: 'Dinajpur', nameBn: 'দিনাজপুর', isDhakaCity: false },
      { id: 'gaibandha', nameEn: 'Gaibandha', nameBn: 'গাইবান্ধা', isDhakaCity: false },
      { id: 'kurigram', nameEn: 'Kurigram', nameBn: 'কুড়িগ্রাম', isDhakaCity: false },
      { id: 'lalmonirhat', nameEn: 'Lalmonirhat', nameBn: 'লালমনিরহাট', isDhakaCity: false },
      { id: 'nilphamari', nameEn: 'Nilphamari', nameBn: 'নীলফামারী', isDhakaCity: false },
      { id: 'panchagarh', nameEn: 'Panchagarh', nameBn: 'পঞ্চগড়', isDhakaCity: false },
      { id: 'thakurgaon', nameEn: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', isDhakaCity: false }
    ]
  },
  {
    id: 'mymensingh',
    nameEn: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    districts: [
      { id: 'mymensingh', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ', isDhakaCity: false },
      { id: 'jamalpur', nameEn: 'Jamalpur', nameBn: 'জামালপুর', isDhakaCity: false },
      { id: 'netrokona', nameEn: 'Netrokona', nameBn: 'নেত্রকোণা', isDhakaCity: false },
      { id: 'sherpur', nameEn: 'Sherpur', nameBn: 'শেরপুর', isDhakaCity: false }
    ]
  }
];

export function getShippingFeeForDistrict(districtId: string, defaultDhakaFee = 60, defaultOtherFee = 120): number {
  if (!districtId) return defaultDhakaFee;
  return districtId === 'dhaka' ? defaultDhakaFee : defaultOtherFee;
}

export function findDistrictById(districtId: string): District | undefined {
  for (const division of BANGLADESH_DIVISIONS) {
    const found = division.districts.find(d => d.id === districtId);
    if (found) return found;
  }
  return undefined;
}
