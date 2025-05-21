import {
  ConnectButton,
  useCurrentAccount,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { useSuiClient } from "@mysten/dapp-kit";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Card,
  Separator,
} from "@radix-ui/themes";
import { WalletStatus } from "./WalletStatus";
import { useState } from "react";
import KtpOcr from "./ocr";
// import * as snarkjs from "snarkjs";
// @ts-ignore
import witnessCalculatorBuilder from "./witness_calculator.js";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import BlobImage from "./BlobImage.js";
function App() {
  const [isProofValid, setIsProofValid] = useState(false);
  const [proof, setProof] = useState(null);
  const [publicSignals, setPublicSignals] = useState(null);
  const [error, setError] = useState<String | null>(null);
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransaction();
  const [mintStatus, setMintStatus] = useState("");
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const wasmPath = "/circuits/main.wasm";
  const zkeyPath = "/circuits/main_final.zkey";

  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        align="center"
        style={{
          borderBottom: "1px solid var(--gray-a3)",
          backgroundColor: "white",
          zIndex: 1000,
        }}
      >
        <Box>
          <Heading size="4" color="blue">
            SuiAge
          </Heading>
        </Box>
        <Box>
          <ConnectButton />
        </Box>
      </Flex>

      <Container size="2" pt="5">
        <Card variant="surface" style={{ backgroundColor: "var(--gray-a2)" }}>
          <Box p="4">
            {/* <WalletStatus /> */}
            {/* <Separator my="4" /> */}
            <Text className="text-center text-lg font-semibold text-blue-500">
              Verify your ID and mint NFT
            </Text>

            <KtpOcr
              onExtractBirthdate={async (dob) => {
                const year = dob?.split("-").find((part) => part.length === 4);
                if (!year) {
                  setIsProofValid(false);
                  setError("Year not found in date of birth.");
                  return;
                }

                try {
                  setError(null);
                  setProof(null);
                  setPublicSignals(null);

                  // const input = {
                  //   birthYear: Number(year),
                  //   currentYear: Number(new Date().getFullYear()),
                  // };

                  // const [wasmBuffer, zkeyBuffer] = await Promise.all([
                  //   fetch(wasmPath).then((res) => res.arrayBuffer()),
                  //   fetch(zkeyPath).then((res) => res.arrayBuffer()),
                  // ]);

                  // const witnessCalculator =
                  //   await witnessCalculatorBuilder(wasmBuffer);
                  // const witnessBuffer =
                  //   await witnessCalculator.calculateWTNSBin(input, 0);

                  // const { proof, publicSignals } = await snarkjs.groth16.prove(
                  //   new Uint8Array(zkeyBuffer),
                  //   witnessBuffer,
                  // );

                  // const vk = await fetch(
                  //   "/circuits/verification_key.json",
                  // ).then((res) => res.json());
                  // const isValid = await snarkjs.groth16.verify(
                  //   vk,
                  //   publicSignals,
                  //   proof,
                  // );
                  const response = await fetch(
                    `https://zk-backend-vnjz.shuttle.app/generate-proof?birth_year=${year}`,
                    {
                      method: "GET",
                      headers: { "Content-Type": "application/json" },
                    },
                  );
                  const data = await response.json();

                  const txb = new Transaction();
                  function hexToBytes(hex: string): number[] {
                    if (hex.startsWith("0x")) hex = hex.slice(2);
                    if (hex.length % 2 !== 0)
                      throw new Error("Invalid hex string");
                    const bytes = [];
                    for (let i = 0; i < hex.length; i += 2) {
                      bytes.push(parseInt(hex.slice(i, i + 2), 16));
                    }
                    return bytes;
                  }

                  txb.moveCall({
                    target: `0x26e9d78ad667a57e0294b8e18bced4715b3b663becd7e88da2d42e24e9684b38::nft::mint_nft`,
                    arguments: [
                      txb.pure.string("SuiAge"),
                      txb.pure.string("You are verified as 18+"),
                      txb.pure.string(
                        "https://aggregator.walrus-testnet.walrus.space/v1/blobs/YdYyvSj3r70JuoWw_5lNuhMd8pWvMug7CwL55oO3d40",
                      ),
                      txb.pure.vector("u8", hexToBytes(data.verifying_key)),
                      txb.pure.vector("u8", hexToBytes(data.proof)),
                      txb.pure.vector("u8", hexToBytes(data.public_inputs)),
                    ],
                  });
                  console.log("vk", data.verifying_key);
                  console.log("proof", data.proof);
                  console.log("public", data.public_inputs);
                  const result = await suiClient.devInspectTransactionBlock({
                    sender: account?.address as string,
                    transactionBlock: txb,
                  });
                  console.log(result);
                  signAndExecuteTransactionBlock(
                    {
                      transaction: txb,
                    },
                    {
                      onSuccess: (result) => {
                        console.log("success");
                        setIsProofValid(true);
                        setMintStatus(`Digest: ${result.digest}`);
                      },
                      onError: (err) => {
                        console.error(err);
                        setMintStatus("❌ Proof failed.");
                      },
                    },
                  );

                  console.log(data);

                  setProof(proof);
                  setPublicSignals(publicSignals);

                  // // ... (you can retain the proof serialization logic if needed)
                  // function toHex32BE(str: string | number | bigint | boolean) {
                  //   return BigInt(str).toString(16).padStart(64, "0");
                  // }

                  // function toLEHex32(str: string | number | bigint | boolean) {
                  //   const hex = BigInt(str).toString(16).padStart(64, "0");
                  //   const bytes = hex.match(/../g)?.reverse();
                  //   return bytes?.join("");
                  // }

                  // const proofHexParts = [
                  //   toHex32BE(proof.pi_a[0]),
                  //   toHex32BE(proof.pi_a[1]),
                  //   toHex32BE(proof.pi_b[0][1]),
                  //   toHex32BE(proof.pi_b[0][0]),
                  //   toHex32BE(proof.pi_b[1][1]),
                  //   toHex32BE(proof.pi_b[1][0]),
                  //   toHex32BE(proof.pi_c[0]),
                  //   toHex32BE(proof.pi_c[1]),
                  // ];

                  // const proofHex = proofHexParts.join("");
                  // function decToUint8Array(
                  //   dec: string | number | bigint | boolean,
                  // ) {
                  //   let hex = BigInt(dec).toString(16);
                  //   if (hex.length % 2) hex = "0" + hex;

                  //   const raw = new Uint8Array(hex.length / 2);
                  //   for (let i = 0; i < raw.length; i++) {
                  //     raw[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
                  //   }

                  //   // Pad to 32 bytes on the left (big endian)
                  //   if (raw.length < 32) {
                  //     const padded = new Uint8Array(32);
                  //     padded.set(raw, 32 - raw.length);
                  //     return padded;
                  //   }

                  //   return raw;
                  // }

                  // function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
                  //   const totalLength = arrays.reduce(
                  //     (sum, arr) => sum + arr.length,
                  //     0,
                  //   );
                  //   const result = new Uint8Array(totalLength);
                  //   let offset = 0;
                  //   for (const arr of arrays) {
                  //     result.set(arr, offset);
                  //     offset += arr.length;
                  //   }
                  //   return result;
                  // }

                  // const out = [];

                  // // vk_alpha_1
                  // out.push(decToUint8Array(vk.vk_alpha_1[0]));
                  // out.push(decToUint8Array(vk.vk_alpha_1[1]));

                  // // vk_beta_2
                  // for (let i = 0; i < 2; i++) {
                  //   out.push(decToUint8Array(vk.vk_beta_2[i][0]));
                  //   out.push(decToUint8Array(vk.vk_beta_2[i][1]));
                  // }

                  // // vk_gamma_2
                  // for (let i = 0; i < 2; i++) {
                  //   out.push(decToUint8Array(vk.vk_gamma_2[i][0]));
                  //   out.push(decToUint8Array(vk.vk_gamma_2[i][1]));
                  // }

                  // // vk_delta_2
                  // for (let i = 0; i < 2; i++) {
                  //   out.push(decToUint8Array(vk.vk_delta_2[i][0]));
                  //   out.push(decToUint8Array(vk.vk_delta_2[i][1]));
                  // }

                  // // IC (G1 points)
                  // for (const pt of vk.IC) {
                  //   out.push(decToUint8Array(pt[0]));
                  //   out.push(decToUint8Array(pt[1]));
                  // }

                  // const vkBytes = concatUint8Arrays(out);

                  // // Optional: Convert to hex for debug
                  // const hex = Array.from(vkBytes)
                  //   .map((b) => b.toString(16).padStart(2, "0"))
                  //   .join("");
                  // console.log("Compressed VK (hex):", hex, vkBytes);

                  // const publicSignalsHex = publicSignals
                  //   .map(toLEHex32)
                  //   .join("");

                  // console.log(proofHex, publicSignalsHex);
                } catch (err) {
                  console.error(err);
                  setError("Failed to generate proof");
                  setIsProofValid(false);
                }
              }}
            />

            <Box mt="5">
              {error && (
                <Text color="red" size="2">
                  ⚠️ Error: {error}
                </Text>
              )}

              {isProofValid && (
                <Box mt="4">
                  <Heading size="3">🎉 Age Verified Access</Heading>
                  <Text size="2" mt="2">
                    Congratulations! You are have minted SuiAge successfully
                  </Text>
                  <Separator my="2" />
                  <Text size="2" mt="2">
                    {mintStatus}
                  </Text>

                  <BlobImage blobId="YdYyvSj3r70JuoWw_5lNuhMd8pWvMug7CwL55oO3d40" />
                </Box>
              )}
            </Box>
          </Box>
        </Card>
      </Container>
    </>
  );
}

export default App;
