// Adapted from generate_witness.js

const fs = require("fs");
const readline = require("readline");
const wc = require("./witness_calculator.js");

function encodeString(str) {
  return BigInt(
    str
      .split("")
      .map((char) => char.charCodeAt(0))
      .join("")
  );
}

async function startLoop() {
  console.log("====================");
  console.log("🐸 HERE IS A RIDDLE:");
  console.log("{QUESTION}");
  console.log("====================\n");

  const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let finished = false;
  while (true) {
    // Take answer from console
    const answer = await new Promise((resolve) => {
      reader.question("👉 Enter your answer: ", resolve);
    });

    // Encode the answer
    const answerEncoded = encodeString(answer);

    // Prepare input object
    const input = {
      guessed_answer_encoded: answerEncoded,
    };

    // Try creating the witness
    try {
      const buffer = fs.readFileSync("riddle_checker.wasm");
      const witnessCalculator = await wc(buffer);
      try {
        const w = await witnessCalculator.calculateWitness(input, 0);
        const buff = await witnessCalculator.calculateWTNSBin(input, 0);

        fs.writeFile("witness.wtns", buff, function (err) {
          if (err) throw err;
        });

        console.log(
          "✅ Congrats! Now you can share your 'witness.wtns' file and brag."
        );
        finished = true;
      } catch (error) {
        console.log("❌ Nope, not the right answer. Try again.\n");
      }
    } catch (error) {
      console.log("❌ Oops, something went wrong. Bad luck maybe.\n");
    }

    // If correct answer is found, exit
    if (finished) break;
  }

  reader.close();
}

if (process.argv.length != 2) {
  console.log("Usage: npm run start");
} else {
  startLoop();
}
