// oldalsó menü *******************************************************************************
const vegburger = document.getElementById('vegburger')
const nav = document.getElementById('nav')

// klikkre css osztályokat cserélünk **********************************************************
vegburger.addEventListener('click', (event) => {
    nav.classList.toggle('menu-active')
    vegburger.classList.toggle('fi-align-justify')
    vegburger.classList.toggle('fi-arrow-left')
})

nav.addEventListener('mouseLeave', () => {
    nav.classList.remove('menu-active')
    vegburger.classList.remove('fi-arrow-left')
    vegburger.classList.add('fi-align-justify')
})

// Termékek beillesztése **********************************************************************
// TODO ez általában a backendről jön
let products = []
const productsSection = document.getElementById('products')

// Adat kérése a szerverről - aszinkron hívás is van benne
fetch('https://hur.webmania.cc/products.json') // alapesetben GET http metódusal hív
    .then(response => response.json())
    .then(data => {
        products = data.products
        products.forEach(product => {
            productsSection.innerHTML += `<div>
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <img src="${product.picture}">
                <h3>${product.price} Ft</h3>`
            if(product.stock){
                productsSection.innerHTML += `<a id="${product.id}"
                class="addToCart">Kosárba</a>`
            } else {
                productsSection.innerHTML += 'Nem rendelhető'
            }
            productsSection.innerHTML += `</div>`
            // gyűjtsük ki az addToCart css class-ú elemeket
            const addToCartButtons = document.getElementsByClassName('addToCart')
            // nézzük meg, hogy hány darab van belőle
            const buttonCount = addToCartButtons.length
            // lépegessünk végig rajta
            for(let i = 0; i < buttonCount; i++){
                // adjunk hozzájuk egyesével egy click figyelőt
                // addToCart --> ez itt egy callBack függvény
                addToCartButtons[i].addEventListener('click', addToCart)
            }
        })        
    })
    .catch(error => console.log(error)) // hiba kiíratása, ha bármi történne a kommunikációval

// Kosár kezelése ********************************************************************
const cart = {} // {id : quantity}

const addToCart = (event) => {
    // nézzük meg, hogy a kosárba gombot nyomtuk meg (van id), vagy a + gombot (nincs id)
    let target = event.target.id ? event.target.id : event.target.dataset.id
    // ha még nincs benne a kosárban, adjuk hozzá 1 darabbal
    if(cart[target] == undefined){
        cart[target] = 1
    } else {
        // ha már van ilyen a kosárban, akkor növeljük a darabszámát
        cart[target]++
    }
}

const discountMinimumAmount = 30000
const discountMinimumPieces = 12
const discount = 0.1

const refreshCartItems = () => {
    cartItems.innerHTML = ''
    // total 0-ázása
    let total = 0, maxPieces = 0
    // lépegessünk végig a cart-on és a products tömbből keressük ki a szóban forgó terméket,
    for (const id in cart) {
        // - jelenítsük meg a terméket, a cartban lévő darabszámot, és a termék árát
        const currentProduct = products.find(product=>product.id == id)
        cartItems.innerHTML += `<li>
            <button data-id="${currentProduct.id}">+</button>
            ${cart[id]} db - ${currentProduct.name} * ${currentProduct.price} Ft/db
            </li>`
        // adjuk hozzá ennek az értékét a teljes összeghez
        total += currentProduct.price * cart[id]
        maxPieces = cart[id] > maxPieces ? cart[id] : maxPieces
    }

    // ha van olyan termék amiből több mint 10 van, vagy total > 50000 akkor adjunk 10% kedvezményt
    if(total > discountMinimumAmount || maxPieces >= discountMinimumPieces) {
        cartItems.innerHTML += `<li>Kedvezmény: ${(total * discount).toLocaleString()}</li>`
    }
    // - a végén jelenítsük meg a teljes vásárlási összeget
    // Az összesenből vonjuk le a kedvezményt
    cartItems.innerHTML += `<li>Összesen: ${total.toLocaleString()}</li>`
}

// tegyünk rá egy click figyelőt a kosár ikonra
const cartIcon = document.getElementById('cart-icon')
const cartContent = document.getElementById('cart-content')
const cartItems = document.getElementById('cart-items')

cartIcon.addEventListener('click', function(){
    cartContent.classList.toggle('active')
    // Jelenlegi cart-items tartalom kiürítése
    refreshCartItems()
})

// Tegyük rá a + gombokra a click figyelőt a kosárba helyezéssel
// event delegation
cartItems.addEventListener('click', (event) => {
    addToCart(event) // ha callback-ként van hívva, akkor automatikusan megkapja a paramétert, így viszont nem
    refreshCartItems()
})