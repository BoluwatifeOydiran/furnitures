// Declearing variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// cart
let cart = [];
// buttons
let buttonsDOM = [];

// getting the product
const getProducts = async () => {
  try {
    let result = await fetch("products.json");
    // console.log(result);

    let data = await result.json();
    // console.log(data);

    let products = data.items;
    // console.log(products);

    products = products.map((item) => {
      // console.log(item);
      const { title, price } = item.fields;
      const { id } = item.sys;
      const image = item.fields.image.fields.file.url;
      return { title, price, id, image };
    });
    console.log(products);
    return products;
  } catch (err) {
    console.log(err);
  }
};

// saving the products to local storage
const saveProductsToStorage = (products) => {
  localStorage.setItem("products", JSON.stringify(products));
};

// getting an item from local storage using the id
const getProductFromStorage = (id) => {
  const products = JSON.parse(localStorage.getItem("products"));
  return products.find((product) => product.id === id);
};

// displaying the products
const displayProducts = (products) => {
  let result = "";
  products.forEach((product) => {
    result += `
      <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="Product 1"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart">add to cart</i>
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
      `;
  });
  productsDOM.innerHTML = result;
};

// Saving cart to local storage
const saveCartToLocalStorage = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

// getting cart items in local storage
const getCartItemsFromLocalStoarge = () => {
  return localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : [];
};

// getting the add to cart button from each button
const getBagButtons = () => {
  const buttons = [...document.querySelectorAll(".bag-btn")];
  buttonsDOM = buttons;

  // checking through the button to get each individual product
  buttons.forEach((button) => {
    let id = button.dataset.id;
    let inCart = cart.find((item) => item.id === id);

    // setting up the button for differente click function
    if (inCart) {
      button.innerHTML = "In Cart";
      button.disabled = true;
    }
    button.addEventListener("click", (e) => {
      e.target.innerHTML = "In cart";
      e.target.disabled = true;
      // getting product from products
      let cartItem = { ...getProductFromStorage(id), amount: 1 };
      // add product to cart
      cart = [...cart, cartItem];
      // console.log(cart);

      saveCartToLocalStorage(cart);

      // set cart values
      setCartValues(cart);

      // dispalying the cart items
      displayCartItems(cartItem);

      // targetting the css class property tom displayong the cart

      // showcart();
    });
  });
};

// dispalying the cart items
const displayCartItems = (item) => {
  const div = document.createElement("div");
  div.classList.add("cart-item");
  div.innerHTML = `
          <img src=${item.image} alt="product 1" />
          <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
          </div>
          <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
          </div>
      `;
  cartContent.appendChild(div);
  // console.log(cartContent);
};

// setting the values in the cart
const setCartValues = (cart) => {
  let tempTotal = 0;
  let itemsTotal = 0;
  cart.map((item) => {
    tempTotal += item.price * item.amount;
    itemsTotal += item.amount;
  });
  cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
  cartItems.innerText = itemsTotal;
};

// populating each item in the cart
const populateCart = (cart) => {
  cart.forEach((item) => displayCartItems(item));
};

// setting cart application
const setApp = () => {
  cart = getCartItemsFromLocalStoarge();
  // console.log(cart);
  setCartValues(cart);
  populateCart(cart);
};

const getSingleButton = (id) => {
  return buttonsDOM.find((button) => button.dataset.id === id);
};

// removing item in the cart
const removeItem = (id) => {
  cart = cart.filter((item) => item.id !== id);
  // console.log(cart);
  setCartValues(cart);
  saveCartToLocalStorage(cart);
  let button = getSingleButton(id);
  button.disabled = false;
  button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
};

// an event listener that fire after the dom content is being loaded
document.addEventListener("DOMContentLoaded", () => {
  // setup application
  setApp();

  // getting all products
  getProducts()
    .then((products) => {
      displayProducts(products);
      saveProductsToStorage(products);
    })
    .then(() => {
      getBagButtons();
    });
});

cartBtn.addEventListener(
  "click",
  (showCart = () => {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  })
);

closeCartBtn.addEventListener(
  "click",
  (closeCart = () => {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  })
);

clearCartBtn.addEventListener("click", () => {
  let cartItems = cart.map((item) => item.id);
  cartItems.forEach((id) => removeItem(id));
  while (cartContent.children.length > 0) {
    cartContent.removeChild(cartContent.children[0]);
  }
});

cartContent.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-item")) {
    let removeProduct = e.target;
    let id = removeProduct.dataset.id;
    cartContent.removeChild(removeProduct.parentElement.parentElement);
    removeItem(id);
  } else if (e.target.classList.contains("fa-chevron-up")) {
    let addAmount = e.target;
    let id = addAmount.dataset.id;
    let tempItem = cart.find((item) => item.id === id);
    tempItem.amount += 1;
    saveCartToLocalStorage(cart);
    setCartValues(cart);
    addAmount.nextElementSibling.innerText = tempItem.amount;
  } else if (e.target.classList.contains("fa-chevron-down")) {
    let lowerAmount = e.target;
    let id = lowerAmount.dataset.id;
    let tempItem = cart.find((item) => item.id === id);
    tempItem.amount -= 1;
    if (tempItem.amount > 0) {
      saveCartToLocalStorage(cart);
      setCartValues(cart);
      lowerAmount.previousElementSibling.innerText = tempItem.amount;
    } else {
      cartContent.removeChild(lowerAmount.parentElement.parentElement);
      removeItem(id);
    }
  }
});
