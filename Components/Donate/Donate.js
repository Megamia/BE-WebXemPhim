const express = require('express');
const bodyParser = require('body-parser');
const paypal = require('@paypal/checkout-server-sdk');
const router = express.Router();
const cors = require('cors');

const app = express();
app.use(cors());

app.use(bodyParser.json());

// Khởi tạo PayPal client
const clientId = 'Ac9K4i7QCNP72Tt9H5W02MjClbQxKDPTLQGMjkltRGInHipe139bwdFZILDbE1PyDm90A5HnHNupLrf_';
const clientSecret = 'EC4vAcL-Li5OEjit8PlgMlKLoOAEHSFXhZ6kcLsRXO5vjVQNQD2e2AWTvaRkfmxm0LT9bPAWqoKM4xKX';
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

// Tạo yêu cầu thanh toán và lấy URL để chuyển hướng
app.post('/api/paypal/donate', async (req, res) => {
  const { amount } = req.body;
  console.log('Amount received from frontend:', amount);
  // Tạo yêu cầu thanh toán
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: amount,
        },
      },
    ],
  });

  try {
    // Gửi yêu cầu tạo đơn hàng đến PayPal API
    const response = await client.execute(request);

    // Lấy URL để chuyển hướng đến trang PayPal
    const approvalUrl = response.result.links.find((link) => link.rel === 'approve').href;

    // Trả về URL cho phía React
    res.json({ approvalUrl });
  } catch (error) {
    // Xử lý lỗi
    console.error('Có lỗi xảy ra khi tạo yêu cầu thanh toán PayPal:', error.message);
    res.status(500).json({ error: 'Có lỗi xảy ra khi xử lý thanh toán' });
  }
});

module.exports = router;