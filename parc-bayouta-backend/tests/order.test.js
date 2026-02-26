const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const { Order } = require('../models');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Order API', () => {
    describe('POST /api/orders', () => {
        it('should create a new order', async () => {
            const orderData = {
                tableNumber: "15",
                items: [
                    { name: "Coffee", price: 3.5, quantity: 2 },
                    { name: "Cake", price: 5, quantity: 1 }
                ],
                totalAmount: 12,
                status: 'pending'
            };

            const res = await request(app)
                .post('/api/orders')
                .send(orderData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.tableNumber).toEqual("15");
            expect(res.body.items.length).toEqual(2);

            const dbOrder = await Order.findOne({ tableNumber: "15" });
            expect(dbOrder).toBeTruthy();
        });

        it('should fail if tableNumber is missing', async () => {
            const orderData = {
                items: [{ name: "Coffee", price: 3.5, quantity: 2 }],
                totalAmount: 7
            };

            const res = await request(app)
                .post('/api/orders')
                .send(orderData);

            expect(res.statusCode).not.toEqual(201);
        });
    });
});
