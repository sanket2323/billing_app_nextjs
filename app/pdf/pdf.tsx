import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

// Define styles for the invoice
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    backgroundColor: "#f0f0f0",
    padding: 5,
    textAlign: "center",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
    textAlign: "center",
  },
  footer: {
    marginTop: 20,
    textAlign: "right",
  },
});

// Invoice Document Component
interface InvoiceDocumentProps {
  farmerName: string;
  phoneNumber: string;
  city: string;
  billNumber: string;
  billDate: Date;
  products: { productType: string; quantity: number; rate: number }[];
  totalValue: number;
  expenses: Record<string, number>;
  totalExpense: number;
  totalPayableAmount: number;
}

export const InvoiceDocument = ({
  farmerName,
  phoneNumber,
  city,
  billNumber,
  billDate,
  products,
  totalValue,
  expenses,
  totalExpense,
  totalPayableAmount,
}: InvoiceDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.header}>Farmer Invoice</Text>

      {/* Farmer Details */}
      <View style={styles.section}>
        <Text>Bill Number: {billNumber}</Text>
        <Text>Date: {billDate.toLocaleDateString()}</Text>
        <Text>Farmer Name: {farmerName}</Text>
        <Text>Phone Number: {phoneNumber}</Text>
        <Text>City: {city}</Text>
      </View>

      {/* Products Table */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Product Type</Text>
          <Text style={styles.tableColHeader}>Quantity</Text>
          <Text style={styles.tableColHeader}>Rate</Text>
          <Text style={styles.tableColHeader}>Amount</Text>
        </View>
        {products.map((product, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCol}>{product.productType}</Text>
            <Text style={styles.tableCol}>{product.quantity}</Text>
            <Text style={styles.tableCol}>{product.rate}</Text>
            <Text style={styles.tableCol}>{product.quantity * product.rate}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.footer}>Total Value: {totalValue}</Text>

      {/* Expenses */}
      <View style={styles.section}>
        <Text>Expenses:</Text>
        {Object.entries(expenses).map(([key, value]) => (
          <Text key={key}>
            {key.charAt(0).toUpperCase() + key.slice(1)}: {String(value)}
          </Text>
        ))}
        <Text style={{ marginTop: 5 }}>Total Expense: {totalExpense}</Text>
      </View>

      {/* Total Payable */}
      <Text style={styles.footer}>Total Payable Amount: {totalPayableAmount}</Text>
    </Page>
  </Document>
);