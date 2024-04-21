// App.js

// Déclarez une variable pour le contrat BookMarket
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

    // Écouter les événements du formulaire
    document.getElementById('sell-book-form').addEventListener('submit', sellBook);

    // Charger la liste des livres
    await loadBooksForSale();
}

// Fonction pour mettre un livre en vente
async function sellBook(event) {
    event.preventDefault(); // Empêcher la soumission du formulaire

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;
    const file = document.getElementById('file').files[0];
    const cover = document.getElementById('cover').files[0];

    // Ajouter le livre à la blockchain
    try {
        const fileHash = await uploadFileToIPFS(file);
        const coverHash = await uploadFileToIPFS(cover);
        // Appeler la fonction du contrat pour ajouter un livre en vente
        await bookMarket.methods.addBook(title, author, price, description, coverHash, fileHash).send({ from: window.userAddress });

        // Actualiser la liste des livres après la vente
        await loadBooksForSale();
        const toastLiveExample = document.getElementById('liveToast')
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastBootstrap.show()
    } catch (error) {
        console.error('Error while selling book:', error);
        const toastLiveExample = document.getElementById('liveToastfail')
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastBootstrap.show()
    }
}

// Fonction pour charger et afficher les livres achetés par l'utilisateur
// Fonction pour charger et afficher les livres mis en vente par l'utilisateur
async function loadBooksForSale() {
    // Effacer la liste existante des livres mis en vente par l'utilisateur
    const booksForSaleList = document.getElementById('books-for-sale-list');
    booksForSaleList.innerHTML = '';

    try {
        // Récupérer les livres mis en vente par l'utilisateur
        const booksForSaleIndices = await bookMarket.methods.getBooksOwnedByUser(window.userAddress).call();

        if (booksForSaleIndices.length == 0) {
            booksForSaleList.innerHTML = 'Aucun livre en vente pour le moment.';
        }

        // Parcourir tous les livres mis en vente et les afficher
        //supprimer les indexs en double :
        const uniqueBooksForSaleIndices = [...new Set(booksForSaleIndices)];

        for (const index of uniqueBooksForSaleIndices) {
            const bookForSale = await bookMarket.methods.getBookByIndex(index).call();
            const bookForSaleElement = createBookElement(bookForSale);
            booksForSaleList.appendChild(bookForSaleElement);
        }
    } catch (error) {
        console.error('Error loading books for sale:', error);
        alert('Error occurred while loading books for sale.');
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


// Fonction pour mettre en vente un fichier sur IPFS et récupérer son hash
async function uploadFileToIPFS(file) {
    const client = KuboRpcClient.create(new URL('http://localhost:5001'))
    // Code pour mettre en vente un fichier sur IPFS (à implémenter)
    const cid = await client.add(file)// Remplacez 'fichier.txt' par le nom de votre fichier
    return cid.path;
}

// Appeler la fonction d'initialisation de l'application au chargement de la page
initApp();
