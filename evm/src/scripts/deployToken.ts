import hre from "hardhat";
import { saveDeployment } from "../../utils/deployments.js";

async function main() {

    const { ethers } = await hre.network.getOrCreate();

    console.log("====================================");
    console.log("Deploying Mysteries Token...");
    console.log("====================================");

    const TestToken = await ethers.getContractFactory("TestToken");

    const token = await TestToken.deploy();

    await token.waitForDeployment();

    const address = await token.getAddress();

    const owner = await token.owner();
    const totalSupply = await token.totalSupply();

    // Salva automaticamente o endereço do contrato
    saveDeployment("amoy", "TestToken", address);

    console.log("\nDeploy successful!");
    console.log("------------------------------------");
    console.log("Contract :", address);
    console.log("Owner    :", owner);
    console.log("Name     :", await token.name());
    console.log("Symbol   :", await token.symbol());
    console.log("Decimals :", await token.decimals());
    console.log(
        "Supply   :",
        ethers.formatUnits(totalSupply, 18),
        "TOLO"
    );
    console.log("------------------------------------");
    console.log("Deployment saved in deployments/localhost.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});