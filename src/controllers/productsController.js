const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');
const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
const escribirJSON = (data, filename) => {
	fs.writeFileSync(`./src/data/${filename}.json`, JSON.stringify(data,null,3), 'utf-8')
	return null
}

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	// Root - Show all products
	index: (req, res) => {
		// Do the magic
		return res.render('products', {
			products,
			toThousand
		});
	},

	// Detail - Detail from one product
	detail: (req, res) => {
		// Do the magic
		const product = products.find(product => product.id === +req.params.id)
		return res.render('detail', {
			...product,
			toThousand
		})
	},

	// Create - Form to create
	create: (req, res) => {
		// Do the magic
		return res.render('product-create-form')
	},

	// Create -  Method to store
	store: (req, res) => {
		// Do the magic

		const image = req.file
		const lastID = products[products.length - 1].id;
		const {name, price, discount,description, category} = req.body

		const newProduct = {
			id: lastID + 1,
			name: name.trim(),
			price: +price,
			discount: +discount,
			category: category,
			description: description.trim(),
			image: image ? image.filename : null,
		}

		products.push(newProduct);

		fs.writeFileSync(productsFilePath,JSON.stringify(products), 'utf-8')

		return res.redirect("/products/detail/" + newProduct.id)
	},

	// Update - Form to edit
	edit: (req, res) => {
		// Do the magic
		const product = products.find(product => product.id === +req.params.id)
		return res.render('product-edit-form',{
			...product
		})
	},
	// Update - Method to update
	update: (req, res) => {
		// Do the magic
		const {name, price, discount,description, category} = req.body


		const productsUpdated = products.map(product => {
			if(product.id == req.params.id){
				
				(req.file && fs.existsSync('public/images/products/' + product.image)) && fs.unlinkSync('public/images/products/' + product.image)/*AGREGAR ESTO */ 
				
				product.name = name.trim()
				product.price = +price
				product.discount = +discount
				product.category = category
				product.description = description.trim()
				product.image = req.file ? req.file.filename : product.image/*AGREGUE ESTO*/ 

			}

			return product
		});


		fs.writeFileSync(productsFilePath,JSON.stringify(productsUpdated), 'utf-8')

		return res.redirect("/products/detail/" + req.params.id)
	},

	// Delete - Delete one product from DB
	destroy: (req, res) => {
		// Do the magic
		const {id} = req.params;/*AGREGANDO PARA EDITAR AGREGUE TODO */

		const {image} = products.find(product => product.id == id);

		fs.existsSync('public/images/products/' + image) && fs.unlinkSync('public/images/products/' + image)
	
		const productsFiltered = products.filter(product => product.id != id);

		(escribirJSON(productsFiltered, 'productsDataBase'))
		
		return res.render('products', {
			products:productsFiltered,
			toThousand
		});
		
	
	}
};

module.exports = controller;