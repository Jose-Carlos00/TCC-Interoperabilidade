import hre from "hardhat";
import { loadDeployments } from "../utils/deployments.js";

async function main() {
    const { ethers } = await hre.network.getOrCreate();

    console.log("====================================");
    console.log("Initiating HTLC Claim Transaction...");
    console.log("====================================");

    // 1. Carrega o endereço do HTLC na Amoy
    const deployments = loadDeployments("amoy");
    if (!deployments.HTLC) {
        throw new Error("HTLC deployment not found!");
    }
    const htlcAddress = deployments.HTLC.address;

    // 2. Pega a conta configurada no seu .env
    const [caller] = await ethers.getSigners();

    // 3. Conecta ao contrato HTLC
    const htlc = await ethers.getContractAt("HTLC", htlcAddress);

    // 4. Configura o Segredo gerado no deploy da Amoy
    const secret = "0xa4dca72c4a1e62cab8ae30bc09a5634b151401260fe67913e9f617df345db4cf";

    console.log(`Sending claim transaction from: ${caller.address}`);
    console.log(`Revealing Secret: ${secret}`);

    // 5. Executa o Claim utilizando a sua carteira principal do .env
    console.log("\nCalling claim() on HTLC...");
    const claimTx = await htlc.connect(caller).claim(secret);
    
    console.log("Waiting for network confirmation...");
    await claimTx.wait();

    console.log("✅ Funds claimed successfully!");
    console.log("\n====================================");
    console.log("Transaction Complete! Check the Relayer terminal.");
    console.log("====================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});