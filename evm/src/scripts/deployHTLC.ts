import hre from "hardhat";

import {
    loadDeployments,
    saveDeployment
} from "../../utils/deployments.js";

import {
    saveSwap
} from "../../utils/swap.js";

async function main() {

    const { ethers } = await hre.network.getOrCreate();

    const NETWORK = "amoy";

    console.log("====================================");
    console.log("Starting HTLC Deployment...");
    console.log("====================================");

    const deployments = loadDeployments(NETWORK);

    if (!deployments.TestToken) {
        throw new Error("TestToken not found.");
    }

    const token = deployments.TestToken.address;
    const [owner] = await ethers.getSigners();
    const recipient =
    owner.address;

    const amount =
        ethers.parseUnits("100", 18);

    const lockTime = 3600;

    // Gera Secret

    const secret =
        ethers.hexlify(
            ethers.randomBytes(32)
        );

    const hashLock =
        ethers.sha256(secret);

    console.log("\nSwap Information");

    console.log("-------------------------");

    console.log("Token     :", token);

    console.log("Recipient :", recipient);

    console.log("Amount    :", ethers.formatUnits(amount));

    console.log("Secret    :", secret);

    console.log("HashLock  :", hashLock);

    console.log("LockTime  :", lockTime);

    console.log("-------------------------");

    const HTLC =
        await ethers.getContractFactory("HTLC");

    const htlc =
        await HTLC.deploy(
            token,
            recipient,
            amount,
            hashLock,
            lockTime
        );

    await htlc.waitForDeployment();

    const address =
        await htlc.getAddress();

    saveDeployment(
        NETWORK,
        "HTLC",
        address
    );

  saveSwap({
    secret,
    hashLock,
    amount: amount.toString(),
    token,
    owner: owner.address,
    recipient,
    lockTime,
    network: NETWORK,
    htlc: address,
    createdAt: new Date().toISOString(),
    status: "CREATED"
});
console.log("\nSwap saved:");
console.log(JSON.stringify({
    secret,
    hashLock,
    amount: amount.toString(),
    recipient,
    lockTime
}, null, 4));
    console.log("\n====================================");

    console.log("HTLC deployed!");

    console.log("Address:", address);

    console.log("====================================");
}

main().catch((error) => {

    console.error(error);

    process.exitCode = 1;

});