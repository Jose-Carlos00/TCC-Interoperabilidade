// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HTLC {

    IERC20 public immutable token;

    address public immutable owner;

    address public immutable recipient;

    uint256 public immutable amount;

    bytes32 public immutable hashLock;

    uint256 public immutable lockTime;

    uint256 public immutable startTime;

    bool public claimed;

    bool public refunded;

    event Locked(
        address indexed owner,
        address indexed recipient,
        uint256 amount,
        bytes32 hashLock
    );

    event Claimed(
        address indexed recipient,
        bytes secret
    );

    event Refunded(
        address indexed owner
    );

    constructor(
        address _token,
        address _recipient,
        uint256 _amount,
        bytes32 _hashLock,
        uint256 _lockTime
    ) {

        token = IERC20(_token);

        owner = msg.sender;

        recipient = _recipient;

        amount = _amount;

        hashLock = _hashLock;

        lockTime = _lockTime;

        startTime = block.timestamp;
    }

    function lock() external {

        require(msg.sender == owner, "Only owner");

        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        emit Locked(owner, recipient, amount, hashLock);
    }

   function claim(bytes calldata secret) external {
    // require(msg.sender == recipient, "Only recipient"); ❌ REMOVIDA PARA PERMITIR QUE O RELAYER CHAME

    require(!claimed, "Already claimed");
    require(!refunded, "Already refunded");

    require(
        sha256(secret) == hashLock,
        "Invalid secret"
    );

    claimed = true;

    // Perceba que o token AINDA VAI para o recipient gravado, 
    // não importa quem chamou a função!
    require(
        token.transfer(recipient, amount),
        "Transfer failed"
    );

    emit Claimed(recipient, secret);
}

    function refund() external {

        require(msg.sender == owner, "Only owner");

        require(!claimed, "Already claimed");

        require(!refunded, "Already refunded");

        require(
            block.timestamp >= startTime + lockTime,
            "Lock active"
        );

        refunded = true;

        require(
            token.transfer(owner, amount),
            "Transfer failed"
        );

        emit Refunded(owner);
    }

}