type Order = {
  id: string
  payment_source?: { [key: string]: unknown }
}

const order1: Order = {
  id: "123",
  payment_source: {
    card: {
      type: "credit",
      number: "1234",
    },
  },
}

const order2: Order = {
  id: "456",
  payment_source: {
    paypal: {
      email: "test@example.com",
    },
  },
}


// function that returns the name of the payment source from an order
const getPaymentSource = (order: Order) => {
    const paymentSource = order.payment_source;
    if (paymentSource) {
        const sourceName = Object.keys(paymentSource)[0]
        return sourceName;
    }
    return "unknown";
}

console.log(getPaymentSource(order1)) // card
console.log(getPaymentSource(order2)) // paypal


