import fs from "fs";
import path from "path";

export interface SwapData {
    secret?: string;

    hashLock?: string;

    amount?: string;

    token?: string;

    owner?: string;

    recipient?: string;

    lockTime?: number;

    network?: string;

    htlc?: string;

    createdAt?: string;

    status?: string;
}

const swapPath = path.join(
    process.cwd(),
    "storage",
    "swap.json"
);

export function loadSwap(): Partial<SwapData> {

    if (!fs.existsSync(swapPath)) {
        return {};
    }

    return JSON.parse(
        fs.readFileSync(swapPath, "utf8")
    );
}

export function saveSwap(data: Partial<SwapData>) {

    fs.writeFileSync(
        swapPath,
        JSON.stringify(data, null, 4)
    );
}

export function updateSwap(
    data: Partial<SwapData>
) {

    const current = loadSwap();

    saveSwap({
        ...current,
        ...data
    });

}