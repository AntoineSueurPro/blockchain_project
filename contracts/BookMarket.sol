// BookMarket.sol

pragma solidity ^0.8.19;

contract BookMarket {
    struct Book {
        string title;
        string author;
        uint256 price;
        string description;
        string coverHash;
        string fileHash;
        address owner;
    }

    Book[] public books;

    mapping(address => uint256[]) public booksOwnedByUser;
    mapping(address => uint256[]) public booksPurchasedByUser;

    event BookAdded(address indexed owner, uint256 indexed index);
    event BookPurchased(address indexed buyer, uint256 indexed index);

    function addBook(
        string memory _title,
        string memory _author,
        uint256 _price,
        string memory _description,
        string memory _coverHash,
        string memory _fileHash
    ) public {
        books.push(
            Book(
                _title,
                _author,
                _price,
                _description,
                _coverHash,
                _fileHash,
                msg.sender
            )
        );
        booksOwnedByUser[msg.sender].push(books.length - 1);
        emit BookAdded(msg.sender, books.length - 1);
    }

    function getBooksCount() public view returns (uint256) {
        return books.length;
    }

    function getBookByIndex(
        uint256 _index
    )
        public
        view
        returns (
            string memory,
            string memory,
            uint256,
            string memory,
            string memory,
            string memory,
            address
        )
    {
        require(_index < books.length, "Book index out of bounds");
        Book memory book = books[_index];
        return (
            book.title,
            book.author,
            book.price,
            book.description,
            book.coverHash,
            book.fileHash,
            book.owner
        );
    }

    function buyBook(uint256 _index) public payable {
        require(_index < books.length, "Book index out of bounds");
        Book storage book = books[_index];
        require(msg.value >= book.price, "Insufficient funds");

        booksPurchasedByUser[msg.sender].push(_index);
        booksOwnedByUser[book.owner].push(_index);

        payable(book.owner).transfer(msg.value);

        emit BookPurchased(msg.sender, _index);
    }

    function getBooksOwnedByUser(
        address _user
    ) public view returns (uint256[] memory) {
        return booksOwnedByUser[_user];
    }

    function getBooksPurchasedByUser(
        address _user
    ) public view returns (uint256[] memory) {
        return booksPurchasedByUser[_user];
    }
}
