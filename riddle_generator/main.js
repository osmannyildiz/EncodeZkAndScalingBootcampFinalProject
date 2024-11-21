const circomlibjs = require("circomlibjs");
const fs = require("fs");
const fsExtra = require("fs-extra");
const readline = require("readline");

function encodeString(str) {
  return BigInt(
    str
      .split("")
      .map((char) => char.charCodeAt(0))
      .join("")
  );
}

async function generateRiddle() {
  // Take question and answer from console
  const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const question = await new Promise((resolve) => {
    reader.question("Enter the riddle question: ", resolve);
  });
  const answer = await new Promise((resolve) => {
    reader.question("Enter the riddle answer: ", resolve);
  });
  reader.close();

  // Encode the answer
  const answerEncoded = encodeString(answer);

  // Hash the encoded answer
  const poseidon = await circomlibjs.buildPoseidon();
  const answerEncodedHashed = poseidon.F.toString(poseidon([answerEncoded]));

  // Prepare folders
  fs.rmSync("circom", { recursive: true, force: true });
  fsExtra.copySync("circom_tmpl", "circom");
  fs.rmSync("dist", { recursive: true, force: true });
  fsExtra.copySync("dist_tmpl", "dist");

  // Replace hash in circuit
  const circuitPath = "circom/riddle_checker.circom";
  let circuitContent = fs.readFileSync(circuitPath, "utf8");
  circuitContent = circuitContent.replace(
    "{ANSWER_ENCODED_HASHED}",
    answerEncodedHashed
  );
  fs.writeFileSync(circuitPath, circuitContent);

  // Replace question in dist/main.js
  const programPath = "dist/main.js";
  let programContent = fs.readFileSync(programPath, "utf8");
  programContent = programContent.replace("{QUESTION}", question);
  fs.writeFileSync(programPath, programContent);

  // Compile the circuit
  const { execSync } = require("child_process");
  execSync("cd circom && circom riddle_checker.circom --r1cs --wasm --sym", {
    stdio: "inherit",
  });

  // Copy generated files to dist folder
  fs.copyFileSync(
    "circom/riddle_checker_js/riddle_checker.wasm",
    "dist/riddle_checker.wasm"
  );

  // Run the ceremony commands
  execSync(
    "cd circom/ceremony && snarkjs powersoftau new bn128 12 pot12_0000.ptau",
    { stdio: "inherit" }
  );
  execSync(
    'cd circom/ceremony && snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution"',
    { stdio: "inherit" }
  );
  execSync(
    "cd circom/ceremony && snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau",
    { stdio: "inherit" }
  );
  execSync(
    "cd circom/ceremony && snarkjs groth16 setup ../riddle_checker.r1cs pot12_final.ptau riddle_checker_0000.zkey",
    { stdio: "inherit" }
  );
  execSync(
    'cd circom/ceremony && snarkjs zkey contribute riddle_checker_0000.zkey riddle_checker_0001.zkey --name="1st Contributor Name"',
    { stdio: "inherit" }
  );
  execSync(
    "cd circom/ceremony && snarkjs zkey export verificationkey riddle_checker_0001.zkey verification_key.json",
    { stdio: "inherit" }
  );

  console.log(
    "✅ Success! Now you can share the 'dist' folder and challenge people to solve your riddle."
  );
}

generateRiddle();
