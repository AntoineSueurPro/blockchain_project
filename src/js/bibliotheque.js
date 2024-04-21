// bibliotheque.js

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
    const response = await fetch('../../build/contracts/BookMarket.json');
    const data = await response.json();
    const BookMarketArtifact = data;
    const networkId = await window.web3.eth.net.getId();
    const deployedNetwork = BookMarketArtifact.networks[networkId];
    bookMarket = new window.web3.eth.Contract(
        BookMarketArtifact.abi,
        deployedNetwork && deployedNetwork.address,
    );


    // Charger et afficher les livres achetés par l'utilisateur
    await loadOwnedBooks();
}

// Fonction pour charger et afficher les livres achetés par l'utilisateur
async function loadOwnedBooks() {
    // Effacer la liste existante des livres achetés par l'utilisateur
    const ownedBooksList = document.getElementById('owned-books-list');
    ownedBooksList.innerHTML = 'Aucun livre acheté pour le moment.';

    try {
        // Récupérer les livres achetés par l'utilisateur
        const ownedBooksIndices = await bookMarket.methods.getBooksPurchasedByUser(window.userAddress).call();
        if (ownedBooksIndices.length > 0) {
            ownedBooksList.innerHTML = '';
        }

        // Parcourir tous les livres achetés et les afficher
        for (const index of ownedBooksIndices) {
            const ownedBook = await bookMarket.methods.getBookByIndex(index).call();
            const ownedBookElement = createBookElement(ownedBook);
            ownedBooksList.appendChild(ownedBookElement);
        }
    } catch (error) {
        console.error('Error loading owned books:', error);
        alert('Error occurred while loading owned books.');
    }
}

// Fonction utilitaire pour créer un élément HTML représentant un livre
function createBookElement(book) {
    const bookElement = document.createElement('div');
    bookElement.innerHTML = `<div class="card h-100" style="width: 18rem;">
    <img src="https://ipfs.io/ipfs/${book[4]}" class="img-responsive object-fit-cover img-rounded"
    style="max-height: 200px; alt="...">
    <div class="card-body d-flex flex-column justify-content-between">
      <h5 class="card-title"> ${book[0]}</h5>
      <p class="card-text">Author: ${book[1]}</p>
        <p class="card-text">Price: ${book[2]} ETH</p>
      <p class="card-text">${book[3]}</p>
      <a href="https://ipfs.io/ipfs/${book[5]}" target="_blank" class="btn btn-primary">Télécharger</a>
    </div>
  </div>`;
    return bookElement;
}

// Appeler la fonction d'initialisation de l'application au chargement de la page
initApp();
