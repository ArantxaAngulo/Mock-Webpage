// Clase para manejar excepciones de productos
class ProductException {
    constructor(error) {
        this.error = error;
        this.name = "ProductException";
    }
}

// Clase Producto
class Product {
    constructor(uuid, name, description, price, image, category) {
        this._uuid = uuid;
        this._name = name;
        this._description = description;
        this._price = price;
        this._image = image;
        this._category = category;
    }

    // Getters y setters con validaciones básicas
    get uuid() {
        return this._uuid;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        if (!value || value.trim() === "") {
            throw new ProductException("El nombre no puede estar vacío");
        }
        this._name = value;
    }

    get description() {
        return this._description;
    }

    set description(value) {
        if (!value || value.trim() === "") {
            throw new ProductException("La descripción no puede estar vacía");
        }
        this._description = value;
    }

    get price() {
        return this._price;
    }

    set price(value) {
        if (isNaN(value) || value <= 0) {
            throw new ProductException("El precio debe ser un número positivo");
        }
        this._price = parseFloat(value);
    }

    get image() {
        return this._image;
    }

    set image(value) {
        if (!value || value.trim() === "") {
            throw new ProductException("La URL de la imagen no puede estar vacía");
        }
        this._image = value;
    }

    get category() {
        return this._category;
    }

    set category(value) {
        if (!value || value.trim() === "") {
            throw new ProductException("La categoría no puede estar vacía");
        }
        this._category = value;
    }

    // Métodos estáticos para crear productos
    static createFromJson(jsonValue) {
        try {
            const obj = JSON.parse(jsonValue);
            return Product.createFromObject(obj);
        } catch (e) {
            throw new ProductException("JSON inválido");
        }
    }

    static createFromObject(obj) {
        const newObj = {};
        
        // Solo copiamos las propiedades que necesitamos
        if (obj.uuid) newObj.uuid = obj.uuid;
        if (obj.name) newObj.name = obj.name;
        if (obj.description) newObj.description = obj.description;
        if (obj.price) newObj.price = obj.price;
        if (obj.image) newObj.image = obj.image;
        if (obj.category) newObj.category = obj.category;

        return new Product(
            newObj.uuid || crypto.randomUUID(),
            newObj.name,
            newObj.description,
            newObj.price,
            newObj.image,
            newObj.category
        );
    }
}

// Clase para manejar el carrito de compras
class ShoppingCart {
    constructor() {
        this._items = JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Guardar el carrito en localStorage
    _saveCart() {
        localStorage.setItem('cart', JSON.stringify(this._items));
    }

    // Agregar item al carrito
    addItem(productUuid, amount) {
        if (amount <= 0) {
            throw new ProductException("La cantidad debe ser mayor a 0");
        }

        const existingItem = this._items.find(item => item.productUuid === productUuid);
        
        if (existingItem) {
            existingItem.amount += amount;
        } else {
            this._items.push({
                productUuid: productUuid,
                amount: amount
            });
        }

        this._saveCart();
        this.updateCartUI();
    }

    // Actualizar cantidad de un item
    updateItem(productUuid, newAmount) {
        if (newAmount < 0) {
            throw new ProductException("La cantidad no puede ser negativa");
        }

        const itemIndex = this._items.findIndex(item => item.productUuid === productUuid);
        
        if (itemIndex === -1) {
            throw new ProductException("Producto no encontrado en el carrito");
        }

        if (newAmount === 0) {
            this._items.splice(itemIndex, 1);
        } else {
            this._items[itemIndex].amount = newAmount;
        }

        this._saveCart();
        this.updateCartUI();
    }

    // Eliminar item del carrito
    removeItem(productUuid) {
        this._items = this._items.filter(item => item.productUuid !== productUuid);
        this._saveCart();
        this.updateCartUI();
    }

    // Calcular total del carrito
    calculateTotal(products) {
        return this._items.reduce((total, item) => {
            const product = products.find(p => p.uuid === item.productUuid);
            if (product) {
                return total + (product.price * item.amount);
            }
            return total;
        }, 0);
    }

    // Obtener items del carrito
    getItems() {
        return this._items;
    }

    // Actualizar la interfaz del carrito
    updateCartUI() {
        if (window.location.pathname.includes('shopping_cart.html')) {
            renderCartItems();
        }
        
        // Actualizar el contador en el navbar
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this._items.reduce((sum, item) => sum + item.amount, 0);
        }
    }
}

// Instancia global del carrito
const cart = new ShoppingCart();

// Clase para manejar productos en el sistema
class ProductManager {
    constructor() {
        this._products = JSON.parse(localStorage.getItem('products')) || [];
        
        // Si no hay productos, cargamos algunos de ejemplo
        if (this._products.length === 0) {
            this._loadSampleProducts();
        }
    }

