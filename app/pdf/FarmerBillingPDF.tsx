import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333333",
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerContainer: {
    marginBottom: 20,
  },
  logoContainer: {
    width: "30%",
  },
  invoiceTitle: {
    width: "70%",
    textAlign: "right",
    paddingRight: 10,
  },
  invoiceTitleText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  invoiceNumber: {
    fontSize: 12,
    marginTop: 5,
  },
  companyDetails: {
    marginBottom: 15,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
  },
  companyAddress: {
    fontSize: 9,
    color: "#555555",
  },
  companyContact: {
    fontSize: 9,
    color: "#555555",
    marginTop: 2,
  },
  billToSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  billToContent: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  billToName: {
    fontWeight: "bold",
  },
  infoTable: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 9,
    color: "#333333",
    textAlign: "right",
    fontWeight: "normal",
  },
  productsTable: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#333333",
    padding: 8,
    fontWeight: "bold",
    fontSize: 9,
    color: "white",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    padding: 8,
    fontSize: 9,
  },
  indexCell: {
    width: "5%",
  },
  productCell: {
    width: "30%",
  },
  weightCell: {
    width: "20%",
    textAlign: "center",
  },
  rateCell: {
    width: "20%",
    textAlign: "center",
  },
  amountCell: {
    width: "25%",
    textAlign: "right",
  },
  productDescription: {
    fontSize: 8,
    color: "#777777",
    marginTop: 2,
  },
  expensesTable: {
    marginTop: 15,
    marginBottom: 15,
  },
  expenseHeader: {
    flexDirection: "row",
    backgroundColor: "#333333",
    padding: 6,
    fontWeight: "bold",
    fontSize: 9,
    color: "white",
  },
  expenseCell: {
    width: "75%",
    paddingLeft: 8,
  },
  expenseValueCell: {
    width: "25%",
    textAlign: "right",
    paddingRight: 8,
  },
  subTotalSection: {
    marginTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 5,
  },
  totalLabel: {
    width: 150,
    textAlign: "right",
    fontSize: 9,
    paddingRight: 10,
  },
  totalValue: {
    width: 80,
    textAlign: "right",
    fontSize: 9,
  },
  finalTotal: {
    backgroundColor: "#F5F5F5",
    padding: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 5,
  },
  finalTotalLabel: {
    width: 150,
    textAlign: "right",
    fontWeight: "bold",
    paddingRight: 10,
  },
  finalTotalValue: {
    width: 80,
    textAlign: "right",
    fontWeight: "bold",
    color: "#000", // Make it black for better visibility
  },
  amountInWords: {
    marginTop: 15,
    fontSize: 9,
  },
  bold: {
    fontWeight: "bold",
  },
});

// Helper function to convert number to words (Indian Rupees)
const convertToWords = (amount: number) => {
  // Convert to 2 decimal places
  amount = Math.round(amount * 100) / 100;

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const numString = amount.toString();
  const decimal =
    numString.indexOf(".") !== -1
      ? numString.substring(numString.indexOf(".") + 1)
      : "00";
  let wholeNum = Math.floor(amount);

  if (wholeNum === 0) return "Zero Rupees";

  let result = "";

  // Handle Crores
  if (wholeNum >= 10000000) {
    result += convertToWords(Math.floor(wholeNum / 10000000)) + " Crore ";
    wholeNum %= 10000000;
  }

  // Handle Lakhs
  if (wholeNum >= 100000) {
    result += convertToWords(Math.floor(wholeNum / 100000)) + " Lakh ";
    wholeNum %= 100000;
  }

  // Handle Thousands
  if (wholeNum >= 1000) {
    result += convertToWords(Math.floor(wholeNum / 1000)) + " Thousand ";
    wholeNum %= 1000;
  }

  // Handle Hundreds
  if (wholeNum >= 100) {
    result += convertToWords(Math.floor(wholeNum / 100)) + " Hundred ";
    wholeNum %= 100;
  }

  // Handle Tens and Ones
  if (wholeNum > 0) {
    if (wholeNum < 20) {
      result += ones[wholeNum];
    } else {
      result += tens[Math.floor(wholeNum / 10)];
      if (wholeNum % 10 > 0) {
        result += "-" + ones[wholeNum % 10];
      }
    }
  }

  result += " Rupees";

  // Handle decimal
  if (decimal !== "00") {
    result += " and " + decimal + " Paise";
  }

  return result;
};

