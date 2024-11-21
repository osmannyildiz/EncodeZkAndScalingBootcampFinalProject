pragma circom 2.0.0;

include "./poseidon.circom";

template RiddleChecker() {
    var correct_answer_encoded_hashed = {ANSWER_ENCODED_HASHED};

    signal input guessed_answer_encoded;

    signal guessed_answer_encoded_hashed;
    component poseidon = Poseidon(1);
    poseidon.inputs[0] <== guessed_answer_encoded;
    guessed_answer_encoded_hashed <== poseidon.out;

    guessed_answer_encoded_hashed === correct_answer_encoded_hashed;
}

component main = RiddleChecker();
