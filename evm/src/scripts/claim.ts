import hre from "hardhat";
import { loadSwap, updateSwap } from "../../utils/swap.js";

async function main() {
    const { ethers } = await hre.network.getOrCreate();

    console.log("====================================");
    console.log("Initiating HTLC Claim Transaction...");
    console.log("====================================");

    // 1. Carrega as informações do swap
    const swap = loadSwap();

    if (!swap.htlc || !swap.secret) {
        throw new Error(
            "Swap not initialized! Run deployHTLC.ts first."
        );
    }

    const htlcAddress = swap.htlc;
    const secret = swap.secret;

    // 2. Conta que executará o claim
    const [caller] = await ethers.getSigners();

    // 3. Conecta ao contrato HTLC
    const htlc = await ethers.getContractAt(
        "HTLC",
        htlcAddress
    );

    console.log(`HTLC Address : ${htlcAddress}`);
    console.log(`Caller       : ${caller.address}`);
    console.log(`Secret       : ${secret}`);

    // 4. Executa o claim
    console.log("\nCalling claim() on HTLC...");

    const claimTx = await htlc
        .connect(caller)
        .claim(secret);

    console.log("Waiting for network confirmation...");

    await claimTx.wait();

    // 5. Atualiza o estado do swap
    updateSwap({
        status: "CLAIMED"
    });

    console.log("✅ Funds claimed successfully!");

    console.log("\nSwap status updated to CLAIMED.");

    console.log("\n====================================");
    console.log("Transaction Complete!");
    console.log("====================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});