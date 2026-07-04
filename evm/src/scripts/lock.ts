import hre from "hardhat";
import { loadSwap, updateSwap } from "../../utils/swap.js";

async function main() {
    const { ethers } = await hre.network.getOrCreate();

    console.log("====================================");
    console.log("Initiating HTLC Lock Transaction...");
    console.log("====================================");

    // 1. Carrega as informações do swap
    const swap = loadSwap();

    if (!swap.token || !swap.htlc || !swap.amount) {
        throw new Error(
            "Swap not initialized! Run deployHTLC.ts first."
        );
    }

    const tokenAddress = swap.token;
    const htlcAddress = swap.htlc;
    const amount = BigInt(swap.amount);

    // 2. Conecta aos contratos
    const token = await ethers.getContractAt(
        "TestToken",
        tokenAddress
    );

    const htlc = await ethers.getContractAt(
        "HTLC",
        htlcAddress
    );

    console.log(
        `Amount to lock: ${ethers.formatUnits(amount, 18)} TOLO`
    );

    // 3. Aprovação
    console.log("\n1. Approving tokens for HTLC...");

    const approveTx = await token.approve(
        htlcAddress,
        amount
    );

    await approveTx.wait();

    console.log("✅ Tokens approved!");

    // 4. Lock
    console.log("\n2. Calling lock() on HTLC...");

    const lockTx = await htlc.lock();

    await lockTx.wait();

    console.log("✅ Funds locked successfully in HTLC!");

    // 5. Atualiza o estado do swap
    updateSwap({
        status: "LOCKED"
    });

    console.log("\nSwap status updated to LOCKED.");

    console.log("\n====================================");
    console.log("Transaction Complete!");
    console.log("Relayer can now observe the Locked event.");
    console.log("====================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});