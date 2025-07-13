import React, { useEffect, useState } from "react";
import "./IngredientList.css";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'; // Correct import

const mockPrices = {
  tomato: 40,
  onion: 30,
  rice: 60,
  chicken: 200,
  garlic: 150,
  ginger: 100,
};

const quantityOptions = ["100 g", "200 g", "500 g", "750 g", "1 kg", "Skip"];

const IngredientList = ({ ingredients, onClose }) => {
  const [priceMap, setPriceMap] = useState({});
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [customQuantities, setCustomQuantities] = useState({});

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      const newPrices = {};
      ingredients.forEach((ing) => {
        const key = ing.name.toLowerCase();
        newPrices[key] = mockPrices[key] || 50;
      });
      setPriceMap(newPrices);
    };
    fetchPrices();
  }, [ingredients]);

  const handleQuantityChange = (name, value) => {
    setSelectedQuantities((prev) => ({ ...prev, [name]: value }));
    setCustomQuantities((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCustomInputChange = (name, value) => {
    setCustomQuantities((prev) => ({ ...prev, [name]: value }));
    setSelectedQuantities((prev) => ({ ...prev, [name]: "custom" }));
  };

  const getPrice = (name) => {
    const quantity = selectedQuantities[name];
    const custom = customQuantities[name];
    const pricePerKg = priceMap[name.toLowerCase()];
    if (!quantity || quantity === "Skip" || !pricePerKg) return "-";

    let grams;
    if (quantity === "custom" && custom) {
      grams = parseInt(custom);
    } else if (quantity.includes("kg")) {
      grams = parseInt(quantity) * 1000;
    } else {
      grams = parseInt(quantity);
    }

    if (!grams || isNaN(grams)) return "-";
    return ((grams / 1000) * pricePerKg).toFixed(2);
  };

const generatePDF = () => {
  const doc = new jsPDF();
  doc.text("Dishy - Grocery Ingredient List", 14, 20);

  const rows = ingredients
    .filter((ing) => {
      const q = selectedQuantities[ing.name];
      const custom = customQuantities[ing.name];
      if (!q || (q === "custom" && (!custom || isNaN(custom)))) return false;
      return q !== "Skip";
    })
    .map((ing) => {
      const name = ing.name;
      const price = priceMap[name.toLowerCase()] || 50;
      const dropdown = selectedQuantities[name];
      const quantity =
        dropdown === "custom" ? `${customQuantities[name]} g` : dropdown;
      const total = getPrice(name);
      return [
        name,
        `₹${price}/kg`,
        quantity,
        total === "-" ? "-" : `₹${total}`,
      ];
    });

  if (rows.length === 0) {
    alert("No valid ingredients selected to generate PDF.");
    return;
  }

  autoTable(doc, {
    startY: 30,
    head: [["Ingredient", "Price/kg", "Quantity", "Price"]],
    body: rows,
  });

  const finalY = doc.lastAutoTable?.finalY || 40;

  const total = rows.reduce((sum, row) => {
    const price = parseFloat(row[3]?.substring(1));
    return !isNaN(price) ? sum + price : sum;
  }, 0);

  doc.text(`Total Price: ₹${total.toFixed(2)}`, 14, finalY + 10);
  doc.save("Grocery_List_Dishy.pdf");
};



  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
        <h2>Ingredient Price List</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Price (₹/kg)</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing, index) => (
                <tr key={`${ing.name}-${index}`}>
                  <td>{ing.name}</td>
                  <td>₹{priceMap[ing.name.toLowerCase()] || 50}</td>
                  <td>
                    <select
                      onChange={(e) =>
                        handleQuantityChange(ing.name, e.target.value)
                      }
                      value={selectedQuantities[ing.name] || ""}
                    >
                      <option value="">Select</option>
                      {quantityOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                      <option value="custom">Manual</option>
                    </select>
                    {selectedQuantities[ing.name] === "custom" && (
                      <input
                        type="number"
                        placeholder="grams"
                        className="custom-input"
                        value={customQuantities[ing.name] || ""}
                        onChange={(e) =>
                          handleCustomInputChange(ing.name, e.target.value)
                        }
                      />
                    )}
                  </td>
                  <td>₹{getPrice(ing.name)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="generate-btn" onClick={generatePDF}>
          Generate as PDF
        </button>
      </div>
    </div>
  );
};

export default IngredientList;
