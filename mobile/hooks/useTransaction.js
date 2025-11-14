import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { API_URL } from "../constants/api.js"; // can switch between localhost / deployed URL

export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Helper to safely fetch and handle non-OK responses
  const safeFetch = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
      }

      // Try to parse JSON, handle non-JSON gracefully
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        console.error("Backend did not return JSON:", text);
        return null;
      }
    } catch (error) {
      console.error("Network / fetch error:", error);
      throw error;
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await safeFetch(`${API_URL}/transactions/${userId}`);
      if (data) setTransactions(data);
    } catch (error) {
      Alert.alert("Error fetching transactions", error.message || String(error));
    }
  }, [userId, safeFetch]);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await safeFetch(`${API_URL}/transactions/summary/${userId}`);
      if (data) setSummary(data);
    } catch (error) {
      Alert.alert("Error fetching summary", error.message || String(error));
    }
  }, [userId, safeFetch]);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      await Promise.all([fetchTransactions(), fetchSummary()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions, fetchSummary, userId]);

  const deleteTransaction = useCallback(
    async (id) => {
      try {
        await safeFetch(`${API_URL}/transactions/${id}`, { method: "DELETE" });
        Alert.alert("Success", "Transaction deleted successfully");
        loadData();
      } catch (error) {
        Alert.alert("Error deleting transaction", error.message || String(error));
      }
    },
    [loadData, safeFetch]
  );

  return { transactions, summary, isLoading, loadData, deleteTransaction };
};
