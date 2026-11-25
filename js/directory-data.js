// ==========================================================================
// Red Hope Blood Donation Website - Directory Data
// Contains data for Donors, Blood Banks, and Hospitals
// ==========================================================================

// --------------------------------------------------------------------------
// 1. DONORS LIST
// Directory of voluntary blood donors in Islamabad and Rawalpindi
// --------------------------------------------------------------------------
const donors = [
  {
    id: 1,
    name: "Ali Raza",
    bloodGroup: "O-",
    city: "Islamabad",
    phone: "0300-5123456",
    lastDonation: "2026-08-15",
    available: true
  },
  {
    id: 2,
    name: "Bilal Ahmed",
    bloodGroup: "O-",
    city: "Islamabad",
    phone: "0321-5544332",
    lastDonation: "2026-04-10",
    available: true
  },
  {
    id: 3,
    name: "Sana Khan",
    bloodGroup: "A+",
    city: "Rawalpindi",
    phone: "0333-5188721",
    lastDonation: "2026-06-20",
    available: true
  },
  {
    id: 4,
    name: "Usman Tariq",
    bloodGroup: "B+",
    city: "Islamabad",
    phone: "0345-5987123",
    lastDonation: "2026-09-12",
    available: false
  },
  {
    id: 5,
    name: "Abdul Hanan",
    bloodGroup: "AB+",
    city: "Islamabad",
    phone: "0312-5874125",
    lastDonation: "2026-05-18",
    available: true
  },
  {
    id: 6,
    name: "Sultan Khan",
    bloodGroup: "O+",
    city: "Rawalpindi",
    phone: "0301-5236987",
    lastDonation: "2026-03-25",
    available: true
  },
  {
    id: 7,
    name: "Fatima Zahra",
    bloodGroup: "A-",
    city: "Islamabad",
    phone: "0332-5147896",
    lastDonation: "2026-07-08",
    available: true
  },
  {
    id: 8,
    name: "Hamza Malik",
    bloodGroup: "B-",
    city: "Rawalpindi",
    phone: "0343-5632145",
    lastDonation: "2026-02-14",
    available: true
  },
  {
    id: 9,
    name: "Zainab Bibi",
    bloodGroup: "AB-",
    city: "Rawalpindi",
    phone: "0305-5984123",
    lastDonation: "2026-07-30",
    available: true
  },
  {
    id: 10,
    name: "Ayesha Noor",
    bloodGroup: "O+",
    city: "Islamabad",
    phone: "0315-5412369",
    lastDonation: "2026-10-02",
    available: false
  },
  {
    id: 11,
    name: "Tariq Mehmood",
    bloodGroup: "A+",
    city: "Islamabad",
    phone: "0306-5321478",
    lastDonation: "2026-01-19",
    available: true
  },
  {
    id: 12,
    name: "Zeeshan Ali",
    bloodGroup: "B+",
    city: "Rawalpindi",
    phone: "0334-5896321",
    lastDonation: "2026-06-05",
    available: true
  }
];

