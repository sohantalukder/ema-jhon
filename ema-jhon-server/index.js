const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.send('Ema Jhon running is server');
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kyofh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		const database = client.db('online_shop');
		const productsCollection = database.collection('products');
		const orderCollection = database.collection('orders');
		//GET Products API
		app.get('/products', async (req, res) => {
			const cursor = productsCollection.find({});
			const page = req.query.page;
			const size = parseInt(req.query.size);
			let products;
			const count = await cursor.count();
			if (page) {
				products = await cursor
					.skip(page * size)
					.limit(size)
					.toArray();
			} else {
				const products = await cursor.toArray();
			}

			res.send({
				count,
				products,
			});
		});
		console.log('Database connected Successfully');
		app.post('/products/byKeys', async (req, res) => {
			const keys = req.body;
			const query = { key: { $in: keys } };
			const products = await productsCollection.find(query).toArray();
			res.send(products);
		});

		// Add Orders API
		app.post('/orders', async (req, res) => {
			const order = req.body;
			const result = await orderCollection.insertOne(order);
			res.json(result);
		});
	} finally {
		//await client.close();
	}
}

run().catch(console.dir);
app.listen(port, () => {
	console.log('Server running is server', port);
});
