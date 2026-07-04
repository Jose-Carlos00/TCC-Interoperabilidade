import hre from "hardhat";
import { loadDeployments } from "../../utils/deployments.js";
import { loadSwap, updateSwap } from "../../utils/swap.js";

async function onLocked(
    owner: string,
    recipient: string,
    amount: bigint,
    hashLock: string
) {
    const { ethers } = await hre.network.getOrCreate();

    console.log("\n====================================");
    console.log("[RELAYER] LOCK EVENT");
    console.log("====================================");

    console.log("Owner     :", owner);
    console.log("Recipient :", recipient);
    console.log("Amount    :", ethers.formatUnits(amount, 18), "TOLO");
    console.log("HashLock  :", hashLock);

    updateSwap({
        status: "LOCKED"
    });

    console.log("\n[Next Step]");
    console.log("Deploy HTLC on destination chain.");
}

async function onClaimed(
    recipient: string,
    secret: string
) {
    console.log("\n====================================");
    console.log("[RELAYER] CLAIM EVENT");
    console.log("====================================");

    console.log("Recipient :", recipient);
    console.log("Secret    :", secret);

    updateSwap({
        secret,
        status: "CLAIMED"
    });

    console.log("\n[Next Step]");
    console.log("Execute claim on destination chain.");
}

async function onRefund(
    owner: string
) {
    console.log("\n====================================");
    console.log("[RELAYER] REFUND EVENT");
    console.log("====================================");

    console.log("Owner :", owner);

    updateSwap({
        status: "REFUNDED"
    });

    console.log("\nSwap cancelled.");
}

async function main() {

    console.log("====================================");
    console.log("Starting Cross-Chain Relayer...");
    console.log("====================================");

    const { ethers } = await hre.network.getOrCreate();

    const deployments = loadDeployments("amoy");

    if (!deployments.HTLC) {
        throw new Error("HTLC deployment not found.");
    }

    const htlc = await ethers.getContractAt(
        "HTLC",
        deployments.HTLC.address
    );

    console.log("Listening HTLC:", deployments.HTLC.address);
    console.log("Waiting events...\n");

    htlc.on(
        htlc.getEvent("Locked"),
        async (
            owner,
            recipient,
            amount,
            hashLock
        ) => {

            await onLocked(
                owner,
                recipient,
                amount,
                hashLock
            );

        }
    );

    htlc.on(
        htlc.getEvent("Claimed"),
        async (
            recipient,
            secret
        ) => {

            await onClaimed(
                recipient,
                secret
            );

        }
    );

    htlc.on(
        htlc.getEvent("Refunded"),
        async (
            owner
        ) => {

            await onRefund(
                owner
            );

        }
    );

    await new Promise(() => {});
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});