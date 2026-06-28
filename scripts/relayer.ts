import hre from "hardhat";
import { loadDeployments } from "../utils/deployments.js";

async function main() {
    console.log("====================================");
    console.log("Starting Cross-Chain Relayer...");
    console.log("====================================");

    const { ethers } = await hre.network.getOrCreate();

    // 1. Carrega o endereço do HTLC
   const deployments = loadDeployments("amoy");
    if (!deployments.HTLC || !deployments.HTLC.address) {
        throw new Error("HTLC not found in deployments. Run deployHTLC.ts first.");
    }
    const htlcAddress = deployments.HTLC.address;
    console.log(`[Relayer] Listening to HTLC at: ${htlcAddress}\n`);

    // 2. Conecta ao contrato HTLC
    const HTLC = await ethers.getContractFactory("HTLC");
    const htlc = HTLC.attach(htlcAddress);

    // 3. Configura os ouvintes de eventos exatamente como estão no HTLC.sol
    console.log("[Relayer] Waiting for events... (Press Ctrl+C to stop)");

    // Evento Locked(address indexed owner, address indexed recipient, uint256 amount, bytes32 hashLock)
    htlc.on(htlc.getEvent("Locked"), (owner, recipient, amount, hashLock, event) => {
        console.log("\n🔗 [EVENT: Locked Detected]");
        console.log(`   Owner:     ${owner}`);
        console.log(`   Recipient: ${recipient}`);
        console.log(`   Amount:    ${ethers.formatUnits(amount, 18)} TOLO`);
        console.log(`   HashLock:  ${hashLock}`);
        
        console.log("   -> Relayer Action: Ready to mint/lock on destination chain!");
    });

    // Evento Claimed(address indexed recipient, bytes secret)
    htlc.on(htlc.getEvent("Claimed"), (recipient, secret, event) => {
        console.log("\n🔓 [EVENT: Claimed Detected]");
        console.log(`   Recipient: ${recipient}`);
        console.log(`   Secret:    ${secret}`); 
        
        console.log("   -> Relayer Action: Secret captured! Ready to claim on origin chain.");
    });

    // Evento Refunded(address indexed owner)
    htlc.on(htlc.getEvent("Refunded"), (owner, event) => {
        console.log("\n↩️ [EVENT: Refunded Detected]");
        console.log(`   Owner: ${owner}`);
        
        console.log("   -> Relayer Action: Transaction canceled/refunded.");
    });

    // Mantém o script rodando infinitamente
    await new Promise(() => {});
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});