// --------------------------------------------------------------------------
// 2. BLOOD BANKS LIST
// Directory of blood banks with operating hours and stock availability.
// Operating hours use 24-hour "HH:mm" format (e.g., "09:00", "21:00")
// for simple "Open now" time comparison without extra libraries.
// --------------------------------------------------------------------------
const bloodBanks = [
  {
    id: 1,
    name: "PIMS Blood Bank",
    area: "G-8",
    city: "Islamabad",
    phone: "051-9261170",
    openTime: "09:00", // 9:00 AM
    closeTime: "21:00", // 9:00 PM
    stock: {
      "A+": "ok",
      "A-": "ok",
      "B+": "high",
      "B-": "ok",
      "AB+": "ok",
      "AB-": "low",
      "O+": "high",
      "O-": "low"
    }
  },
  {
    id: 2,
    name: "Holy Family Blood Bank",
    area: "Satellite Town",
    city: "Rawalpindi",
    phone: "051-9290321",
    openTime: "08:00", // 8:00 AM
    closeTime: "16:00", // 4:00 PM
    stock: {
      "A+": "high",
      "A-": "ok",
      "B+": "ok",
      "B-": "low",
      "AB+": "ok",
      "AB-": "low",
      "O+": "ok",
      "O-": "ok"
    }
  },
  {
    id: 3,
    name: "Red Crescent Blood Transfusion Centre",
    area: "H-8",
    city: "Islamabad",
    phone: "051-9250404",
    openTime: "08:00", // 8:00 AM
    closeTime: "20:00", // 8:00 PM
    stock: {
      "A+": "ok",
      "A-": "low",
      "B+": "high",
      "B-": "ok",
      "AB+": "high",
      "AB-": "low",
      "O+": "high",
      "O-": "ok"
    }
  },
  {
    id: 4,
    name: "Rawalpindi Blood Transfusion Center",
    area: "Asghar Mall",
    city: "Rawalpindi",
    phone: "051-4852200",
    openTime: "09:00", // 9:00 AM
    closeTime: "17:00", // 5:00 PM
    stock: {
      "A+": "high",
      "A-": "low",
      "B+": "ok",
      "B-": "low",
      "AB+": "ok",
      "AB-": "low",
      "O+": "high",
      "O-": "low"
    }
  },
  {
    id: 5,
    name: "Federal Government Polyclinic Blood Bank",
    area: "G-6/2",
    city: "Islamabad",
    phone: "051-9218300",
    openTime: "08:00", // 8:00 AM
    closeTime: "20:00", // 8:00 PM
    stock: {
      "A+": "high",
      "A-": "ok",
      "B+": "high",
      "B-": "low",
      "AB+": "ok",
      "AB-": "ok",
      "O+": "high",
      "O-": "ok"
    }
  },
  {
    id: 6,
    name: "Armed Forces Institute of Transfusion (AFIT)",
    area: "Abid Majeed Road",
    city: "Rawalpindi",
    phone: "051-9271002",
    openTime: "08:00", // 8:00 AM
    closeTime: "18:00", // 6:00 PM
    stock: {
      "A+": "high",
      "A-": "high",
      "B+": "high",
      "B-": "ok",
      "AB+": "high",
      "AB-": "ok",
      "O+": "high",
      "O-": "ok"
    }
  },
  {
    id: 7,
    name: "CDA Hospital Blood Bank",
    area: "G-6/2",
    city: "Islamabad",
    phone: "051-9221334",
    openTime: "08:00", // 8:00 AM
    closeTime: "14:00", // 2:00 PM
    stock: {
      "A+": "ok",
      "A-": "low",
      "B+": "ok",
      "B-": "low",
      "AB+": "low",
      "AB-": "low",
      "O+": "ok",
      "O-": "low"
    }
  },
  {
    id: 8,
    name: "District Headquarter (DHQ) Blood Bank",
    area: "Raja Bazar",
    city: "Rawalpindi",
    phone: "051-5556311",
    openTime: "08:00", // 8:00 AM
    closeTime: "16:00", // 4:00 PM
    stock: {
      "A+": "high",
      "A-": "ok",
      "B+": "high",
      "B-": "ok",
      "AB+": "ok",
      "AB-": "low",
      "O+": "high",
      "O-": "ok"
    }
  }
];

// --------------------------------------------------------------------------
// 3. HOSPITALS LIST
// Directory of partner hospitals and emergency availability
// --------------------------------------------------------------------------
const hospitals = [
  {
    id: 1,
    name: "Shifa International Hospital",
    area: "H-8/4",
    city: "Islamabad",
    phone: "051-8463000",
    emergency24x7: true
  },
  {
    id: 2,
    name: "Benazir Bhutto Hospital",
    area: "Murree Road",
    city: "Rawalpindi",
    phone: "051-9290301",
    emergency24x7: true
  },
  {
    id: 3,
    name: "Maroof International",
    area: "F-10",
    city: "Islamabad",
    phone: "051-2222920",
    emergency24x7: false
  },
  {
    id: 4,
    name: "Pakistan Institute of Medical Sciences (PIMS)",
    area: "G-8/3",
    city: "Islamabad",
    phone: "051-9261170",
    emergency24x7: true
  },
  {
    id: 5,
    name: "Holy Family Hospital",
    area: "Satellite Town",
    city: "Rawalpindi",
    phone: "051-9290321",
    emergency24x7: true
  },
  {
    id: 6,
    name: "Quaid-e-Azam International Hospital",
    area: "Golra Road, H-13",
    city: "Islamabad",
    phone: "051-8449100",
    emergency24x7: true
  },
  {
    id: 7,
    name: "District Headquarter Hospital (DHQ)",
    area: "Kashmir Road",
    city: "Rawalpindi",
    phone: "051-5556311",
    emergency24x7: true
  },
  {
    id: 8,
    name: "Kulsum International Hospital",
    area: "Blue Area",
    city: "Islamabad",
    phone: "051-8446666",
    emergency24x7: true
  }
];

// Export for Node.js environments (if used in tests or build tools)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { donors, bloodBanks, hospitals };
}
