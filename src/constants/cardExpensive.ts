export interface CardExpense {
    id: number;
    title: string;
    amount: number;
    date: string;
    time: string;
    type: "expense" | "income";
    icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
    category: string;
    cardId: number;
  }
  
  export const cardExpenses: CardExpense[] = [
    // Cartão 1 - Business debit
    {
      id: 1,
      title: "Restaurant Business",
      amount: 89.50,
      date: "Mai 5th",
      time: "14:28:00",
      type: "expense",
      icon: "restaurant",
      category: "food",
      cardId: 1,
    },
    {
      id: 2,
      title: "Office Supplies",
      amount: 156.80,
      date: "May 3th",
      time: "10:15:00",
      type: "expense",
      icon: "document-text",
      category: "business",
      cardId: 1,
    },
    {
      id: 3,
      title: "Client Meeting",
      amount: 45.20,
      date: "May 2th",
      time: "16:30:00",
      type: "expense",
      icon: "people",
      category: "business",
      cardId: 1,
    },
  
    // Cartão 2 - Personal debit
    {
      id: 4,
      title: "Groceries",
      amount: 78.90,
      date: "Mai 5th",
      time: "09:15:00",
      type: "expense",
      icon: "cart",
      category: "food",
      cardId: 2,
    },
    {
      id: 5,
      title: "Gas Station",
      amount: 65.40,
      date: "May 3th",
      time: "18:45:00",
      type: "expense",
      icon: "car",
      category: "transport",
      cardId: 2,
    },
    {
      id: 6,
      title: "Entertainment",
      amount: 120.00,
      date: "May 1th",
      time: "20:00:00",
      type: "expense",
      icon: "tv",
      category: "entertainment",
      cardId: 2,
    },
  
    // Cartão 3 - Credit card
    {
      id: 7,
      title: "Online Shopping",
      amount: 234.50,
      date: "Mai 4th",
      time: "15:20:00",
      type: "expense",
      icon: "bag",
      category: "shopping",
      cardId: 3,
    },
    {
      id: 8,
      title: "Subscription Service",
      amount: 29.99,
      date: "May 1th",
      time: "00:00:00",
      type: "expense",
      icon: "card",
      category: "subscription",
      cardId: 3,
    },
    {
      id: 9,
      title: "Travel Booking",
      amount: 450.00,
      date: "Apr 30th",
      time: "12:30:00",
      type: "expense",
      icon: "airplane",
      category: "travel",
      cardId: 3,
    },
  ];
  
  export const getExpensesByCard = (cardId: number) => {
    return cardExpenses.filter(expense => expense.cardId === cardId);
  };
  
  export const getExpensesByType = (cardId: number, type: "expense" | "income") => {
    return cardExpenses.filter(expense => 
      expense.cardId === cardId && expense.type === type
    );
  };