const PRODUCT_VARIANTS = {
  "WEATHER GUARD CLASSIC SEMI GLOSS": { units: ["1L", "4L", "20L"], amountLabel: "Quantity" },
  "MIXED WEATHER GUARD": { units: ["1L", "4L", "20L"], amountLabel: "Quantity" },
  "SILK CLASSIC SEMI GLOSS": { units: ["1L", "4L", "20L"], amountLabel: "Quantity" },
  "MIXED SILK": { units: ["1L", "4L", "20L"], amountLabel: "Quantity" },
  "IPOLY EMULSION ECONOMIC GRADE": { units: ["1L", "4L", "20L"], amountLabel: "Quantity" },
  "PREMIUM EMULSION MATT CLASSIC": { units: ["1L", "4L", "20L"], amountLabel: "Quantity" },
  // KIPAU DESIGN: type + weight
  "KIPAU DESIGN": {
    type: ["3mm", "2.5mm", "0mm", "0.8mm", "1.5mm", "sample"],
    weight: ["5kg", "30kg"],
    amountLabel: "Quantity"
  },
  // KIPAU PLASTER 25kg
  "KIPAU PLASTER 25kg": { units: ["25kg"], amountLabel: "Quantity" },
  // KIPAU PLASTER 20kg
  "KIPAU PLASTER 20kg": { units: ["20kg"], amountLabel: "Quantity" },
  // KIPAU 2 IN 1: only weight
  "KIPAU 2 IN 1": {
    weight: ["20kg", "25kg"],
    amountLabel: "Quantity"
  },
  // KIPAU T3: type + weight
  "KIPAU T3": {
    type: ["3mm", "2.5mm", "0mm", "0.8mm", "1.5mm", "sample"],
    weight: ["20kg", "25kg"],
    amountLabel: "Quantity"
  },
  "FAST DRY": { units: ["1L", "4L", "20L"], amountLabel: "Quantity" },
  "GLOSS ENAMEL": { units: ["1L", "4L", "20L"], amountLabel: "Quantity" },
  "NITRO CELLALOSE": { units: ["1L", "4L", "20L"], amountLabel: "Quantity" },
  // THINNER: type + unit
  "THINNER": {
    type: ["High Gloss", "Standard", "Normal"],
    unit: ["1L", "5L"],
    amountLabel: "Quantity"
  },
  "2K CRYL": { units: ["1L", "4L", "20L"], amountLabel: "Quantity" },
  "WOOD GLUE": { units: ["1L", "4L", "20L"], amountLabel: "Quantity" },
};

// For use in Node.js environments (like a future server-side script)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = PRODUCT_VARIANTS;
}