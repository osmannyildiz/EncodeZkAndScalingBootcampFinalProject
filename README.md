# Riddle Generator (Encode Club ZK & Scaling Bootcamp Final Project)

Riddle Generator lets its users create riddle puzzles. In summary: The riddler runs the program and enters the question and answer. Then the program generates the files necessary for making a guess. Then the guessers can try to find the answer, and if they succeed, they will have a witness file in the end. The riddler can then verify the witness file with the verification key.

This project aims to make it possible for users to enjoy ZK without the knowledge barriers. It orchestrates Circom and SnarkJS behind the hood, even performing a simple Groth16 ceremony. The successful guesser can publicly share the generated witness file without revealing the answer, proving they were the first one to solve the riddle.

## Buidlers

- [ahalsudev](https://github.com/ahalsudev)
- [osmannyildiz](https://github.com/osmannyildiz)
- [raahil190](https://github.com/raahil190)

## How To Use

### Prerequisites

- Circom
- snarkJS

Find the installation instructions [here](https://docs.circom.io/getting-started/installation/).

### Installation

```sh
# Clone the repo and cd into it
cd riddle_generator
npm install
```

### Generate a ZK-powered riddle

```sh
npm start
```

### Answer the riddle

```sh
cd dist
npm start
```

### Verify witness file

`TODO`: We'll add a script to automate this. For now you can do it manually:

```sh
cd ..
snarkjs groth16 prove circom/ceremony/riddle_checker_0001.zkey dist/witness.wtns proof.json public.json
snarkjs groth16 verify circom/ceremony/verification_key.json public.json proof.json
```
