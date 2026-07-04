import hre from "hardhat";
import { loadSwap, updateSwap } from "../../utils/swap.js";

async function main() {
    const { ethers } = await hre.network.getOrCreate();

    console.log("====================================");
    console.log("Initiating HTLC Refund...");
    console.log("====================================");

    const swap = loadSwap();

    if (!swap.htlc) {
        throw new Error("Swap not initialized.");
    }

    const [owner] = await ethers.getSigners();

    const htlc = await ethers.getContractAt(
        "HTLC",
        swap.htlc
    );

    console.log(`HTLC Address : ${swap.htlc}`);
    console.log(`Caller       : ${owner.address}`);

    console.log("\nCalling refund()...");

    const refundTx = await htlc
        .connect(owner)
        .refund();

    console.log("Waiting confirmation...");

    await refundTx.wait();

    updateSwap({
        status: "REFUNDED"
    });

    console.log("✅ Refund completed!");
    console.log("Swap status updated to REFUNDED.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});