import hre from "hardhat";
import { loadDeployments, saveDeployment } from "../utils/deployments.js";

async function main() {
    const { ethers } = await hre.network.getOrCreate();

    console.log("====================================");
    console.log("Starting HTLC Deployment Process...");
    console.log("====================================");

    // 1. Carrega o endereço do TestToken gerado no deploy anterior
    const deployments = loadDeployments("localhost");
    
    if (!deployments.TestToken || !deployments.TestToken.address) {
        throw new Error("TestToken deployment not found in localhost.json! Please deploy the token first.");
    }

    const tokenAddress = deployments.TestToken.address;
    console.log(`Using TestToken found at: ${tokenAddress}`);

    // 2. Configurações Iniciais e Criptografia
    const randomSecret = ethers.randomBytes(32);
    const secretHex = ethers.hexlify(randomSecret);
    const hashLock = ethers.sha256(secretHex);

    // Pegamos as contas locais do Hardhat para definir um destinatário de teste
    const [deployer, recipientSigner] = await ethers.getSigners();
    
    // Parâmetros exigidos pelo seu construtor HTLC:
    const token = tokenAddress;                             // _token
    const recipient ="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"            // _recipient (segunda conta do Hardhat)
    const amount = ethers.parseUnits("100", 18);            // _amount (100 tokens de teste)
    const lockTime = Math.floor(Date.now() / 1000) + 3600;  // _lockTime (Tempo atual + 1 hora em segundos)

    console.log("------------------------------------");
    console.log("Constructor Arguments:");
    console.log("1. Token Address:", token);
    console.log("2. Recipient:    ", recipient);
    console.log("3. Amount:       ", amount.toString());
    console.log("4. HashLock:     ", hashLock);
    console.log("5. LockTime:     ", lockTime, "(Unix Timestamp)");
    console.log("\n* Secret (Save this for later claim):", secretHex);
    console.log("------------------------------------");

    // 3. Deploy do contrato HTLC passando os 5 argumentos esperados
    const HTLC = await ethers.getContractFactory("HTLC");
    
    console.log("Deploying HTLC Contract with arguments...");
    const htlc = await HTLC.deploy(
        token, 
        recipient, 
        amount, 
        hashLock, 
        lockTime
    ); 
    
    await htlc.waitForDeployment();
    const htlcAddress = await htlc.getAddress();

    // 4. Salva automaticamente o endereço do HTLC no JSON
   saveDeployment("amoy", "HTLC", htlcAddress);

    console.log("\n====================================");
    console.log("HTLC Deploy successful!");
    console.log("------------------------------------");
    console.log("HTLC Contract Address:", htlcAddress);
    console.log("Deployment saved in deployments/localhost.json");
    console.log("====================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});