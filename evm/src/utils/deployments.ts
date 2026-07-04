import fs from "fs";
import path from "path";

export interface DeploymentInfo {
    address: string;
    network: string;
    deployedAt: string;
}

export interface DeploymentData {
    [contractName: string]: DeploymentInfo;
}

function getDeploymentPath(network: string): string {
    return path.join(
        process.cwd(),
        "deployments",
        `${network}.json`
    );
}

export function loadDeployments(network: string): DeploymentData {

    const file = getDeploymentPath(network);

    if (!fs.existsSync(file)) {
        return {};
    }

    return JSON.parse(
        fs.readFileSync(file, "utf8")
    );
}

export function saveDeployment(
    network: string,
    contractName: string,
    address: string
) {

    const deployments = loadDeployments(network);

    deployments[contractName] = {
        address,
        network,
        deployedAt: new Date().toISOString()
    };

    fs.writeFileSync(
        getDeploymentPath(network),
        JSON.stringify(deployments, null, 4)
    );
}