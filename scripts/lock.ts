import hre from "hardhat";
import { loadDeployments } from "../utils/deployments.js";

async function main() {
    const { ethers } = await hre.network.getOrCreate();

    console.log("====================================");
    console.log("Initiating HTLC Lock Transaction...");
    console.log("====================================");

    // 1. Carrega os endereços do JSON
    const deployments = loadDeployments("amoy");
    if (!deployments.TestToken || !deployments.HTLC) {
        throw new Error("Deployments not found! Run deployToken and deployHTLC first.");
    }

    const tokenAddress = deployments.TestToken.address;
    const htlcAddress = deployments.HTLC.address;

    // 2. Conecta aos contratos usando getContractAt
    const token = await ethers.getContractAt("TestToken", tokenAddress);
    const htlc = await ethers.getContractAt("HTLC", htlcAddress);

    // 3. Lê o valor exato que o HTLC está esperando (definido no deploy)
    const amount = await htlc.amount();
    console.log(`Amount to lock: ${ethers.formatUnits(amount, 18)} TOLO`);

    // 4. Etapa de Aprovação (Approve)
    console.log("\n1. Approving tokens for HTLC...");
    const approveTx = await token.approve(htlcAddress, amount);
    await approveTx.wait();
    console.log("✅ Tokens approved!");

    // 5. Etapa de Trancamento (Lock)
    console.log("\n2. Calling lock() on HTLC...");
    const lockTx = await htlc.lock();
    await lockTx.wait();
    console.log("✅ Funds locked successfully in HTLC!");

    console.log("\n====================================");
    console.log("Transaction Complete! Look at your Relayer terminal now.");
    console.log("====================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});