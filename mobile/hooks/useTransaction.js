// react custom hook file

import { useCallback, useState } from "react";
import { Alert } from "react-native";
// import { API_URL } from "../constants/api";

const API_URL = "https://wallet-api-cxqp.onrender.com/api";
// const API_URL = "http://localhost:5001/api";

export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // useCallback is used for performance reasons, it will memoize the function
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/${userId}`);
      if (!response.ok) {
        // Try to get text body for better error message (sometimes HTML or plain text)
        const text = await response.text();
        throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
      }
      // Parse JSON safely
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      // JSON parse errors often mean the server returned non-JSON (HTML / plain text)
      console.error("Error fetching transactions:", error);
      Alert.alert("Error fetching transactions", error.message || String(error));
    }
  }, [userId]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/summary/${userId}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
      }
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      Alert.alert("Error fetching summary", error.message || String(error));
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // can be run in parallel
      await Promise.all([fetchTransactions(), fetchSummary()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions, fetchSummary, userId]);

  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to delete transaction: ${response.status} ${response.statusText} - ${text}`);
      }

      // Refresh data after deletion
      loadData();
      Alert.alert("Success", "Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      Alert.alert("Error", error.message);
    }
  };

  return { transactions, summary, isLoading, loadData, deleteTransaction };
};