    // Cargar productos de ejemplo
    _loadSampleProducts() {
        const sampleProducts = [
            {
                uuid: crypto.randomUUID(),
                name: "Miel de Agave",
                description: "Made in Mexico, 100% pure and delicious. Keto friendly and weight loss friendly",
                price: 152.00,
                image: "https://elliquorstore.com/sites/default/files/productos/Miel%20de%20agave%20traficante%20500ml.jpg",
                category: "Sweeteners"
            },
            {
                uuid: crypto.randomUUID(),
                name: "Royal Kona",
                description: "Made in Hawaii direct from our award winning organic farm. Premium organic gourmet coffee beans",
                price: 50.00,
                image: "https://5.imimg.com/data5/SELLER/Default/2022/2/AL/QD/HP/3067591/coffee-powder-500x500.jpg",
                category: "Coffee"
            },
            {
                uuid: crypto.randomUUID(),
                name: "Tabasco Banana",
                description: "100% pure Mexican banana. Helps prevent heart disease and more!",
                price: 3.60,
                image: "https://mercanto.mx/cdn/shop/files/14722159_1_c96b134b-63ba-4283-acaa-522c07be604b.jpg?v=1738178500",
                category: "Fruits"
            }
        ];

        this._products = sampleProducts.map(p => Product.createFromObject(p));
        this._saveProducts();
    }

    // Guardar productos en localStorage
    _saveProducts() {
        localStorage.setItem('products', JSON.stringify(this._products));
    }

    // Obtener todos los productos
    getProducts() {
        return this._products;
    }

    // Obtener producto por UUID
    getProductById(uuid) {
        return this._products.find(p => p.uuid === uuid);
    }

    // Crear nuevo producto
    createProduct(productData) {
        const newProduct = Product.createFromObject(productData);
        this._products.push(newProduct);
        this._saveProducts();
        return newProduct;
    }

    // Actualizar producto
    updateProduct(uuid, updatedProductData) {
        const index = this._products.findIndex(p => p.uuid === uuid);
        if (index === -1) {
            throw new ProductException("Producto no encontrado");
        }

        const updatedProduct = Product.createFromObject({
            ...this._products[index],
            ...updatedProductData,
            uuid: uuid // Aseguramos que el UUID no cambie
        });

        this._products[index] = updatedProduct;
        this._saveProducts();
        return updatedProduct;
    }

    // Eliminar producto
    deleteProduct(uuid) {
        this._products = this._products.filter(p => p.uuid !== uuid);
        this._saveProducts();
    }

    // Buscar productos
    findProduct(query) {
        if (!query) return this._products;

        const [categoryPart, titlePart] = query.split(':').map(part => part.trim());
        
        return this._products.filter(product => {
            const categoryMatch = !categoryPart || 
                                product.category.toLowerCase().includes(categoryPart.toLowerCase());
            const titleMatch = !titlePart || 
                             product.name.toLowerCase().includes(titlePart.toLowerCase());
            
            return categoryMatch && titleMatch;
        });
    }

    // Obtener productos paginados
    getPaginatedProducts(page = 1, itemsPerPage = 8) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return {
            products: this._products.slice(startIndex, endIndex),
            totalPages: Math.ceil(this._products.length / itemsPerPage),
            currentPage: page
        };
    }
}

// Instancia global del administrador de productos
const productManager = new ProductManager();

