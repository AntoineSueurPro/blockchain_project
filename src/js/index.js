// index.js

// Déclarer une variable pour le contrat BookMarket
let bookMarket;

// Fonction pour initialiser l'application
async function initApp() {
    // Vérifier si MetaMask est installé
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask or use a web3-enabled browser.');
        return;
    }

    // Initialiser Web3
    window.web3 = new Web3(window.ethereum);

    // Demander à l'utilisateur l'autorisation d'accéder à son compte Ethereum
    await window.ethereum.enable();

    // Récupérer l'adresse Ethereum de l'utilisateur connecté
    const accounts = await window.web3.eth.getAccounts();
    window.userAddress = accounts[0];

    window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        window.userAddress = accounts[0];
        window.location.reload();
    })

    // Charger le contrat BookMarket à partir du fichier JSON
    const response = await fetch('./build/contracts/BookMarket.json');
    const data = await response.json();
    const BookMarketArtifact = data;
    const networkId = await window.web3.eth.net.getId();
    const deployedNetwork = BookMarketArtifact.networks[networkId];
    bookMarket = new window.web3.eth.Contract(
        BookMarketArtifact.abi,
        deployedNetwork && deployedNetwork.address,
    );

    // Charger et afficher la liste des livres disponibles
    await loadBooks();
}

// Fonction pour charger et afficher la liste des livres disponibles
async function loadBooks() {
    // Effacer la liste existante des livres
    const booksList = document.getElementById('books-list');
    booksList.innerHTML = '';

    try {
        // Récupérer le nombre total de livres
        const totalBooks = await bookMarket.methods.getBooksCount().call();

        // Récupérer les livres achetés par l'utilisateur
        const userPurchasedBooks = await bookMarket.methods.getBooksPurchasedByUser(window.userAddress).call();

        // Parcourir tous les livres et les afficher
        for (let i = 0; i < totalBooks; i++) {
            const book = await bookMarket.methods.getBookByIndex(i).call();
            const bookIndex = i; // Récupérer l'index du livre
            const bookElement = createBookElement(book, bookIndex, userPurchasedBooks);
            booksList.appendChild(bookElement);
        }
    } catch (error) {
        console.error('Error loading books:', error);
        alert('Error occurred while loading books.');
    }
}

// Fonction pour annuler les transactions en attente
async function cancelPendingTransactions() {
    const pendingTransactions = await window.web3.eth.getBlockTransactionCount('pending');
    for (let i = 0; i < pendingTransactions; i++) {
        const tx = await window.web3.eth.getTransactionFromBlock('pending', i);
        if (tx.from.toLowerCase() === window.userAddress.toLowerCase()) {
            await window.web3.eth.sendTransaction({
                from: window.userAddress,
                to: window.userAddress,
                value: 0,
                nonce: tx.nonce,
                gasPrice: '1',
                gas: '21000'
            });
        }
    }
}

// Fonction utilitaire pour créer un élément HTML représentant un livre
function createBookElement(book, bookIndex, userPurchasedBooks) {
    let disabled = false;
    let action = "Acheter"
    let classAction = "btn-primary"
    userPurchasedBooks.forEach((index) => {
        if (index == bookIndex) {
            action = "Déjà acheté";
            disabled = true;
            classAction = "btn-danger"
        }
    }
    )
    if (book[6] == window.userAddress) {
        disabled = true;
        action = "Votre livre"
        classAction = "btn-danger"
    }

    const bookElement = document.createElement('div');
    bookElement.innerHTML = `<div class="card h-100" style="width: 18rem;">
    <img src="https://ipfs.io/ipfs/${book[4]}" class="img-responsive object-fit-cover img-rounded"
    style="max-height: 200px; alt="...">
    <div class="card-body d-flex flex-column justify-content-between">
      <h5 class="card-title"> ${book[0]}</h5>
      <p class="card-text">Author: ${book[1]}</p>
        <p class="card-text">Price: ${book[2]} ETH</p>
      <p class="card-text">${book[3]}</p>
      <button id="buyButton" ${disabled ? "disabled" : ""} class="btn ${classAction}">${action}</button>
    </div>
  </div>`;
    const buyButton = bookElement.querySelector('#buyButton');
    buyButton.addEventListener('click', async () => {
        if (disabled) {
            return;
        }
        try {
            await cancelPendingTransactions();
            await bookMarket.methods.buyBook(bookIndex).send({ from: window.userAddress, value: window.web3.utils.toWei(book[2], 'ether') });
            const toastLiveExample = document.getElementById('liveToast')
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
            toastBootstrap.show()
            loadBooks();
        } catch (error) {
            console.error('Error purchasing book:', error);
            const toastLiveExample = document.getElementById('liveToastfail')
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
            toastBootstrap.show()
        }
    });
    return bookElement;
}

// Appeler la fonction d'initialisation de l'application au chargement de la page
initApp();
