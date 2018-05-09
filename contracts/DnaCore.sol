pragma solidity ^0.4.21;

contract DnaCore {

  uint256 private DNA_DIGIT = 23;
  uint256 private PROFICIENCY_DIGIT = 3;
  uint256 private PERSONALITY_DIGIT = 6;

  uint256 internal DNA_LIMIT = 10**DNA_DIGIT;
  uint256 private DNA_CUTOFF = 10**(PERSONALITY_DIGIT + 1);

  uint256 private PROFICIENCY_LIMIT = 10**PROFICIENCY_DIGIT;
  // Talented >> Fast-learner >> Clumsy > Procastinator > None
  uint256[] internal PROFICIENCY_THRESHOLD = [25, 100, 175, 200, 300];

  uint256 private PERSONALITY_LIMIT = 10**PERSONALITY_DIGIT;
  // Sanguine >> choleric >> melancholic >> phlegmatic
  uint256[] internal PERSONALITY_THRESHOLD = [150, 200, 300, 350];


  function _interpretThreshold(uint32 _val, uint256[] threshold) private pure returns (uint32) {
    // 5 Proficiency type with *Talented* and *Fats-learner* as 'rare' trait.
    uint cumulative = 0;
    for (uint i = 0; i < threshold.length; i++) {
      uint currThreshold = threshold[i];
      if (_val < cumulative + currThreshold) {
        return uint32(i);
      }
      cumulative += currThreshold;
    }
    return uint32(threshold.length - 1);
  }

  function _interpretPersonality(uint8[] quizzes, uint32 _personality) private view returns (uint32) {
    // quizes will contribute to each threshold.
    uint[] memory updatedThreshold = PERSONALITY_THRESHOLD;
    uint count = 0;
    for (uint i = 0; i < quizzes.length; i++) {
      count += quizzes[i];
    }

    uint nudge = 10 * (quizzes.length - 1);
    if (count > 0 && count < quizzes.length) {
      // Need to update the threshold by a bit.
      for (i = 0; i < quizzes.length; i++) {
        uint denom = quizzes.length * quizzes[i];
        denom = denom - count;
        updatedThreshold[i] += nudge / denom;
      }
    }

    return _interpretThreshold(_personality, updatedThreshold);
  }

  function _interpretProficiency(uint8[] quizzes, uint32 _proficiency) private view returns (uint32) {
    // quizes will contribute to each threshold.
    uint[] memory updatedThreshold = PROFICIENCY_THRESHOLD;
    uint count = 0;
    for (uint i = 0; i < quizzes.length; i++) {
      count += quizzes[i];
    }

    uint nudge = 10 * (quizzes.length - 1);
    if (count > 0 && count < quizzes.length) {
      // Need to update the threshold by a bit.
      for (i = 0; i < quizzes.length; i++) {
        uint denom = quizzes.length * quizzes[i];
        denom = denom - count;
        updatedThreshold[i] += nudge / denom;
      }
    }

    return _interpretThreshold(_proficiency, updatedThreshold);
  }

  function _generateRandomTraits(uint8[] _quizzes,
                                  string _name,
                                  address _owner)
                                internal view returns (uint256 dna,
                                                      uint32 proficiency,
                                                      uint32 personality){
    uint256 nameRandomness = uint(keccak256(now, _owner, _name));
    uint256 ownerRandomness = uint(keccak256(now, _owner));

    uint256 traitRandomness = uint(keccak256(nameRandomness, ownerRandomness));
    dna = traitRandomness % DNA_LIMIT;
    if (dna / (10**(DNA_DIGIT - 1)) == 0) {
      dna += 10**(DNA_DIGIT - 1);
    }

    // Interpret each DNA component.
    proficiency = uint32(dna % PROFICIENCY_LIMIT);
    personality = uint32(dna % PERSONALITY_LIMIT / (PERSONALITY_LIMIT / PROFICIENCY_LIMIT));

    proficiency = _interpretThreshold(proficiency, PROFICIENCY_THRESHOLD);
    personality = _interpretPersonality(_quizzes, personality);

    dna = dna / DNA_CUTOFF;
  }

  function _combineTwoTraits(uint256 dna,
                             uint32 proficiency,
                             uint32 personality,
                             uint256 otherDna,
                             uint32 otherProficiency,
                             uint32 otherPersonality,
                             address _owner)
                             internal view returns (uint256 newDna,
                                                   uint32 newProficiency,
                                                   uint32 newPersonality) {
    // TODO
    uint256 ownerRandomness = uint(keccak256(now, _owner));

    newDna = (dna + otherDna) / 2;
    uint8[] memory personalityQuizzes = new uint8[](PERSONALITY_THRESHOLD.length);
    personalityQuizzes[personality] = 1;
    personalityQuizzes[otherPersonality] = 1;

    newProficiency = uint32(ownerRandomness % PROFICIENCY_LIMIT);
    newPersonality = uint32(ownerRandomness % PERSONALITY_LIMIT / (PERSONALITY_LIMIT / PROFICIENCY_LIMIT));

    uint8[] memory proficiencyQuizzes = new uint8[](PROFICIENCY_THRESHOLD.length);
    proficiencyQuizzes[proficiency] = 1;
    proficiencyQuizzes[otherProficiency] = 1;

    newPersonality = _interpretPersonality(personalityQuizzes, newPersonality);
    newProficiency = _interpretProficiency(proficiencyQuizzes, newProficiency);
  }
}