interface Product {
  productType: string;
  quantity: number;
  weight: number;
  rate: number;
}

interface Expenses {
  adat: number;
  hamali: number;
  tolai: number;
  varai: number;
  bharai: number;
  motorBhade: number;
  uchhal: number;
  bardana: number;
  itar: number;
}

interface BillData {
  billNumber: string;
  farmerName: string;
  phoneNumber: string;
  city: string;
  billDate: Date;
  products: Product[];
  expenses: Expenses;
  totalValue: number;
  totalExpense: number;
  totalPayableAmount: number;
}

interface CompanyDetails {
  companyName: string;
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  registrationNumber: string;
  gstNumber?: string;
}

const FarmerBillingPDF = ({
  billData,
  companyDetails,
}: {
  billData: BillData;
  companyDetails: CompanyDetails;
}) => {
  // Format the date properly
  const formattedDate = format(new Date(billData.billDate), "dd/MM/yyyy");

  // Map expense keys to proper English names
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.flexRow}>
            <View style={styles.logoContainer}>
              <Text style={styles.companyName}>
                {companyDetails.companyName}
              </Text>
            </View>
            <View style={styles.invoiceTitle}>
              <Text style={styles.invoiceTitleText}>Invoice</Text>
              <Text style={styles.invoiceNumber}>#{billData.billNumber}</Text>
            </View>
          </View>
        </View>

        {/* Company Details */}
        <View style={styles.companyDetails}>
          <Text style={styles.companyAddress}>
            {companyDetails.address}, {companyDetails.city},{" "}
            {companyDetails.state}
          </Text>
          <Text style={styles.companyContact}>
            Phone: {companyDetails.phoneNumber}
          </Text>
          <Text style={styles.companyContact}>
            Registration No: {companyDetails.registrationNumber}
          </Text>
        </View>

        {/* Bill To Section */}
        <View style={styles.billToSection}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={[styles.billToContent, styles.billToName]}>
            {billData.farmerName}
          </Text>
          <Text style={styles.billToContent}>{billData.city}</Text>
          <Text style={styles.billToContent}>
            Phone: {billData.phoneNumber}
          </Text>
        </View>

        {/* Invoice Info Table */}
        <View style={styles.infoTable}>
          <View>
            <Text style={styles.infoLabel}>Invoice Date: {formattedDate}</Text>
          </View>
        </View>

        {/* Products Table */}
        <View style={styles.productsTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.indexCell}>#</Text>
            <Text style={styles.productCell}>Item & Description</Text>
            <Text style={styles.weightCell}>Weight</Text>
            <Text style={styles.rateCell}>Rate</Text>
            <Text style={styles.amountCell}>Amount</Text>
          </View>

          {billData.products.map((product, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.indexCell}>{index + 1}</Text>
              <View style={styles.productCell}>
                <Text>{product.productType}</Text>
                <Text style={styles.productDescription}>
                  Quantity: {product.quantity}
                </Text>
              </View>
              <Text style={styles.weightCell}>{product.weight}</Text>
              <Text style={styles.rateCell}>{product.rate}</Text>
              <Text style={styles.amountCell}>
                {(product.weight * product.rate).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Sub Total Section */}
        <View style={styles.subTotalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sub Total</Text>
            <Text style={styles.totalValue}>
              {billData.totalValue.toFixed(2)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Expenses</Text>
            <Text style={styles.totalValue}>
              {billData.totalExpense.toFixed(2)}
            </Text>
          </View>

          <View style={styles.finalTotal}>
            <Text style={styles.finalTotalLabel}>Total</Text>
            <Text style={styles.finalTotalValue}>
              ₹{billData.totalPayableAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Amount In Words */}
        <View style={styles.amountInWords}>
          <Text>
            Total In Words:{" "}
            <Text style={styles.bold}>
              {convertToWords(billData.totalPayableAmount)}
            </Text>
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default FarmerBillingPDF;