// Función para renderizar productos en la página principal
function renderProducts(page = 1) {
    const container = document.querySelector('.container .row');
    if (!container) return;

    const paginatedData = productManager.getPaginatedProducts(page);
    const { products, totalPages, currentPage } = paginatedData;

    container.innerHTML = products.map(product => `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text flex-grow-1">${product.description}</p>
                    <p class="card-text fw-bold">$${(product.price && !isNaN(product.price)) ? product.price.toFixed(2) : 'N/A'}</p>
                    console.log(product.price); // Check the value of product.price

                    <div class="d-flex justify-content-between">
                        <button class="btn btn-primary add-to-cart" data-uuid="${product.uuid}">Add to Cart</button>
                        <input type="number" min="1" value="1" class="form-control w-25 quantity-input">
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Actualizar paginación
    updatePagination(totalPages, currentPage);
}

// Función para actualizar la paginación
function updatePagination(totalPages, currentPage) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" aria-label="Previous" data-page="${currentPage - 1}">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" aria-label="Next" data-page="${currentPage + 1}">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;

    pagination.innerHTML = paginationHTML;
}

// Función para renderizar el carrito de compras
function renderCartItems() {
    const cartContainer = document.querySelector('.col-md-8');
    const summaryContainer = document.querySelector('.col-md-4 .border');
    
    if (!cartContainer || !summaryContainer) return;

    const items = cart.getItems();
    const products = productManager.getProducts();
    
    if (items.length === 0) {
        cartContainer.innerHTML = '<div class="alert alert-info">Your cart is empty</div>';
        summaryContainer.innerHTML = '<h5>Order Summary</h5><p>Your cart is empty</p>';
        return;
    }

    // Renderizar items del carrito
    cartContainer.innerHTML = items.map(item => {
        const product = products.find(p => p.uuid === item.productUuid);
        if (!product) return '';
        
        return `
            <div class="media border p-3 mb-3">
                <img src="${product.image}" class="mr-3 align-self-center product-img">
                <div class="media-body">
                    <h5>${product.name} 
                        <button class="btn btn-danger btn-sm float-right remove-item" data-uuid="${product.uuid}">&#128465;</button>
                    </h5>
                    <p>
                        Quantity: 
                        <input type="number" value="${item.amount}" class="form-control d-inline w-25 quantity-input" data-uuid="${product.uuid}">
                        <button class="btn btn-info btn-sm update-item" data-uuid="${product.uuid}">✎</button>
                    </p>
                    <p>Price: $${product.price.toFixed(2)} </p>
                </div>
            </div>
        `;
    }).join('');

    // Renderizar resumen del pedido
    const shippingCost = 30.00;
    const subtotal = cart.calculateTotal(products);
    const total = subtotal + shippingCost;
    
    summaryContainer.innerHTML = `
        <h5>Order Summary</h5>
        ${items.map(item => {
            const product = products.find(p => p.uuid === item.productUuid);
            if (!product) return '';
            return `<p>${product.name}: ${item.amount} x ${product.price.toFixed(2)}</p>`;
        }).join('')}
        <p>Shipping: $${shippingCost.toFixed(2)}</p>
        <h5>Total: $${total.toFixed(2)}</h5>
        <button class="btn btn-success btn-block" id="pay-button">Pay</button>
        <button class="btn btn-danger btn-block" id="cancel-button">Cancel</button>
    `;
}

// Función para manejar eventos
function setupEventListeners() {
    // Eventos para la página principal
    document.addEventListener('click', function(e) {
        // Agregar al carrito
        if (e.target.classList.contains('add-to-cart')) {
            const productUuid = e.target.getAttribute('data-uuid');
            const quantityInput = e.target.closest('.card-body').querySelector('.quantity-input');
            const quantity = parseInt(quantityInput.value);
            
            if (quantity > 0) {
                cart.addItem(productUuid, quantity);
                alert('Product added to cart!');
            } else {
                alert('Please enter a valid quantity');
            }
        }
        
        // Paginación
        if (e.target.classList.contains('page-link')) {
            e.preventDefault();
            const page = parseInt(e.target.getAttribute('data-page'));
            renderProducts(page);
        }
    });

    // Eventos para la página del carrito
    document.addEventListener('click', function(e) {
        // Eliminar item del carrito
        if (e.target.classList.contains('remove-item')) {
            const productUuid = e.target.getAttribute('data-uuid');
            cart.removeItem(productUuid);
        }
        
        // Actualizar cantidad
        if (e.target.classList.contains('update-item')) {
            const productUuid = e.target.getAttribute('data-uuid');
            const quantityInput = document.querySelector(`.quantity-input[data-uuid="${productUuid}"]`);
            const newQuantity = parseInt(quantityInput.value);
            
            if (newQuantity > 0) {
                cart.updateItem(productUuid, newQuantity);
            } else {
                alert('Quantity must be greater than 0');
            }
        }
        
        // Pagar
        if (e.target.id === 'pay-button') {
            alert('Thank you for your purchase!');
            cart.getItems().forEach(item => cart.removeItem(item.productUuid));
        }
        
        // Cancelar
        if (e.target.id === 'cancel-button') {
            if (confirm('Are you sure you want to clear your cart?')) {
                cart.getItems().forEach(item => cart.removeItem(item.productUuid));
            }
        }
    });

    // Eventos para los modales
    document.getElementById('registerForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar que las contraseñas coincidan
        const password = this.querySelector('input[name="password"]').value;
        const confirmPassword = this.querySelector('input[name="confirmPassword"]').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        alert('Registration successful!');
        bootstrap.Modal.getInstance(this.closest('.modal')).hide();
    });

    document.querySelector('form[action="#"]')?.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Login successful!');
        bootstrap.Modal.getInstance(this.closest('.modal')).hide();
    });
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/') {
        renderProducts();
    } else if (window.location.pathname.includes('shopping_cart.html')) {
        renderCartItems();
    }
    
    // Actualizar contador del carrito
    cart.updateCartUI();
});